import { getChallengesQuerySchema, createChallengeSchema } from './challenge';

describe('getChallengesQuerySchema', () => {
	it('coerces string query params to numbers (app sends ?pageSize=100&status=PENDING&userId=...)', () => {
		const result = getChallengesQuerySchema.safeParse({
			pageSize: '100',
			status: 'PENDING',
			userId: 'cmunvnark000cqa1gcwncg2dx',
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.pageSize).toBe(100);
			expect(result.data.page).toBe(1); // default applied
			expect(result.data.status).toBe('PENDING');
			expect(result.data.userId).toBe('cmunvnark000cqa1gcwncg2dx');
		}
	});

	it('handles an explicit undefined page (app omits page when only sending pageSize)', () => {
		const result = getChallengesQuerySchema.safeParse({
			page: undefined,
			pageSize: '100',
			status: 'PENDING',
			userId: 'cmunvnark000cqa1gcwncg2dx',
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
			expect(result.data.pageSize).toBe(100);
		}
	});

	it('applies defaults when no params are given', () => {
		const result = getChallengesQuerySchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
			expect(result.data.pageSize).toBe(20);
		}
	});

	it('rejects an invalid status', () => {
		expect(getChallengesQuerySchema.safeParse({ status: 'NOPE' }).success).toBe(false);
	});

	it('rejects pageSize above 100 and non-numeric page', () => {
		expect(getChallengesQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
		expect(getChallengesQuerySchema.safeParse({ page: 'abc' }).success).toBe(false);
	});
});

describe('createChallengeSchema', () => {
	it('accepts a minimal valid challenge', () => {
		const result = createChallengeSchema.safeParse({ challengedId: 'user-2', name: 'Duel' });
		expect(result.success).toBe(true);
	});

	it('rejects a missing name', () => {
		expect(createChallengeSchema.safeParse({ challengedId: 'user-2', name: '' }).success).toBe(false);
	});
});
