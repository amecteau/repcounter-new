export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

export interface StoreResult {
	success: boolean;
	error?: string;
}
