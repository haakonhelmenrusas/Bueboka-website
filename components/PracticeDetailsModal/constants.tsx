import { Crosshair, Footprints, MoreHorizontal, Target } from 'lucide-react';

export const PRACTICE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
	FELT: <Crosshair size={20} />,
	JAKT_3D: <Footprints size={20} />,
	SKIVE: <Target size={20} />,
	ANNET: <MoreHorizontal size={20} />,
};
