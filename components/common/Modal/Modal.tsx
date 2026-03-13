'use client';

import React, { useId } from 'react';
import { LuX } from 'react-icons/lu';
import { useModalBehavior } from '@/lib/hooks';
import styles from './Modal.module.css';

export interface ModalProps {
	/** Controls visibility. When false the modal unmounts entirely. */
	open: boolean;
	onClose: () => void;
	/**
	 * Shown in the header and used as the accessible name.
	 * Required for accessibility even when hideHeader is true (used as aria-label).
	 */
	title: string;
	/**
	 * Overrides the auto-generated aria-labelledby id.
	 * Only needed when an external element must reference the title by a stable id.
	 */
	titleId?: string;
	/** Max-width of the panel in px. Default: 640 */
	maxWidth?: number;
	/** Overlay z-index. Pass a higher value (e.g. 220) for confirmation dialogs. Default: 210 */
	zIndex?: number;
	/**
	 * When false, clicking the backdrop does NOT call onClose.
	 * Useful for complex forms where accidental dismissal should be prevented.
	 * Default: true
	 */
	closeOnBackdrop?: boolean;
	/** Extra CSS class applied to the panel element (not the overlay). */
	panelClassName?: string;
	/**
	 * Additional inline styles applied to the panel element.
	 * Useful for overriding padding/overflow/gap for custom-layout modals.
	 */
	panelStyle?: React.CSSProperties;
	/**
	 * When true, suppresses the built-in title + close-button header.
	 * The component renders no default header; callers are responsible for
	 * providing a close affordance inside `children`.
	 * The `title` value is still used as `aria-label` on the dialog for accessibility.
	 */
	hideHeader?: boolean;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	open,
	onClose,
	title,
	titleId: titleIdProp,
	maxWidth = 640,
	zIndex = 210,
	closeOnBackdrop = true,
	panelClassName,
	panelStyle,
	hideHeader = false,
	children,
}) => {
	const generatedId = useId();
	const titleId = titleIdProp ?? generatedId;

	useModalBehavior({ open, onClose });

	if (!open) return null;

	return (
		<div
			className={styles.overlay}
			style={{ zIndex }}
			onClick={closeOnBackdrop ? onClose : undefined}
			role="presentation"
		>
			<div
				className={`${styles.panel}${panelClassName ? ` ${panelClassName}` : ''}`}
				style={{ maxWidth, ...panelStyle }}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				{...(hideHeader ? { 'aria-label': title } : { 'aria-labelledby': titleId })}
			>
				{!hideHeader && (
					<div className={styles.header}>
						<h2 id={titleId} className={styles.title}>
							{title}
						</h2>
						<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk" type="button">
							<LuX size={20} />
						</button>
					</div>
				)}
				{children}
			</div>
		</div>
	);
};

