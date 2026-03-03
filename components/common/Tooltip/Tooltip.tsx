'use client';

import React, { useCallback } from 'react';
import { LuCircleHelp } from 'react-icons/lu';
import styles from './Tooltip.module.css';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';

type TooltipProps = {
	text: string;
	/** Accessible label for the trigger button */
	label?: string;
	/** Optional custom trigger (defaults to a help icon button) */
	trigger?: React.ReactNode;
};

export function Tooltip({ text, label = 'Vis hjelpetekst', trigger }: TooltipProps) {
	const [open, setOpen] = React.useState(false);
	// Tracks if the tooltip was opened via click toggle. If so, don't auto-close on mouse leave.
	const [pinned, setPinned] = React.useState(false);
	const rootRef = React.useRef<HTMLSpanElement>(null);

	// Use custom hooks for better separation of concerns
	const handleClickOutside = useCallback(() => {
		setOpen(false);
		setPinned(false);
	}, []);

	const handleEscapeKey = useCallback(() => {
		setOpen(false);
		setPinned(false);
	}, []);

	useClickOutside(rootRef, handleClickOutside, open);
	useEscapeKey(handleEscapeKey, open);

	const handleHoverOpen = () => {
		if (!pinned) setOpen(true);
	};

	const handleHoverClose = () => {
		if (!pinned) setOpen(false);
	};

	const handleToggleClick = () => {
		setOpen((prev) => {
			const next = !prev;
			setPinned(next);
			return next;
		});
	};

	return (
		<span ref={rootRef} className={styles.wrapper} onMouseEnter={handleHoverOpen} onMouseLeave={handleHoverClose}>
			{trigger ? (
				<span className={styles.trigger} onClick={handleToggleClick} role="button" tabIndex={0}>
					{trigger}
				</span>
			) : (
				<button type="button" className={styles.button} aria-label={label} aria-expanded={open} onClick={handleToggleClick}>
					<LuCircleHelp size={16} />
				</button>
			)}

			{open ? (
				<span role="tooltip" className={styles.tooltip}>
					{text}
				</span>
			) : null}
		</span>
	);
}
