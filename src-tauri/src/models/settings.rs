use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UserSettings {
    pub font_scale: String,
    pub weight_unit: String,
    pub last_exercise_id: Option<String>,
    pub language: String,
}
