export interface BowSpecification {
	id: string;
	userId: string;
	bowId: string;
	intervalSightReal?: number;
	intervalSightMeasured?: number;
	placement?: number;
	createdAt?: Date;
	updatedAt?: Date;
	bow?: {
		id: string;
		name: string;
		type?: string;
	};
}

export interface SightMark {
	id: string;
	userId: string;
	bowSpecificationId: string;
	name?: string | null;
	givenMarks: number[];
	givenDistances: number[];
	ballisticsParameters: CalculatedMarks | Record<string, unknown>;
	createdAt?: Date;
	updatedAt?: Date;
	bowSpec?: BowSpecification;
}

export interface SightMarkResult {
	id: string;
	userId: string;
	sightMarkId: string;
	distanceFrom: number;
	distanceTo: number;
	interval: number;
	angles: number[];
	distances: number[];
	sightMarksByAngle: number[];
	arrowSpeedByAngle: number[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AimDistanceMark {
	ballistics_pars?: number[];
	bow_category: string;
	interval_sight_real?: number;
	interval_sight_measured?: number;
	arrow_diameter_mm?: number;
	arrow_mass_gram?: number;
	feet_behind_or_center?: string;
	direction_of_sight_scale?: string;
	length_eye_sight_cm?: number;
	length_nock_eye_cm?: number;
	new_given_mark: number;
	new_given_distance: number;
	given_marks: number[];
	given_distances: number[];
}

export interface CalculatedMarks {
	/** Initial speed of the arrow in meters per second. */
	initial_arrow_speed: number;

	/** Coefficient of drag for the arrow. */
	cd: number;

	/** Mass of the arrow in grams. */
	arrow_mass_gram: number;

	/** Diameter of the arrow in millimeters. */
	arrow_diameter_mm: number;

	/** Distance from the eye to the sight in centimeters. */
	length_eye_sight_cm: number;

	/** Distance from the nock to the eye in centimeters. */
	length_nock_eye_cm: number;

	/** Scaling factor for the sight. */
	sight_scaling: number;

	/** Bias for the marks. */
	marks_bias: number;

	/** Standard deviation of the marks. */
	marks_std_deviation: number;

	/** Array of given distances in meters. */
	given_distances: number[];

	/** Array of given marks corresponding to the given distances. */
	given_marks: number[];

	/** Array of calculated marks. */
	calculated_marks: number[];

	/** Array of deviations of the marks. */
	marks_deviation: number[];

	/** Array of arrow speeds at different distances in meters per second. */
	arrow_speeds_at_distance: number[];

	/** Array of relative arrow speeds at different distances. */
	relative_arrow_speeds_at_distance: number[];

	/** Array of times at different distances in seconds. */
	times_at_distance: number[];

	/** Array of ballistic parameters. */
	ballistics_pars: number[];

	/** Name of the arrow set used (stored for display, not used in calculations). */
	arrow_name?: string;
}

export interface SightMarkCalc {
	ballistics_pars: number[];
	distances_def: [number, number, number];
	/** Explicit list of distances to compute marks for. When provided the service
	 *  uses this instead of expanding distances_def itself. */
	distances?: number[];
	angles: number[];
}

export interface MarksResult {
	distances: number[];
	sight_marks_by_hill_angle: number[];
	arrow_speed_by_angle: number[];
}

/** Multi-angle result from the /calculate/sight-marks service.
 *  Keys are angle values as strings (e.g. "0", "-5"), values are
 *  arrays of one entry per distance. */
export interface FullMarksResult {
	distances: number[];
	sight_marks_by_hill_angle: Record<string, number[]>;
	arrow_speed_by_angle: Record<string, number[]>;
}
