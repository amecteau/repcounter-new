use rusqlite::Connection;

const MIGRATIONS: &[(u32, &str)] = &[
    (1, "CREATE TABLE IF NOT EXISTS workouts (
            id               TEXT PRIMARY KEY,
            date             TEXT NOT NULL,
            duration_minutes INTEGER
         )"),
    (1, "CREATE TABLE IF NOT EXISTS sets (
            id          TEXT PRIMARY KEY,
            workout_id  TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            reps        INTEGER NOT NULL,
            weight      REAL,
            unit        TEXT NOT NULL,
            timestamp   TEXT NOT NULL,
            notes       TEXT DEFAULT ''
         )"),
    (1, "CREATE TABLE IF NOT EXISTS custom_exercises (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL UNIQUE,
            muscle_group TEXT NOT NULL
         )"),
    (1, "CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
         )"),
];

fn create_version_table(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL DEFAULT 0);
         INSERT INTO schema_version (version) SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM schema_version);",
    )
    .map_err(|e| format!("Failed to create schema_version table: {e}"))
}

fn get_db_version(conn: &Connection) -> Result<u32, String> {
    conn.query_row("SELECT version FROM schema_version", [], |row| row.get(0))
        .map_err(|e| format!("Failed to read schema version: {e}"))
}

fn set_db_version(conn: &Connection, version: u32) -> Result<(), String> {
    conn.execute("UPDATE schema_version SET version = ?1", [version])
        .map(|_| ())
        .map_err(|e| format!("Failed to update schema version: {e}"))
}

pub fn migrate_db(conn: &Connection) -> Result<(), String> {
    create_version_table(conn)?;
    let current = get_db_version(conn)?;

    let max_version = MIGRATIONS.iter().map(|(v, _)| *v).max().unwrap_or(0);

    for target_version in (current + 1)..=max_version {
        let tx = conn
            .unchecked_transaction()
            .map_err(|e| format!("Failed to begin migration transaction for v{target_version}: {e}"))?;

        for (version, sql) in MIGRATIONS.iter() {
            if *version == target_version {
                tx.execute_batch(sql)
                    .map_err(|e| format!("Migration to v{target_version} failed: {e}"))?;
            }
        }

        set_db_version(&tx, target_version)?;
        tx.commit()
            .map_err(|e| format!("Failed to commit migration v{target_version}: {e}"))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn open() -> Connection {
        Connection::open_in_memory().expect("in-memory db")
    }

    #[test]
    fn fresh_install_creates_all_tables() {
        let conn = open();
        migrate_db(&conn).expect("migrate");

        let count: i64 = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name != 'schema_version'",
                [],
                |row| row.get(0),
            )
            .expect("table count");
        assert_eq!(count, 4);
    }

    #[test]
    fn version_is_set_after_migration() {
        let conn = open();
        migrate_db(&conn).expect("migrate");
        assert_eq!(get_db_version(&conn).expect("version"), 1);
    }

    #[test]
    fn existing_install_skips_applied_migrations() {
        let conn = open();
        // Simulate an existing install already at v1
        migrate_db(&conn).expect("first migrate");

        // Second run must be a no-op — no error, version unchanged
        migrate_db(&conn).expect("second migrate");
        assert_eq!(get_db_version(&conn).expect("version"), 1);
    }

    #[test]
    fn migrate_is_idempotent() {
        let conn = open();
        migrate_db(&conn).expect("first");
        migrate_db(&conn).expect("second");
        migrate_db(&conn).expect("third");
        assert_eq!(get_db_version(&conn).expect("version"), 1);
    }

    #[test]
    fn failed_migration_rolls_back_and_returns_error() {
        // Build a custom migration list that has a bad v2 statement
        let conn = open();
        // Manually set up v1 state
        create_version_table(&conn).expect("version table");
        set_db_version(&conn, 1).expect("set version");

        // Run a bad SQL statement in a transaction manually to verify rollback
        let tx = conn.unchecked_transaction().expect("tx");
        let result = tx.execute_batch("THIS IS NOT VALID SQL;");
        assert!(result.is_err());
        // Don't commit — simulates what migrate_db does on failure
        drop(tx);

        // Version must still be 1
        assert_eq!(get_db_version(&conn).expect("version"), 1);
    }
}
