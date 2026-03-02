import React from 'react';
import { ArrowsPointingOutIcon, FireIcon } from '@heroicons/react/24/outline';

export const PRACTICE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
	SKIVE_INDOOR: <FireIcon className="w-5 h-5" />,
	SKIVE_OUTDOOR: <FireIcon className="w-5 h-5" />,
	JAKT_3D: <ArrowsPointingOutIcon className="w-5 h-5" />,
	FELT: <ArrowsPointingOutIcon className="w-5 h-5" />,
};
