import { LuCircleHelp, LuCloud, LuSparkles, LuSun, LuZap } from 'react-icons/lu';
import { WeatherCondition } from './prismaEnums';
import type { TranslationKeys } from '@/lib/i18n/types';

const weatherTranslationKeys: Record<WeatherCondition, keyof TranslationKeys> = {
	[WeatherCondition.SUN]: 'weather.sun',
	[WeatherCondition.CLOUDED]: 'weather.clouded',
	[WeatherCondition.CLEAR]: 'weather.clear',
	[WeatherCondition.RAIN]: 'weather.rain',
	[WeatherCondition.WIND]: 'weather.wind',
	[WeatherCondition.SNOW]: 'weather.snow',
	[WeatherCondition.FOG]: 'weather.fog',
	[WeatherCondition.THUNDER]: 'weather.thunder',
	[WeatherCondition.CHANGING_CONDITIONS]: 'weather.changing',
	[WeatherCondition.OTHER]: 'weather.other',
};

export const weatherIcons: Record<WeatherCondition, React.ComponentType<{ size?: number }>> = {
	[WeatherCondition.SUN]: LuSun,
	[WeatherCondition.CLOUDED]: LuCloud,
	[WeatherCondition.CLEAR]: LuSparkles,
	[WeatherCondition.RAIN]: LuCloud,
	[WeatherCondition.WIND]: LuCloud,
	[WeatherCondition.SNOW]: LuCloud,
	[WeatherCondition.FOG]: LuCloud,
	[WeatherCondition.THUNDER]: LuZap,
	[WeatherCondition.CHANGING_CONDITIONS]: LuCloud,
	[WeatherCondition.OTHER]: LuCircleHelp,
};

export function getWeatherLabel(condition: WeatherCondition, t: TranslationKeys): string {
	const key = weatherTranslationKeys[condition];
	return key ? t[key] : String(condition);
}

export function getWeatherIcon(condition: WeatherCondition): React.ComponentType<{ size?: number; className?: string }> {
	return weatherIcons[condition];
}

export function formatWeatherConditions(conditions: WeatherCondition[], t: TranslationKeys): string {
	return conditions.map((c) => getWeatherLabel(c, t)).join(', ');
}
