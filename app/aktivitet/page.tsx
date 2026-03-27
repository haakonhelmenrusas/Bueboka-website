'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
	CompetitionFormModal,
	Footer,
	Header,
	PracticeDetailsModal,
	PracticeFormModal,
	PracticesSection,
	usePracticeDetails,
} from '@/components';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import { PracticeFormInput } from '@/components/Practices/PracticeFormModal';
import { CompetitionFormInput } from '@/components/Competitions/CompetitionFormModal';
import type { Practice } from '@/lib/types';
import { LuActivity, LuBookOpen, LuTrendingUp, LuTrophy } from 'react-icons/lu';

export default function AktivitetPage() {
	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [practiceFormOpen, setPracticeFormOpen] = useState(false);
	const [competitionFormOpen, setCompetitionFormOpen] = useState(false);
	const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
	const [deletedPracticeId, setDeletedPracticeId] = useState<string | null>(null);

	const { fetchPracticeDetails } = usePracticeDetails();
	const { bows, arrows } = useEquipmentData();

	const handleSavePractice = async (input: PracticeFormInput) => {
		if (!selectedPractice) return;
		const res = await fetch(`/api/practices/${selectedPractice.id}`, {
			method: 'PATCH',
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
			let errMsg = 'Kunne ikke oppdatere trening';
			if (details != null && typeof details === 'object' && 'error' in details) errMsg = (details as any).error;
			return Promise.reject(new Error(errMsg));
		}
		setPracticeFormOpen(false);
		setSelectedPractice(null);
	};

	const handleSaveCompetition = async (input: CompetitionFormInput) => {
		if (!selectedCompetition) return;
		const res = await fetch(`/api/competitions/${selectedCompetition.id}`, {
			method: 'PATCH',
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
			let errMsg = 'Kunne ikke oppdatere konkurranse';
			if (details != null && typeof details === 'object' && 'error' in details) errMsg = (details as any).error;
			return Promise.reject(new Error(errMsg));
		}
		setCompetitionFormOpen(false);
		setSelectedCompetition(null);
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

	const handleCompetitionDeleted = (id: string) => {
		setDeletedPracticeId(id);
		setSelectedCompetition(null);
		setCompetitionFormOpen(false);
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

				<div className={styles.introBanner}>
					<div className={styles.introBannerIcon}>
						<LuActivity size={24} />
					</div>
					<div className={styles.introBannerText}>
						<h2 className={styles.introBannerTitle}>Din treningslogg</h2>
						<p className={styles.introBannerDescription}>
							Her finner du alle treningene og konkurransene du har registrert. Bla gjennom historikken, se detaljer om enkeltøkter, og hold
							oversikt over fremgangen din over tid.
						</p>
					</div>
					<div className={styles.introBannerPills}>
						<div className={styles.introPill}>
							<LuBookOpen size={16} />
							Treningslogg
						</div>
						<div className={styles.introPill}>
							<LuTrophy size={16} />
							Konkurranser
						</div>
						<div className={styles.introPill}>
							<LuTrendingUp size={16} />
							Fremgang
						</div>
					</div>
				</div>

				<PracticesSection onSelectPractice={handleSelectPractice} deletedPracticeId={deletedPracticeId} />
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
						setCompetitionFormOpen(true);
					} else {
						setPracticeFormOpen(true);
					}
				}}
				onDeleted={handlePracticeDeleted}
			/>

			<PracticeFormModal
				open={practiceFormOpen}
				mode="edit"
				onClose={() => {
					setPracticeFormOpen(false);
					setSelectedPractice(null);
				}}
				onSave={handleSavePractice}
				onDeleted={handlePracticeDeletedFromForm}
				practice={
					selectedPractice
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
				mode="edit"
				onClose={() => {
					setCompetitionFormOpen(false);
					setSelectedCompetition(null);
				}}
				onSave={handleSaveCompetition}
				onDeleted={handleCompetitionDeleted}
				competition={
					selectedCompetition
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
		</div>
	);
}
