import React from 'react';
import { LuFlame, LuMaximize2 } from 'react-icons/lu';

export const PRACTICE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
	SKIVE_INDOOR: <LuFlame className="w-5 h-5" />,
	SKIVE_OUTDOOR: <LuFlame className="w-5 h-5" />,
	JAKT_3D: <LuMaximize2 className="w-5 h-5" />,
	FELT: <LuMaximize2 className="w-5 h-5" />,
};
