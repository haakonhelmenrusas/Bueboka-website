'use client';

import { useEffect } from 'react';

interface UseModalBehaviorOptions {
	open: boolean;
	onClose: () => void;
	/** If true, sets body overflow:hidden while open */
	lockScroll?: boolean;
	/** If true, Escape will call onClose */
	closeOnEscape?: boolean;
}

/**
 * Shared modal UX behavior:
 * - Close on Escape
 * - Disable background scroll while open
 */
export function useModalBehavior({ open, onClose, lockScroll = true, closeOnEscape = true }: UseModalBehaviorOptions) {
	useEffect(() => {
		if (!open) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (!closeOnEscape) return;
			if (e.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);

		let prevOverflow: string | null = null;
		if (lockScroll) {
			prevOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			if (lockScroll) {
				document.body.style.overflow = prevOverflow ?? '';
			}
		};
	}, [open, onClose, lockScroll, closeOnEscape]);
}
