'use client';

import { useEffect, useState } from 'react';

const WHATS_NEW_KEY = 'bueboka_whats_new_seen';
const CURRENT_VERSION = '2026-02-24'; // Update this when you want to show the modal again

export function useWhatsNew() {
	const [hasSeenWhatsNew, setHasSeenWhatsNew] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check localStorage to see if user has seen this version
		const seenVersion = localStorage.getItem(WHATS_NEW_KEY);
		const hasSeen = seenVersion === CURRENT_VERSION;
		setHasSeenWhatsNew(hasSeen);
		setIsLoading(false);
	}, []);

	const markAsSeen = () => {
		localStorage.setItem(WHATS_NEW_KEY, CURRENT_VERSION);
		setHasSeenWhatsNew(true);
	};

	const resetWhatsNew = () => {
		localStorage.removeItem(WHATS_NEW_KEY);
		setHasSeenWhatsNew(false);
	};

	return {
		hasSeenWhatsNew,
		isLoading,
		markAsSeen,
		resetWhatsNew,
	};
}
