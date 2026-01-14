'use client';

import { useEffect } from 'react';
import { Button, PracticesList } from '@/components';
import { Plus } from 'lucide-react';
import styles from './PracticesSection.module.css';
import { usePracticeCards } from './usePracticeCards';

interface PracticesSectionProps {
	onCreate: () => void;
	onSelectPractice: (id: string) => void;
	reloadKey?: string | number;
	deletedPracticeId?: string | null;
}

export function PracticesSection({ onCreate, onSelectPractice, reloadKey, deletedPracticeId }: PracticesSectionProps) {
	const { cards, page, totalPages, showPagination, loading, goToPrev, goToNext, fetchPage, removeLocal } = usePracticeCards({
		pageSize: 10,
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

	return (
		<section className={styles.practicesSection}>
			<div className={styles.practicesHeader}>
				<h2 className={styles.sectionTitle}>Treninger</h2>
				<Button label="Ny trening" onClick={onCreate} icon={<Plus size={18} />} width={240} buttonStyle={{ marginLeft: 'auto' }} />
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
						buttonType="outline"
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
