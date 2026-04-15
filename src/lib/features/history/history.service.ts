import { invoke } from '@tauri-apps/api/core';
import type { Workout } from '$lib/shared/types/workout.js';

export async function getWorkouts(): Promise<Workout[]> {
	return invoke<Workout[]>('get_workouts');
}

export async function deleteWorkout(id: string): Promise<void> {
	await invoke('delete_workout', { id });
}
