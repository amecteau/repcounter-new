export interface Exercise {
	id: string;
	name: string;
	muscleGroup: MuscleGroup;
	isCustom: boolean;
}

export type MuscleGroup =
	| 'chest'
	| 'back'
	| 'shoulders'
	| 'biceps'
	| 'triceps'
	| 'legs'
	| 'core'
	| 'fullBody'
	| 'forearms'
	| 'traps'
	| 'calves';
