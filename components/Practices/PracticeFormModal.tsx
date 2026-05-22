'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuX } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { ConfirmModal, Modal } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';
import type { PracticeFormInput, RoundInput } from './PracticeFormModal.types';
import { PracticeFormStepIndicator } from './PracticeFormStepIndicator';
import { PracticeFormInfoStep } from './PracticeFormInfoStep';
import { PracticeFormRoundsStep } from './PracticeFormRoundsStep';
import { PracticeFormScoringModal } from './PracticeFormScoringModal';
import { PracticeFormReflectionStep } from './PracticeFormReflectionStep';
import { PracticeFormNavFooter } from './PracticeFormNavFooter';
import { usePracticeFormState } from './usePracticeFormState';

export type { RoundInput, PracticeFormInput };

interface PracticeFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: PracticeFormInput) => Promise<void>;
	onDeleted?: (id: string) => void;
	mode: 'create' | 'edit';
	practice?: {
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
	};
	bows?: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows?: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
}

export const PracticeFormModal: React.FC<PracticeFormModalProps> = ({
	open,
	onClose,
	onSave,
	onDeleted,
	mode,
	practice,
	bows = [],
	arrows = [],
}) => {
	const { t } = useTranslation();

	const form = usePracticeFormState({
		open,
		mode,
		practice,
		bows,
		arrows,
		onSave,
		onClose,
		onDeleted,
	});

	if (!open) return null;

	return (
		<>
			<Modal
				open={open}
				onClose={onClose}
				title={form.title}
				maxWidth={760}
				closeOnBackdrop={false}
				hideHeader
				fullScreenMobile
				panelStyle={{ padding: 0, gap: 0, overflow: 'hidden' }}
			>
				<div className={styles.wizard}>
					<div className={styles.wizardHeader}>
						<h2 className={styles.wizardTitle}>{form.title}</h2>
						<button type="button" className={styles.closeBtn} onClick={form.handleCloseRequest} aria-label={t['common.close']}>
							<LuX size={20} />
						</button>
					</div>

					<PracticeFormStepIndicator step={form.step} onStepChange={form.setStep} />

					<div className={styles.scrollArea}>
						{form.step === 0 && (
							<PracticeFormInfoStep
								date={form.date}
								setDate={form.setDate}
								practiceCategory={form.practiceCategory}
								onCategoryChange={form.handleCategoryChange}
								environment={form.environment}
								setEnvironment={form.setEnvironment}
								location={form.location}
								setLocation={form.setLocation}
								weather={form.weather}
								toggleWeather={form.toggleWeather}
								bowId={form.bowId}
								setBowId={form.setBowId}
								arrowsId={form.arrowsId}
								setArrowsId={form.setArrowsId}
								bows={bows}
								arrows={arrows}
								isEditMode={form.isEditMode}
								onDeleteRequest={() => form.setConfirmDeleteOpen(true)}
							/>
						)}
						{form.step === 1 && (
							<PracticeFormRoundsStep
								rounds={form.rounds}
								practiceCategory={form.practiceCategory}
								addRound={form.addRound}
								removeRound={form.removeRound}
								updateRound={form.updateRound}
								onOpenScoring={form.setScoringRoundIndex}
							/>
						)}
						{form.step === 2 && (
							<PracticeFormReflectionStep
								rating={form.rating}
								setRating={form.setRating}
								notes={form.notes}
								setNotes={form.setNotes}
								error={form.error}
							/>
						)}
					</div>

					<PracticeFormNavFooter
						step={form.step}
						onPrev={() => form.setStep((s) => Math.max(s - 1, 0))}
						onNext={() => form.setStep((s) => Math.min(s + 1, 2))}
						isEditMode={form.isEditMode}
						submitting={form.submitting}
						canSave={form.isFormValid}
						onClose={form.handleCloseRequest}
						onSubmit={form.handleSubmit}
					/>
				</div>
			</Modal>

			{form.scoringRoundIndex !== null && (
				<PracticeFormScoringModal
					open
					round={form.rounds[form.scoringRoundIndex]}
					roundIndex={form.scoringRoundIndex}
					environment={form.environment}
					endPage={form.endPages[form.scoringRoundIndex] ?? 0}
					editingIndex={form.editingIndices[form.scoringRoundIndex] ?? null}
					onClose={() => form.setScoringRoundIndex(null)}
					onSetEndPage={form.handleSetEndPage}
					onSetEditingIndex={form.handleSetEditingIndex}
					onAddArrowScore={form.handleScoringAddArrow}
					onUpdateArrowScore={form.handleScoringUpdateArrow}
				/>
			)}

			<ConfirmModal
				open={form.confirmDeleteOpen}
				onClose={() => form.setConfirmDeleteOpen(false)}
				onConfirm={form.handleDelete}
				title={t['practice.deleteConfirmTitle']}
				message={t['practice.deleteConfirmMessage']}
				confirmLabel={t['common.delete']}
				cancelLabel={t['common.cancel']}
				variant="danger"
				isLoading={form.deleting}
			/>

			<ConfirmModal
				open={form.confirmDiscardOpen}
				onClose={() => form.setConfirmDiscardOpen(false)}
				onConfirm={() => {
					form.setConfirmDiscardOpen(false);
					onClose();
				}}
				title={t['practice.discardTitle']}
				message={t['practice.discardMessage']}
				confirmLabel={t['practice.discardConfirm']}
				cancelLabel={t['common.continue']}
				variant="danger"
			/>
		</>
	);
};
