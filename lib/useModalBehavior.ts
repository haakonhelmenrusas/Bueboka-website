'use client';

import { useCallback, useEffect } from 'react';
import { useEscapeKey } from './hooks';

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
	// Use the reusable escape key hook
	const handleEscapeKey = useCallback(() => {
		if (closeOnEscape) {
			onClose();
		}
	}, [closeOnEscape, onClose]);

	useEscapeKey(handleEscapeKey, open);

	// Handle scroll locking separately
	useEffect(() => {
		if (!open || !lockScroll) return;

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = prevOverflow ?? '';
		};
	}, [open, lockScroll]);
}
