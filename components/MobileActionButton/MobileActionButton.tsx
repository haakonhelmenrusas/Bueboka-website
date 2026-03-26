'use client';

import React, { useCallback, useRef, useState } from 'react';
import { LuPlus, LuTarget, LuTrophy, LuX } from 'react-icons/lu';
import { GiBowArrow, GiArrowhead } from 'react-icons/gi';
import styles from './MobileActionButton.module.css';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';

export interface MobileActionButtonProps {
	onCreatePractice: () => void;
	onCreateCompetition: () => void;
	onCreateBow: () => void;
	onCreateArrows: () => void;
}

interface ActionItem {
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
}

export const MobileActionButton: React.FC<MobileActionButtonProps> = ({
	onCreatePractice,
	onCreateCompetition,
	onCreateBow,
	onCreateArrows,
}) => {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const close = useCallback(() => setOpen(false), []);
	const toggle = () => setOpen((v) => !v);

	useClickOutside(containerRef, close, open);
	useEscapeKey(close, open);

	const actions: ActionItem[] = [
		{
			label: 'Ny trening',
			icon: <LuTarget size={18} />,
			onClick: () => {
				onCreatePractice();
				close();
			},
		},
		{
			label: 'Ny konkurranse',
			icon: <LuTrophy size={18} />,
			onClick: () => {
				onCreateCompetition();
				close();
			},
		},
		{
			label: 'Ny bue',
			icon: <GiBowArrow size={18} />,
			onClick: () => {
				onCreateBow();
				close();
			},
		},
		{
			label: 'Nye piler',
			icon: <GiArrowhead size={18} style={{ transform: 'rotate(225deg)' }} />,
			onClick: () => {
				onCreateArrows();
				close();
			},
		},
	];

	return (
		<div className={styles.wrapper} ref={containerRef}>
			{open && <div className={styles.backdrop} onClick={close} aria-hidden="true" />}
			<div className={styles.menu}>
				{actions.map((action, index) => (
					<button
						key={action.label}
						className={styles.actionItem}
						style={{ '--item-index': index } as React.CSSProperties}
						onClick={action.onClick}
						tabIndex={open ? 0 : -1}
						aria-hidden={!open}
						type="button"
					>
						<span className={styles.actionLabel}>{action.label}</span>
						<span className={styles.actionIcon}>{action.icon}</span>
					</button>
				))}
			</div>
			<button
				className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
				onClick={toggle}
				aria-label={open ? 'Lukk meny' : 'Opprett nytt'}
				aria-expanded={open}
				type="button"
			>
				{open ? <LuX size={24} /> : <LuPlus size={24} />}
			</button>
		</div>
	);
};
