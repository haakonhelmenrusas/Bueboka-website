import { Cloud, CloudRain, CloudSnow, CloudSun, Cloudy, HelpCircle, Sun, Wind, Zap } from 'lucide-react';
import { WeatherCondition } from './prismaEnums';

export const weatherOptions: WeatherCondition[] = [
	WeatherCondition.SUN,
	WeatherCondition.CLOUDED,
	WeatherCondition.CLEAR,
	WeatherCondition.RAIN,
	WeatherCondition.WIND,
	WeatherCondition.SNOW,
	WeatherCondition.FOG,
	WeatherCondition.THUNDER,
	WeatherCondition.CHANGING_CONDITIONS,
	WeatherCondition.OTHER,
];

export const weatherLabels: Record<WeatherCondition, string> = {
	[WeatherCondition.SUN]: 'Sol',
	[WeatherCondition.CLOUDED]: 'Overskyet',
	[WeatherCondition.CLEAR]: 'Klarvær',
	[WeatherCondition.RAIN]: 'Regn',
	[WeatherCondition.WIND]: 'Vind',
	[WeatherCondition.SNOW]: 'Snø',
	[WeatherCondition.FOG]: 'Tåke',
	[WeatherCondition.THUNDER]: 'Torden',
	[WeatherCondition.CHANGING_CONDITIONS]: 'Skiftende',
	[WeatherCondition.OTHER]: 'Annet',
};

export const weatherIcons: Record<WeatherCondition, React.ComponentType<{ size?: number; className?: string }>> = {
	[WeatherCondition.SUN]: Sun,
	[WeatherCondition.CLOUDED]: Cloudy,
	[WeatherCondition.CLEAR]: CloudSun,
	[WeatherCondition.RAIN]: CloudRain,
	[WeatherCondition.WIND]: Wind,
	[WeatherCondition.SNOW]: CloudSnow,
	[WeatherCondition.FOG]: Cloud,
	[WeatherCondition.THUNDER]: Zap,
	[WeatherCondition.CHANGING_CONDITIONS]: CloudSun,
	[WeatherCondition.OTHER]: HelpCircle,
};

/**
 * Get weather label for a weather condition
 */
export function getWeatherLabel(condition: WeatherCondition): string {
	return weatherLabels[condition] ?? String(condition);
}

/**
 * Get weather icon component for a weather condition
 */
export function getWeatherIcon(condition: WeatherCondition): React.ComponentType<{ size?: number; className?: string }> {
	return weatherIcons[condition];
}

/**
 * Format multiple weather conditions as a comma-separated string
 */
export function formatWeatherConditions(conditions: WeatherCondition[]): string {
	return conditions.map((c) => getWeatherLabel(c)).join(', ');
}

/**
 * Get weather select options with icons and labels
 */
export function getWeatherSelectOptions() {
	return weatherOptions.map((w) => {
		const Icon = getWeatherIcon(w);
		return {
			value: w,
			label: getWeatherLabel(w),
			icon: <Icon size={16} />,
		};
	});
}
