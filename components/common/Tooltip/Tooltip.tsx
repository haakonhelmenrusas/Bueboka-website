'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './Tooltip.module.css';

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
	const rootRef = React.useRef<HTMLSpanElement | null>(null);

	React.useEffect(() => {
		if (!open) return;

		const handlePointerDown = (e: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (root.contains(e.target as Node)) return;
			setOpen(false);
			setPinned(false);
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
				setPinned(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

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
					<HelpCircle size={16} />
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
