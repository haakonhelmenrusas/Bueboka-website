import { RefObject, useEffect } from 'react';

/**
 * Hook that traps focus within a ref element (useful for modals/dropdowns)
 * @param ref - React ref object pointing to the element to trap focus within
 * @param enabled - Whether the hook is enabled (default: true)
 * @param autoFocus - Whether to auto-focus the first focusable element (default: true)
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T | null>,
	enabled: boolean = true,
	autoFocus: boolean = true
): void {
	useEffect(() => {
		if (!enabled) return;

		const element = ref.current;
		if (!element) return;

		// Get all focusable elements
		const getFocusableElements = (): HTMLElement[] => {
			const focusable = element.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			return Array.from(focusable);
		};

		// Auto-focus first element if enabled
		if (autoFocus) {
			setTimeout(() => {
				const focusableElements = getFocusableElements();
				if (focusableElements.length > 0) {
					focusableElements[0].focus();
				}
			}, 0);
		}

		// Handle Tab key to trap focus
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab') return;

			const focusableElements = getFocusableElements();
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			// Shift + Tab on first element -> focus last
			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
			// Tab on last element -> focus first
			else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [ref, enabled, autoFocus]);
}
