'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
	AchievementUnlockModal,
	ArrowsModal,
	BowModal,
	CompetitionFormModal,
	Footer,
	Header,
	MobileActionButton,
	PracticeDetailsModal,
	PracticeFormModal,
	PracticesSection,
	usePracticeDetails,
} from '@/components';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import { PracticeFormInput } from '@/components/Practices/PracticeFormModal';
import { CompetitionFormInput } from '@/components/Competitions/CompetitionFormModal';
import type { Arrow, Bow, Practice } from '@/lib/types';
import type { Achievement } from '@/lib/achievements/types';

export default function AktivitetPage() {
	const router = useRouter();

	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [practiceFormOpen, setPracticeFormOpen] = useState(false);
	const [practiceFormMode, setPracticeFormMode] = useState<'create' | 'edit'>('create');
	const [competitionFormOpen, setCompetitionFormOpen] = useState(false);
	const [competitionFormMode, setCompetitionFormMode] = useState<'create' | 'edit'>('create');
	const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
	const [bowModalOpen, setBowModalOpen] = useState(false);
	const [arrowsModalOpen, setArrowsModalOpen] = useState(false);
	const [selectedBow, setSelectedBow] = useState<Bow | null>(null);
	const [selectedArrows, setSelectedArrows] = useState<Arrow | null>(null);
	const [practiceReloadKey, setPracticeReloadKey] = useState(0);
	const [deletedPracticeId, setDeletedPracticeId] = useState<string | null>(null);
	const [achievementModalOpen, setAchievementModalOpen] = useState(false);
	const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

	const { fetchPracticeDetails } = usePracticeDetails();
	const { bows, arrows } = useEquipmentData();

	const handleSavePractice = async (input: PracticeFormInput) => {
		const isEditMode = practiceFormMode === 'edit';
		const url = isEditMode && selectedPractice ? `/api/practices/${selectedPractice.id}` : '/api/practices';
		const method = isEditMode ? 'PATCH' : 'POST';

		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!res.ok) {
			let details: any = null;
			try {
				details = await res.json();
			} catch {
				/* ignore */
			}
			let errMsg = `Kunne ikke ${isEditMode ? 'oppdatere' : 'lagre'} trening`;
			const fieldErrors = details?.fieldErrors;
			if (res.status === 400 && fieldErrors && typeof fieldErrors === 'object') {
				errMsg = `Manglende/ugyldige felt:\n${Object.entries(fieldErrors)
					.map(([f, m]) => `${f}: ${m}`)
					.join('\n')}`;
			} else if (details != null && typeof details === 'object' && 'error' in details) {
				errMsg = (details as any).error;
			}
			return Promise.reject(new Error(errMsg));
		}

		setPracticeReloadKey((k) => k + 1);
		setPracticeFormOpen(false);
		if (isEditMode) setSelectedPractice(null);

		if (!isEditMode) {
			try {
				const achievementRes = await fetch('/api/achievements/check', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
				if (achievementRes.ok) {
					const achievementData = await achievementRes.json();
					if (achievementData.newAchievements?.length > 0) {
						setUnlockedAchievements(achievementData.newAchievements);
						setAchievementModalOpen(true);
					}
				}
			} catch {
				/* ignore */
			}
		}
	};

	const handleSaveCompetition = async (input: CompetitionFormInput) => {
		const isEditMode = competitionFormMode === 'edit';
		const url = isEditMode && selectedCompetition ? `/api/competitions/${selectedCompetition.id}` : '/api/competitions';
		const method = isEditMode ? 'PATCH' : 'POST';

		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!res.ok) {
			let details: any = null;
			try {
				details = await res.json();
			} catch {
				/* ignore */
			}
			let errMsg = `Kunne ikke ${isEditMode ? 'oppdatere' : 'lagre'} konkurranse`;
			const fieldErrors = details?.fieldErrors;
			if (res.status === 400 && fieldErrors && typeof fieldErrors === 'object') {
				errMsg = `Manglende/ugyldige felt:\n${Object.entries(fieldErrors)
					.map(([f, m]) => `${f}: ${m}`)
					.join('\n')}`;
			} else if (details != null && typeof details === 'object' && 'error' in details) {
				errMsg = (details as any).error;
			}
			return Promise.reject(new Error(errMsg));
		}

		setPracticeReloadKey((k) => k + 1);
		setCompetitionFormOpen(false);
		if (isEditMode) setSelectedCompetition(null);

		if (!isEditMode) {
			try {
				const achievementRes = await fetch('/api/achievements/check', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
				if (achievementRes.ok) {
					const achievementData = await achievementRes.json();
					if (achievementData.newAchievements?.length > 0) {
						setUnlockedAchievements(achievementData.newAchievements);
						setAchievementModalOpen(true);
					}
				}
			} catch {
				/* ignore */
			}
		}
	};

	const handlePracticeDeleted = (id: string) => {
		setDeletedPracticeId(id);
		setSelectedPractice(null);
		setPracticeModalOpen(false);
	};

	const handlePracticeDeletedFromForm = (id: string) => {
		setDeletedPracticeId(id);
		setSelectedPractice(null);
		setPracticeFormOpen(false);
	};

	const handleSelectPractice = async (id: string, practiceType?: string) => {
		const full = await fetchPracticeDetails(id, practiceType);
		if (full) {
			setSelectedPractice(full);
			setPracticeModalOpen(true);
		}
	};

	return (
		<div className={styles.page}>
			<Header />
			<main id="main-content" className={styles.main}>
				<div className={styles.pageHeader}>
					<div className={styles.titleGroup}>
						<h1 className={styles.pageTitle}>Aktivitet</h1>
						<p className={styles.pageSubtitle}>Alle dine treninger og konkurranser</p>
					</div>
				</div>

				<PracticesSection
					onCreate={() => {
						setPracticeFormMode('create');
						setPracticeFormOpen(true);
					}}
					onCreateCompetition={() => {
						setCompetitionFormMode('create');
						setCompetitionFormOpen(true);
					}}
					onSelectPractice={handleSelectPractice}
					reloadKey={practiceReloadKey}
					deletedPracticeId={deletedPracticeId}
				/>
			</main>
			<Footer />

			<PracticeDetailsModal
				open={practiceModalOpen}
				practice={selectedPractice || undefined}
				onClose={() => {
					setPracticeModalOpen(false);
					setSelectedPractice(null);
				}}
				onEdit={() => {
					setPracticeModalOpen(false);
					if (selectedPractice?.practiceType === 'KONKURRANSE') {
						setSelectedCompetition(selectedPractice);
						setCompetitionFormMode('edit');
						setCompetitionFormOpen(true);
					} else {
						setPracticeFormMode('edit');
						setPracticeFormOpen(true);
					}
				}}
				onDeleted={handlePracticeDeleted}
			/>

			<PracticeFormModal
				open={practiceFormOpen}
				mode={practiceFormMode}
				onClose={() => {
					setPracticeFormOpen(false);
					if (practiceFormMode === 'edit') setSelectedPractice(null);
				}}
				onSave={handleSavePractice}
				onDeleted={handlePracticeDeletedFromForm}
				practice={
					practiceFormMode === 'edit' && selectedPractice
						? {
								id: selectedPractice.id,
								date: selectedPractice.date,
								arrowsShot: selectedPractice.arrowsShot,
								location: selectedPractice.location,
								environment: selectedPractice.environment,
								weather: selectedPractice.weather,
								practiceCategory: (selectedPractice as any).practiceCategory,
								notes: selectedPractice.notes,
								rating: (selectedPractice as any).rating,
								bowId: selectedPractice.bowId,
								arrowsId: selectedPractice.arrowsId,
								ends: selectedPractice.ends,
							}
						: undefined
				}
				bows={bows.map((b) => ({ id: b.id, name: b.name, type: b.type, isFavorite: (b as any).isFavorite }))}
				arrows={arrows.map((a) => ({ id: a.id, name: a.name, material: a.material, isFavorite: (a as any).isFavorite }))}
			/>

			<CompetitionFormModal
				open={competitionFormOpen}
				mode={competitionFormMode}
				onClose={() => {
					setCompetitionFormOpen(false);
					if (competitionFormMode === 'edit') setSelectedCompetition(null);
				}}
				onSave={handleSaveCompetition}
				competition={
					competitionFormMode === 'edit' && selectedCompetition
						? {
								id: selectedCompetition.id,
								date: selectedCompetition.date,
								name: selectedCompetition.name,
								location: selectedCompetition.location,
								organizerName: selectedCompetition.organizerName,
								environment: selectedCompetition.environment,
								weather: selectedCompetition.weather,
								practiceCategory: selectedCompetition.practiceCategory,
								notes: selectedCompetition.notes,
								placement: selectedCompetition.placement,
								numberOfParticipants: selectedCompetition.numberOfParticipants,
								personalBest: selectedCompetition.personalBest,
								bowId: selectedCompetition.bowId,
								arrowsId: selectedCompetition.arrowsId,
								rounds:
									selectedCompetition.rounds ??
									selectedCompetition.ends?.map((e: any, i: number) => ({
										id: e.id,
										roundNumber: i + 1,
										arrows: e.arrows,
										distanceMeters: e.distanceMeters ?? null,
										targetSizeCm: e.targetSizeCm ?? null,
										roundScore: e.roundScore ?? null,
									})),
							}
						: undefined
				}
				bows={bows.map((b) => ({ id: b.id, name: b.name, type: b.type, isFavorite: (b as any).isFavorite }))}
				arrows={arrows.map((a) => ({ id: a.id, name: a.name, material: a.material, isFavorite: (a as any).isFavorite }))}
			/>

			<BowModal
				open={bowModalOpen}
				onClose={() => {
					setBowModalOpen(false);
					setSelectedBow(null);
				}}
				editingBow={
					selectedBow
						? {
								id: selectedBow.id,
								name: selectedBow.name,
								type: selectedBow.type as any,
								eyeToNock: selectedBow.eyeToNock,
								aimMeasure: selectedBow.aimMeasure,
								eyeToSight: selectedBow.eyeToSight,
								limbs: (selectedBow as any).limbs,
								riser: (selectedBow as any).riser,
								handOrientation: (selectedBow as any).handOrientation,
								drawWeight: (selectedBow as any).drawWeight,
								bowLength: (selectedBow as any).bowLength,
								isFavorite: selectedBow.isFavorite,
								notes: selectedBow.notes,
							}
						: undefined
				}
			/>

			<ArrowsModal
				open={arrowsModalOpen}
				onClose={() => {
					setArrowsModalOpen(false);
					setSelectedArrows(null);
				}}
				editingArrows={
					selectedArrows
						? {
								id: selectedArrows.id,
								name: selectedArrows.name,
								material: selectedArrows.material as any,
								isFavorite: (selectedArrows as any).isFavorite,
								arrowsCount: (selectedArrows as any).arrowsCount ?? null,
								diameter: (selectedArrows as any).diameter ?? null,
								length: selectedArrows.length ?? null,
								weight: (selectedArrows as any).weight ?? null,
								spine: (selectedArrows as any).spine ?? '',
							}
						: undefined
				}
			/>

			{achievementModalOpen && unlockedAchievements.length > 0 && (
				<AchievementUnlockModal
					achievements={unlockedAchievements}
					onClose={() => setAchievementModalOpen(false)}
					onViewAll={() => {
						setAchievementModalOpen(false);
						router.push('/achievements');
					}}
				/>
			)}

			<MobileActionButton
				onCreatePractice={() => {
					setPracticeFormMode('create');
					setPracticeFormOpen(true);
				}}
				onCreateCompetition={() => {
					setCompetitionFormMode('create');
					setCompetitionFormOpen(true);
				}}
				onCreateBow={() => {
					setSelectedBow(null);
					setBowModalOpen(true);
				}}
				onCreateArrows={() => setArrowsModalOpen(true)}
			/>
		</div>
	);
}
