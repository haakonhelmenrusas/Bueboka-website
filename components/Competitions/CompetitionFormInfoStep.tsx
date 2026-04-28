'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuTrash2 } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { DateInput, Input, Select } from '@/components';
import { getArrowsOptions, getBowOptions, getEnvironmentOptions, getPracticeCategoryOptions } from '@/lib/formUtils';
import { WEATHER_OPTIONS } from './CompetitionFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

interface InfoStepProps {
	name: string;
	setName: (v: string) => void;
	date: string;
	setDate: (v: string) => void;
	practiceCategory: PracticeCategory;
	onCategoryChange: (cat: PracticeCategory) => void;
	environment: Environment;
	setEnvironment: (v: Environment) => void;
	location: string;
	setLocation: (v: string) => void;
	organizerName: string;
	setOrganizerName: (v: string) => void;
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

export const CompetitionFormInfoStep: React.FC<InfoStepProps> = ({
	name,
	setName,
	date,
	setDate,
	practiceCategory,
	onCategoryChange,
	environment,
	setEnvironment,
	location,
	setLocation,
	organizerName,
	setOrganizerName,
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
	const environmentOptions = getEnvironmentOptions();
	const practiceCategoryOptions = getPracticeCategoryOptions();
	const bowOptions = getBowOptions(bows);
	const arrowsOptions = getArrowsOptions(arrows);

	return (
		<div className={styles.stepContent}>
			<Input
				label={t['competition.nameLabel']}
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
				helpText={t['competition.namePlaceholder']}
				containerClassName={styles.field}
			/>

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

			<Input
				label={t['competition.organizerLabel']}
				optional
				value={organizerName}
				onChange={(e) => setOrganizerName(e.target.value)}
				helpText={t['competition.organizerHelp']}
				containerClassName={styles.field}
			/>

			{environment === Environment.OUTDOOR && (
				<div className={styles.weatherSection}>
					<div className={styles.weatherLabel}>{t['form.weather']}</div>
					<div className={styles.weatherChips}>
						{WEATHER_OPTIONS.map((opt) => {
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

			<div className={styles.sectionTitle}>{t['competition.sectionEquipment']}</div>
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
						{t['competition.deleteButton']}
					</button>
				</div>
			)}
		</div>
	);
};
