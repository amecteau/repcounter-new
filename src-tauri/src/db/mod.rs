use rusqlite::{Connection, Result};

pub fn initialize_db(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS workouts (
            id               TEXT PRIMARY KEY,
            date             TEXT NOT NULL,
            duration_minutes INTEGER
        );

        CREATE TABLE IF NOT EXISTS sets (
            id          TEXT PRIMARY KEY,
            workout_id  TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            reps        INTEGER NOT NULL,
            weight      REAL,
            unit        TEXT NOT NULL,
            timestamp   TEXT NOT NULL,
            notes       TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS custom_exercises (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL UNIQUE,
            muscle_group TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        ",
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initialize_db_creates_tables() {
        let conn = Connection::open_in_memory().expect("in-memory db");
        initialize_db(&conn).expect("schema init");

        let count: i64 = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type='table'",
                [],
                |row| row.get(0),
            )
            .expect("table count query");
        assert_eq!(count, 4, "expected 4 tables");
    }
}
