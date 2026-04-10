export interface WorkoutSet {
	id: string;
	exerciseId: string;
	reps: number;
	weight: number | null;
	unit: WeightUnit;
	timestamp: string;
	notes: string;
}

export type WeightUnit = 'kg' | 'lb';

export interface Workout {
	id: string;
	date: string;
	sets: WorkoutSet[];
	durationMinutes: number | null;
}
