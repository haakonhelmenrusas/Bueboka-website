import { useEffect } from 'react';

/**
 * Hook that handles Escape key presses
 * @param handler - Callback function to execute when Escape is pressed
 * @param enabled - Whether the hook is enabled (default: true)
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled: boolean = true): void {
	useEffect(() => {
		if (!enabled) return;

		const listener = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handler(event);
			}
		};

		document.addEventListener('keydown', listener);

		return () => {
			document.removeEventListener('keydown', listener);
		};
	}, [handler, enabled]);
}
