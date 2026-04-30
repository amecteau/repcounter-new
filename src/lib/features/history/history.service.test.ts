import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn()
}));

import { invoke } from '@tauri-apps/api/core';
import * as service from './history.service.js';

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
	mockInvoke.mockReset();
});

describe('history.service', () => {
	it('getWorkouts invokes get_workouts and returns result', async () => {
		const workouts = [{ id: 'w1', date: '2026-04-10', sets: [], durationMinutes: 45 }];
		mockInvoke.mockResolvedValueOnce(workouts);
		const result = await service.getWorkouts();
		expect(mockInvoke).toHaveBeenCalledWith('get_workouts');
		expect(result).toEqual(workouts);
	});

	it('getWorkouts returns empty array when no workouts', async () => {
		mockInvoke.mockResolvedValueOnce([]);
		const result = await service.getWorkouts();
		expect(result).toEqual([]);
	});

	it('deleteWorkout invokes delete_workout with id', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.deleteWorkout('w1');
		expect(mockInvoke).toHaveBeenCalledWith('delete_workout', { id: 'w1' });
	});

	it('clearHistory invokes clear_all_history and returns count', async () => {
		mockInvoke.mockResolvedValueOnce(3);
		const result = await service.clearHistory();
		expect(mockInvoke).toHaveBeenCalledWith('clear_all_history');
		expect(result).toBe(3);
	});
});
