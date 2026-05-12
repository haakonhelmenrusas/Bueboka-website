'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuTrash2 } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { DateInput, Input, Select } from '@/components';
import { getArrowsOptions, getBowOptions, getEnvironmentOptions, getPracticeCategoryOptions } from '@/lib/formUtils';
import { getWeatherOptions } from './PracticeFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

interface InfoStepProps {
	date: string;
	setDate: (d: string) => void;
	practiceCategory: PracticeCategory;
	onCategoryChange: (cat: PracticeCategory) => void;
	environment: Environment;
	setEnvironment: (e: Environment) => void;
	location: string;
	setLocation: (l: string) => void;
	weather: WeatherCondition[];
	toggleWeather: (condition: WeatherCondition) => void;
	bowId: string;
	setBowId: (id: string) => void;
	arrowsId: string;
	setArrowsId: (id: string) => void;
	bows: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
	isEditMode: boolean;
	onDeleteRequest: () => void;
}

export const PracticeFormInfoStep: React.FC<InfoStepProps> = ({
	date,
	setDate,
	practiceCategory,
	onCategoryChange,
	environment,
	setEnvironment,
	location,
	setLocation,
	weather,
	toggleWeather,
	bowId,
	setBowId,
	arrowsId,
	setArrowsId,
	bows,
	arrows,
	isEditMode,
	onDeleteRequest,
}) => {
	const { t } = useTranslation();
	const environmentOptions = getEnvironmentOptions(t);
	const practiceCategoryOptions = getPracticeCategoryOptions(t);
	const bowOptions = getBowOptions(bows, t);
	const arrowsOptions = getArrowsOptions(arrows, t);
	const weatherOptions = getWeatherOptions(t);

	return (
		<div className={styles.stepContent}>
			<div className={styles.row}>
				<DateInput label={t['form.date']} value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
				<Select
					label={t['form.category']}
					value={practiceCategory}
					onChange={(v) => onCategoryChange(v as PracticeCategory)}
					options={practiceCategoryOptions}
					containerClassName={styles.field}
				/>
			</div>

			<div className={styles.row}>
				<Select
					label={t['form.environment']}
					value={environment}
					onChange={(v) => setEnvironment(v as Environment)}
					options={environmentOptions}
					containerClassName={styles.field}
				/>
				<Input
					label={t['form.location']}
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					helpText={`${t['form.locationPlaceholder']} (${location.length}/64 ${t['common.characters']})`}
					maxLength={64}
					containerClassName={styles.field}
				/>
			</div>

			{environment === Environment.OUTDOOR && (
				<div className={styles.weatherSection}>
					<div className={styles.weatherLabel}>{t['form.weather']}</div>
					<div className={styles.weatherChips}>
						{weatherOptions.map((opt) => {
							const active = weather.includes(opt.value);
							return (
								<button
									key={opt.value}
									type="button"
									className={`${styles.weatherChip}${active ? ` ${styles.weatherChipActive}` : ''}`}
									onClick={() => toggleWeather(opt.value)}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>
			)}
			<div className={styles.row}>
				<Select
					label={t['form.bow']}
					value={bowId}
					onChange={(v) => setBowId(v as string)}
					placeholderLabel={t['form.selectBow']}
					options={bowOptions}
					containerClassName={styles.field}
				/>
				<Select
					label={t['form.arrows']}
					value={arrowsId}
					onChange={(v) => setArrowsId(v as string)}
					placeholderLabel={t['form.selectArrows']}
					options={arrowsOptions}
					containerClassName={styles.field}
				/>
			</div>

			{isEditMode && (
				<div className={styles.deleteSection}>
					<button type="button" className={styles.deleteLink} onClick={onDeleteRequest}>
						<LuTrash2 size={16} />
						{t['practice.deleteButton']}
					</button>
				</div>
			)}
		</div>
	);
};
