import { createPracticeSchema, updatePracticeSchema } from './practice';

describe('Practice Validation Schema', () => {
	const validPracticeBase = {
		date: '2026-02-25',
		environment: 'INDOOR' as const,
		weather: [],
		practiceType: 'TRENING' as const,
		practiceCategory: 'SKIVE_INDOOR' as const,
	};

	describe('Rounds validation', () => {
		it('should accept practice with 1 round', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should accept practice with 8 rounds', () => {
			const practice = {
				...validPracticeBase,
				rounds: [
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 490 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 485 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 495 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 480 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 490 },
					{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 495 },
				],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should reject practice with 0 rounds', () => {
			const practice = {
				...validPracticeBase,
				rounds: [],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const roundsError = result.error.issues.find((e) => e.path.includes('rounds'));
				expect(roundsError?.message).toContain('Minst én runde er påkrevd');
			}
		});

		it('should reject practice with more than 20 rounds', () => {
			const practice = {
				...validPracticeBase,
				rounds: Array(21).fill({ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const roundsError = result.error.issues.find((e) => e.path.includes('rounds'));
				expect(roundsError?.message).toContain('Maksimalt 20 runder er tillatt');
			}
		});

		it('should reject practice with 21 rounds', () => {
			const practice = {
				...validPracticeBase,
				rounds: Array(21).fill({ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const roundsError = result.error.issues.find((e) => e.path.includes('rounds'));
				expect(roundsError?.message).toBe('Maksimalt 20 runder er tillatt');
			}
		});
	});

	describe('Rating validation', () => {
		it('should accept rating between 1 and 10', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				rating: 5,
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should reject rating below 1', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				rating: 0,
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
		});

		it('should reject rating above 10', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				rating: 11,
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
		});
	});

	describe('Weather validation', () => {
		it('should reject weather conditions when environment is INDOOR', () => {
			const practice = {
				...validPracticeBase,
				environment: 'INDOOR' as const,
				weather: ['SUN' as const],
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const weatherError = result.error.issues.find((e) => e.path.includes('weather'));
				expect(weatherError?.message).toContain('Vær kan kun settes når miljø er "Ute"');
			}
		});

		it('should accept weather conditions when environment is OUTDOOR', () => {
			const practice = {
				...validPracticeBase,
				environment: 'OUTDOOR' as const,
				weather: ['SUN' as const, 'WIND' as const],
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});
	});

	describe('Update schema', () => {
		it('should have same validation rules as create schema', () => {
			const practice = {
				...validPracticeBase,
				rounds: Array(21).fill({ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }),
			};

			const result = updatePracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const roundsError = result.error.issues.find((e) => e.path.includes('rounds'));
				expect(roundsError?.message).toBe('Maksimalt 20 runder er tillatt');
			}
		});
	});

	describe('ArrowsWithoutScore validation', () => {
		it('should accept valid arrows without score', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500, arrowsWithoutScore: 100 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should reject arrows without score above 500', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500, arrowsWithoutScore: 501 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const arrowsError = result.error.issues.find((e) => e.path.includes('arrowsWithoutScore'));
				expect(arrowsError?.message).toContain('Maksimalt 500 piler uten scoring');
			}
		});

		it('should reject extremely large arrows without score value', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500, arrowsWithoutScore: 9000099999999 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
		});

		it('should reject negative arrows without score', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500, arrowsWithoutScore: -1 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
		});
	});

	describe('Round field limits', () => {
		it('should reject distance over 1000 meters', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 1001, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const distanceError = result.error.issues.find((e) => e.path.includes('distanceMeters'));
				expect(distanceError?.message).toContain('Avstand må være mindre enn 1000 meter');
			}
		});

		it('should reject number of arrows over 10000', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 10001, roundScore: 500 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const arrowsError = result.error.issues.find((e) => e.path.includes('numberArrows'));
				expect(arrowsError?.message).toContain('Maksimalt 10000 piler per runde');
			}
		});

		it('should reject score over 1000000', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 1000001 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const scoreError = result.error.issues.find((e) => e.path.includes('roundScore'));
				expect(scoreError?.message).toContain('Score må være mindre enn 1000000');
			}
		});

		it('should accept valid round with all fields at max limits', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 1000, targetType: '60cm', numberArrows: 10000, roundScore: 1000000 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});
	});

	describe('Location validation', () => {
		it('should accept location with 64 characters', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				location: 'a'.repeat(64),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should reject location with more than 64 characters', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				location: 'a'.repeat(65),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const locationError = result.error.issues.find((e) => e.path.includes('location'));
				expect(locationError?.message).toContain('Sted må være mindre enn 64 tegn');
			}
		});
	});

	describe('Notes validation', () => {
		it('should accept notes with 500 characters', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				notes: 'a'.repeat(500),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(true);
		});

		it('should reject notes with more than 500 characters', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 30, targetType: '60cm', numberArrows: 60, roundScore: 500 }],
				notes: 'a'.repeat(501),
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const notesError = result.error.issues.find((e) => e.path.includes('notes'));
				expect(notesError?.message).toContain('Notater må være mindre enn 500 tegn');
			}
		});
	});

	describe('TargetType validation', () => {
		it('should accept valid target types', () => {
			const validTypes = ['40cm', '60cm', '80cm', 'felt-40', '40cm-trippel-vegas', 'felt-60'];

			validTypes.forEach((targetType) => {
				const practice = {
					...validPracticeBase,
					rounds: [{ distanceMeters: 30, targetType, numberArrows: 60, roundScore: 500 }],
				};

				const result = createPracticeSchema.safeParse(practice);
				expect(result.success).toBe(true);
			});
		});

		it('should reject invalid target type', () => {
			const practice = {
				...validPracticeBase,
				rounds: [{ distanceMeters: 2, targetType: '3cm', numberArrows: 5, roundScore: 0 }],
			};

			const result = createPracticeSchema.safeParse(practice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const targetError = result.error.issues.find((e) => e.path[0] === 'rounds' && e.path[2] === 'targetType');
				expect(targetError?.message).toContain('Ugyldig blinktype');
			}
		});
	});
});
