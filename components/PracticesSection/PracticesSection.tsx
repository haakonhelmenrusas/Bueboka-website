'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, PracticesList, usePracticeCards } from '@/components';
import styles from './PracticesSection.module.css';
import { LuArrowRight, LuPlus, LuTrophy } from 'react-icons/lu';

interface PracticesSectionProps {
	onCreate: () => void;
	onCreateCompetition?: () => void;
	onSelectPractice: (id: string, practiceType?: string) => void;
	reloadKey?: string | number;
	deletedPracticeId?: string | null;
	/** When true: shows only the 5 most recent items with a "Se alle" link. No filters or pagination. */
	compact?: boolean;
}

export function PracticesSection({
	onCreate,
	onCreateCompetition,
	onSelectPractice,
	reloadKey,
	deletedPracticeId,
	compact = false,
}: PracticesSectionProps) {
	const { cards, page, totalPages, showPagination, loading, filter, setFilter, goToPrev, goToNext, fetchPage, removeLocal } =
		usePracticeCards({
			pageSize: compact ? 5 : 10,
		});

	useEffect(() => {
		if (reloadKey === undefined) return;
		fetchPage(1);
	}, [reloadKey, fetchPage]);

	useEffect(() => {
		if (!deletedPracticeId) return;
		removeLocal(deletedPracticeId);
	}, [deletedPracticeId, removeLocal]);

	const hasPractices = cards.length > 0;

	if (compact) {
		return (
			<section className={styles.practicesSection}>
				<div className={styles.practicesHeader}>
					<h2 className={styles.sectionTitle}>Siste aktivitet</h2>
					<Link href="/aktivitet" className={styles.seeAllLink}>
						Se alle
						<LuArrowRight size={14} />
					</Link>
					<div className={styles.actionButtons}>
						<Button label="Ny trening" onClick={onCreate} icon={<LuPlus size={18} />} />
						{onCreateCompetition && <Button label="Ny konkurranse" onClick={onCreateCompetition} icon={<LuTrophy size={18} />} />}
					</div>
				</div>
				<div className={styles.practicesList}>
					{hasPractices ? (
						<PracticesList practices={cards} onSelectPractice={onSelectPractice} />
					) : (
						<div className={styles.placeholderCard}>Ingen treninger registrert ennå.</div>
					)}
				</div>
			</section>
		);
	}

	return (
		<section className={styles.practicesSection}>
			<div className={styles.practicesHeader}>
				<h2 className={styles.sectionTitle}>Treninger og konkurranser</h2>
			</div>
			<div className={styles.filterContainer}>
				<div className={styles.filterButtons}>
					<button
						className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
						onClick={() => setFilter('all')}
						type="button"
					>
						Alle
					</button>
					<button
						className={`${styles.filterButton} ${filter === 'TRENING' ? styles.filterButtonActive : ''}`}
						onClick={() => setFilter('TRENING')}
						type="button"
					>
						Treninger
					</button>
					<button
						className={`${styles.filterButton} ${filter === 'KONKURRANSE' ? styles.filterButtonActive : ''}`}
						onClick={() => setFilter('KONKURRANSE')}
						type="button"
					>
						Konkurranser
					</button>
				</div>
				<div className={styles.actionButtons}>
					<Button label="Ny trening" onClick={onCreate} icon={<LuPlus size={18} />} />
					{onCreateCompetition && <Button label="Ny konkurranse" onClick={onCreateCompetition} icon={<LuTrophy size={18} />} />}
				</div>
			</div>
			<div className={styles.practicesList}>
				{hasPractices ? (
					<PracticesList practices={cards} onSelectPractice={onSelectPractice} />
				) : (
					<div className={styles.placeholderCard}>Ingen treninger registrert ennå.</div>
				)}
			</div>
			{showPagination ? (
				<div className={styles.pagination}>
					<Button
						label={loading ? 'Laster…' : 'Forrige'}
						size="small"
						width={120}
						loading={loading}
						disabled={loading || page <= 1}
						onClick={goToPrev}
					/>
					<div className={styles.paginationText}>
						Side {page} av {totalPages}
					</div>
					<Button
						label={loading ? 'Laster…' : 'Neste'}
						size="small"
						width={120}
						loading={loading}
						disabled={loading || page >= totalPages}
						onClick={goToNext}
					/>
				</div>
			) : null}
		</section>
	);
}
