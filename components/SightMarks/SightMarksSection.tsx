import { useEffect, useState } from 'react';
import styles from './SightMarksSection.module.css';
import { SightMarksTable } from './SightMarksTable';
import { useSightMarks } from './useSightMarks';

interface SightMarksSectionProps {
	onRefresh?: number;
}

export function SightMarksSection({ onRefresh }: SightMarksSectionProps) {
	const { sightMarks, loading, error, fetchSightMarks, deleteSightMark } = useSightMarks();
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

	useEffect(() => {
		fetchSightMarks();
	}, [fetchSightMarks, onRefresh]);

	const handleDelete = async (id: string) => {
		setIsDeletingId(id);
		try {
			await deleteSightMark(id);
		} finally {
			setIsDeletingId(null);
		}
	};

	if (loading) {
		return (
			<section className={styles.section}>
				<h2 className={styles.title}>Sikte Merkeringer</h2>
				<div className={styles.loading}>Laster...</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.title}>Sikte Merkeringer</h2>
			{error && <div className={styles.error}>{error}</div>}
			<SightMarksTable sightMarks={sightMarks} onDelete={handleDelete} isDeleting={isDeletingId !== null} />
		</section>
	);
}
