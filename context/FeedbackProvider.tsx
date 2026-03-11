'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('@/components/FeedbackModal/FeedbackModal').then((mod) => mod.FeedbackModal), { ssr: false });

interface FeedbackContextType {
	openFeedback: () => void;
	closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const openFeedback = () => setIsOpen(true);
	const closeFeedback = () => setIsOpen(false);

	return (
		<FeedbackContext.Provider value={{ openFeedback, closeFeedback }}>
			{children}
			<FeedbackModal open={isOpen} onClose={closeFeedback} />
		</FeedbackContext.Provider>
	);
}

export function useFeedback() {
	const context = useContext(FeedbackContext);
	if (!context) {
		throw new Error('useFeedback must be used within a FeedbackProvider');
	}
	return context;
}
