import React from 'react';
import { Crosshair, Footprints, Target } from 'lucide-react';

export const PRACTICE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
	SKIVE_INDOOR: <Target size={20} />,
	SKIVE_OUTDOOR: <Target size={20} />,
	JAKT_3D: <Footprints size={20} />,
	FELT: <Crosshair size={20} />,
};
