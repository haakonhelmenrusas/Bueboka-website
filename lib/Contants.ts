import { AimDistanceMark } from '@/types/SightMarks';

/**
 * Standard values for Ballistics calculations. These values are used to calculate the aim distance marks.
 * The user can change these values in the app.
 */
export const Ballistics: AimDistanceMark = {
	new_given_mark: 0,
	new_given_distance: 0,
	given_marks: [],
	given_distances: [],
	bow_category: 'recurve',
	interval_sight_measured: 4.7,
	interval_sight_real: 5.0,
	direction_of_sight_scale: 'down',
	arrow_diameter_mm: 5.69,
	arrow_mass_gram: 21.2,
	length_eye_sight_cm: 97.0,
	length_nock_eye_cm: 12.0,
	feet_behind_or_center: 'behind',
};

export const TARGET_TYPE_OPTIONS = [
	{ value: '40cm', label: '40 cm' },
	{ value: '40cm-trippel-vegas', label: '40cm Trippel/Vegas' },
	{ value: '60cm', label: '60 cm' },
	{ value: '60cm-trippel', label: '60cm Trippel' },
	{ value: '80cm', label: '80 cm' },
	{ value: '80cm-centre-6', label: '80 cm Centre 6' },
	{ value: '122cm', label: '122 cm' },
	{ value: 'felt-20-trippel', label: 'Felt 20 cm Trippel' },
	{ value: 'felt-40', label: 'Felt 40 cm' },
	{ value: 'felt-60', label: 'Felt 60 cm' },
	{ value: 'felt-80', label: 'Felt 80 cm' },
	{ value: 'bar', label: 'Barmatte uten blink' },
	{ value: 'historisk-nl-inne', label: 'Historisk NL Inne' },
	{ value: 'other', label: 'Annet' },
];
