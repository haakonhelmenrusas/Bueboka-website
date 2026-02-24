// Keep Prisma-related enums out of the client bundle.
//
// Next.js/Turbopack will try to include `@prisma/client` in client components if you import enums from it.
// In CI (Netlify) this can fail with errors like:
//   Module not found: Can't resolve '.prisma/client/index-browser'
//
// These must stay in sync with Prisma schema enums.

export const Environment = {
	INDOOR: 'INDOOR',
	OUTDOOR: 'OUTDOOR',
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

export const WeatherCondition = {
	SUN: 'SUN',
	CLOUDED: 'CLOUDED',
	CLEAR: 'CLEAR',
	RAIN: 'RAIN',
	WIND: 'WIND',
	SNOW: 'SNOW',
	FOG: 'FOG',
	THUNDER: 'THUNDER',
	CHANGING_CONDITIONS: 'CHANGING_CONDITIONS',
	OTHER: 'OTHER',
} as const;

export type WeatherCondition = (typeof WeatherCondition)[keyof typeof WeatherCondition];

export const PracticeType = {
	TRENING: 'TRENING',
	KONKURRANSE: 'KONKURRANSE',
} as const;

export type PracticeType = (typeof PracticeType)[keyof typeof PracticeType];

export const PracticeCategory = {
	FELT: 'FELT',
	JAKT_3D: 'JAKT_3D',
	SKIVE: 'SKIVE',
	ANNET: 'ANNET',
} as const;

export type PracticeCategory = (typeof PracticeCategory)[keyof typeof PracticeCategory];
