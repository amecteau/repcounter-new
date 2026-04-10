use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutSet {
    pub id: String,
    pub exercise_id: String,
    pub reps: i64,
    pub weight: Option<f64>,
    pub unit: String,
    pub timestamp: String,
    pub notes: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Workout {
    pub id: String,
    pub date: String,
    pub sets: Vec<WorkoutSet>,
    pub duration_minutes: Option<i64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn workout_set_serializes_to_camel_case() {
        let set = WorkoutSet {
            id: "abc".to_string(),
            exercise_id: "ex1".to_string(),
            reps: 10,
            weight: Some(100.0),
            unit: "lb".to_string(),
            timestamp: "2026-04-09T10:00:00Z".to_string(),
            notes: String::new(),
        };
        let json = serde_json::to_value(&set).expect("serialize");
        assert_eq!(json["exerciseId"], "ex1", "exerciseId must be camelCase");
        assert_eq!(json["reps"], 10);
        assert_eq!(json["weight"], 100.0);
        assert!(json.get("exercise_id").is_none(), "snake_case must not appear");
    }

    #[test]
    fn workout_serializes_duration_minutes_as_camel_case() {
        let workout = Workout {
            id: "w1".to_string(),
            date: "2026-04-09".to_string(),
            sets: vec![],
            duration_minutes: Some(45),
        };
        let json = serde_json::to_value(&workout).expect("serialize");
        assert_eq!(json["durationMinutes"], 45);
        assert!(json.get("duration_minutes").is_none());
    }
}
