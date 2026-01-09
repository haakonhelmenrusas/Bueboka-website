'use client';

import React from 'react';
import styles from './page.module.css';
import { Button, PracticesList } from '@/components';
import { Plus } from 'lucide-react';
import type { PracticeCardProps } from '@/components/Practices/PracticeCard';

interface PracticesSectionProps {
	practiceCards: PracticeCardProps[];
	onCreate: () => void;
	onSelectPractice: (id: string) => void;
}

export function PracticesSection({ practiceCards, onCreate, onSelectPractice }: PracticesSectionProps) {
	const hasPractices = practiceCards.length > 0;

	return (
		<section className={styles.practicesSection}>
			<div className={styles.practicesHeader}>
				<h2 className={styles.sectionTitleLight}>Treninger</h2>
				<Button label="Ny trening" onClick={onCreate} icon={<Plus size={18} />} width={240} buttonStyle={{ marginLeft: 'auto' }} />
			</div>
			<div className={styles.practicesList}>
				{hasPractices ? (
					<PracticesList practices={practiceCards} onSelectPractice={onSelectPractice} />
				) : (
					<div className={styles.placeholderCard}>Ingen treninger registrert ennå.</div>
				)}
			</div>
		</section>
	);
}
