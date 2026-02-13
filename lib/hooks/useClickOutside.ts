import { RefObject, useEffect } from 'react';

/**
 * Hook that handles clicks outside the passed ref element
 * @param ref - React ref object pointing to the element to detect clicks outside of
 * @param handler - Callback function to execute when a click outside is detected
 * @param enabled - Whether the hook is enabled (default: true)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T | null>,
	handler: (event: MouseEvent | TouchEvent) => void,
	enabled: boolean = true
): void {
	useEffect(() => {
		if (!enabled) return;

		const listener = (event: MouseEvent | TouchEvent) => {
			const el = ref.current;

			// Do nothing if clicking ref's element or descendent elements
			if (!el || el.contains(event.target as Node)) {
				return;
			}

			handler(event);
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler, enabled]);
}
