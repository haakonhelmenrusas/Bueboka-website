import { useEffect, useState } from 'react';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { useTranslation } from '@/context/LanguageProvider';
import { type PracticeFormInput, type RoundInput, emptyRound } from './PracticeFormModal.types';

interface PracticeData {
	id: string;
	date: string;
	arrowsShot: number;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory?: PracticeCategory | null;
	notes?: string | null;
	rating?: number | null;
	roundTypeId?: string | null;
	bowId?: string | null;
	arrowsId?: string | null;
	ends?: Array<{
		id: string;
		arrows: number;
		scores?: number[] | null;
		distanceMeters?: number | null;
		distanceFrom?: number | null;
		distanceTo?: number | null;
		targetSizeCm?: number | null;
		targetType?: string | null;
		arrowsWithoutScore?: number | null;
		roundScore?: number | null;
		arrowsPerEnd?: number | null;
	}>;
}

interface UsePracticeFormStateOptions {
	open: boolean;
	mode: 'create' | 'edit';
	practice?: PracticeData;
	bows: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
	onSave: (input: PracticeFormInput) => Promise<void>;
	onClose: () => void;
	onDeleted?: (id: string) => void;
}

export function usePracticeFormState({
	open,
	mode,
	practice,
	bows,
	arrows: arrowSets,
	onSave,
	onClose,
	onDeleted,
}: UsePracticeFormStateOptions) {
	const { t } = useTranslation();
	const isEditMode = mode === 'edit';

	// ─── Step ────────────────────────────────────────────────────────────────
	const [step, setStep] = useState(0);

	// ─── Form state ──────────────────────────────────────────────────────────
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [location, setLocation] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('SKIVE_INDOOR');
	const [notes, setNotes] = useState('');
	const [rating, setRating] = useState<number | null>(null);
	const [rounds, setRounds] = useState<RoundInput[]>([emptyRound('SKIVE_INDOOR')]);
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');

	// ─── UI state ────────────────────────────────────────────────────────────
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
	const [scoringRoundIndex, setScoringRoundIndex] = useState<number | null>(null);
	const [endPages, setEndPages] = useState<Record<number, number>>({});
	const [editingIndices, setEditingIndices] = useState<Record<number, number | null>>({});

	// ─── Init form on open ───────────────────────────────────────────────────
	useEffect(() => {
		if (!open) return;

		setStep(0);
		setError(null);
		setScoringRoundIndex(null);
		setEndPages({});
		setEditingIndices({});

		if (mode === 'edit' && practice) {
			setDate(practice.date.split('T')[0]);
			setLocation(practice.location || '');
			setEnvironment(practice.environment);
			setWeather(practice.weather || []);
			setPracticeCategory(practice.practiceCategory || 'SKIVE_INDOOR');
			setNotes(practice.notes || '');
			setRating(practice.rating ?? null);
			setBowId(practice.bowId || '');
			setArrowsId(practice.arrowsId || '');

			if (practice.ends && practice.ends.length > 0) {
				setRounds(
					practice.ends.map((end) => {
						const savedScores = end.scores ?? [];
						const derivedArrows = end.arrows ?? (savedScores.length > 0 ? savedScores.length : undefined);
						return {
							distanceMeters: end.distanceMeters ?? undefined,
							distanceFrom: end.distanceFrom ?? undefined,
							distanceTo: end.distanceTo ?? undefined,
							targetType: end.targetType || (end.targetSizeCm ? `${end.targetSizeCm}cm` : ''),
							numberArrows: derivedArrows,
							arrowsPerEnd: end.arrowsPerEnd ?? undefined,
							arrowsWithoutScore: end.arrowsWithoutScore ?? undefined,
							roundScore: end.roundScore ?? 0,
							scores: savedScores,
						};
					})
				);
			} else {
				setRounds([emptyRound(practice.practiceCategory || 'SKIVE_INDOOR')]);
			}
		} else {
			setDate(new Date().toISOString().slice(0, 10));
			setLocation('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeCategory('SKIVE_INDOOR');
			setNotes('');
			setRating(null);
			setBowId(bows.find((b) => b.isFavorite)?.id || '');
			setArrowsId(arrowSets.find((a) => a.isFavorite)?.id || '');

			const lastDistance = typeof window !== 'undefined' ? localStorage.getItem('bueboka_last_distance') : null;
			const lastTarget = typeof window !== 'undefined' ? localStorage.getItem('bueboka_last_target') : null;
			setRounds([
				{
					distanceMeters: lastDistance ? parseFloat(lastDistance) : undefined,
					targetType: lastTarget || '',
					numberArrows: undefined,
					arrowsWithoutScore: undefined,
					roundScore: 0,
					scores: [],
				},
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, mode, practice]);

	useEffect(() => {
		if (environment !== Environment.OUTDOOR) setWeather([]);
	}, [environment]);

	// ─── Category ────────────────────────────────────────────────────────────
	const handleCategoryChange = (cat: PracticeCategory) => {
		setPracticeCategory(cat);
		setRounds([emptyRound(cat)]);
	};

	// ─── Rounds ──────────────────────────────────────────────────────────────
	const addRound = () => {
		if (rounds.length < 20) {
			setRounds((prev) => {
				const last = prev[prev.length - 1];
				const newRound = emptyRound(practiceCategory);
				if (last) {
					newRound.distanceMeters = last.distanceMeters;
					newRound.distanceFrom = last.distanceFrom;
					newRound.distanceTo = last.distanceTo;
					newRound.targetType = last.targetType;
				}
				return [...prev, newRound];
			});
		}
	};

	const removeRound = (index: number) => {
		if (rounds.length > 1) setRounds((prev) => prev.filter((_, i) => i !== index));
	};

	const updateRound = (index: number, field: keyof RoundInput, value: RoundInput[keyof RoundInput]) => {
		setRounds((prev) => {
			const next = [...prev];
			const updated: RoundInput = { ...next[index], [field]: value };
			if (field === 'numberArrows' && typeof value === 'number') {
				const max = value;
				if (updated.scores && updated.scores.length > max) {
					updated.scores = updated.scores.slice(0, max);
					updated.roundScore = updated.scores.reduce((a, b) => a + b, 0);
				}
			}
			next[index] = updated;
			return next;
		});
	};

	// ─── Arrow scoring ───────────────────────────────────────────────────────
	const addArrowScore = (roundIndex: number, score: number) => {
		const round = rounds[roundIndex];
		const maxArrows = round.numberArrows ?? 0;
		const current = round.scores ?? [];
		if (maxArrows > 0 && current.length >= maxArrows) return;
		const newScores = [...current, score];
		setRounds((prev) => {
			const next = [...prev];
			next[roundIndex] = { ...next[roundIndex], scores: newScores, roundScore: newScores.reduce((a, b) => a + b, 0) };
			return next;
		});
	};

	const updateArrowScore = (roundIndex: number, arrowIndex: number, score: number) => {
		setRounds((prev) => {
			const next = [...prev];
			const scores = [...(next[roundIndex].scores ?? [])];
			scores[arrowIndex] = score;
			next[roundIndex] = { ...next[roundIndex], scores, roundScore: scores.reduce((a, b) => a + b, 0) };
			return next;
		});
	};

	// ─── Weather ─────────────────────────────────────────────────────────────
	const toggleWeather = (condition: WeatherCondition) => {
		setWeather((prev) => (prev.includes(condition) ? prev.filter((w) => w !== condition) : [...prev, condition]));
	};

	// ─── Scoring modal ──────────────────────────────────────────────────────
	const handleSetEndPage = (page: number) => {
		if (scoringRoundIndex === null) return;
		setEditingIndices((prev) => ({ ...prev, [scoringRoundIndex]: null }));
		setEndPages((prev) => ({ ...prev, [scoringRoundIndex]: page }));
	};

	const handleSetEditingIndex = (idx: number | null) => {
		if (scoringRoundIndex === null) return;
		setEditingIndices((prev) => ({ ...prev, [scoringRoundIndex]: idx }));
	};

	const handleScoringAddArrow = (score: number) => {
		if (scoringRoundIndex === null) return;
		addArrowScore(scoringRoundIndex, score);
	};

	const handleScoringUpdateArrow = (arrowIndex: number, score: number) => {
		if (scoringRoundIndex === null) return;
		updateArrowScore(scoringRoundIndex, arrowIndex, score);
	};

	// ─── Delete ──────────────────────────────────────────────────────────────
	const handleDelete = async () => {
		if (!practice?.id) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/practices/${practice.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(t['practice.deleteError']);
			onDeleted?.(practice.id);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : t['practice.deleteError']);
		} finally {
			setDeleting(false);
			setConfirmDeleteOpen(false);
		}
	};

	// ─── Close guard ─────────────────────────────────────────────────────────
	const handleCloseRequest = () => {
		if (submitting) return;
		setConfirmDiscardOpen(true);
	};

	// ─── Submit ──────────────────────────────────────────────────────────────
	const handleSubmit = async () => {
		setSubmitting(true);
		setError(null);
		try {
			const validRounds = rounds.filter(
				(r) =>
					(r.distanceMeters && r.distanceMeters > 0) ||
					(r.distanceFrom && r.distanceFrom > 0) ||
					(r.distanceTo && r.distanceTo > 0) ||
					r.targetType ||
					(r.numberArrows ?? 0) > 0 ||
					r.roundScore > 0
			);

			if (validRounds.length > 0 && typeof window !== 'undefined') {
				const first = validRounds[0];
				if (first.distanceMeters && first.distanceMeters > 0)
					localStorage.setItem('bueboka_last_distance', first.distanceMeters.toString());
				if (first.targetType) localStorage.setItem('bueboka_last_target', first.targetType);
			}

			await onSave({
				date: new Date(date).toISOString(),
				location: location || undefined,
				environment,
				weather,
				practiceCategory,
				notes: notes || undefined,
				rating: rating ?? undefined,
				rounds: validRounds,
				bowId: bowId || undefined,
				arrowsId: arrowsId || undefined,
			});
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : t['practice.saveError']);
		} finally {
			setSubmitting(false);
		}
	};

	const isFormValid = !!date;
	const title = isEditMode ? t['practice.editTitle'] : t['practice.newTitle'];

	return {
		// Step
		step,
		setStep,

		// Form state
		date,
		setDate,
		location,
		setLocation,
		environment,
		setEnvironment,
		weather,
		practiceCategory,
		notes,
		setNotes,
		rating,
		setRating,
		rounds,
		bowId,
		setBowId,
		arrowsId,
		setArrowsId,

		// UI state
		submitting,
		deleting,
		error,
		confirmDeleteOpen,
		setConfirmDeleteOpen,
		confirmDiscardOpen,
		setConfirmDiscardOpen,
		scoringRoundIndex,
		setScoringRoundIndex,
		endPages,
		editingIndices,
		isEditMode,
		isFormValid,
		title,

		// Handlers
		handleCategoryChange,
		addRound,
		removeRound,
		updateRound,
		toggleWeather,
		handleDelete,
		handleCloseRequest,
		handleSubmit,

		// Scoring modal handlers
		handleSetEndPage,
		handleSetEditingIndex,
		handleScoringAddArrow,
		handleScoringUpdateArrow,
	};
}
