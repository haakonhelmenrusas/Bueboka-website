'use client';

import { useCallback, useEffect } from 'react';
import { useEscapeKey } from './index';

interface UseModalBehaviorOptions {
	open: boolean;
	onClose: () => void;
	/** If true, sets body overflow:hidden while open */
	lockScroll?: boolean;
	/** If true, Escape will call onClose */
	closeOnEscape?: boolean;
}

/**
 * Module-level reference counter tracking how many modal instances are
 * currently locking scroll. Using a counter instead of save/restore
 * prevents a race condition where two modals closing in the same React
 * render cycle would restore 'hidden' as the final overflow value.
 */
let scrollLockCount = 0;

/**
 * Shared modal UX behavior:
 * - Close on Escape
 * - Disable background scroll while open
 */
export function useModalBehavior({ open, onClose, lockScroll = true, closeOnEscape = true }: UseModalBehaviorOptions) {
	// Use the reusable escape key hook
	const handleEscapeKey = useCallback(() => {
		if (closeOnEscape) {
			onClose();
		}
	}, [closeOnEscape, onClose]);

	useEscapeKey(handleEscapeKey, open);

	// Handle scroll locking with a reference counter so that any number of
	// modals can open/close in any order without permanently locking the body.
	useEffect(() => {
		if (!open || !lockScroll) return;

		scrollLockCount++;
		document.body.style.overflow = 'hidden';

		return () => {
			scrollLockCount = Math.max(0, scrollLockCount - 1);
			if (scrollLockCount === 0) {
				document.body.style.overflow = '';
			}
		};
	}, [open, lockScroll]);
}


