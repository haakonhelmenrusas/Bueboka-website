import React from 'react';
import { LuHouse, LuMaximize2 } from 'react-icons/lu';
import { Environment } from '@/lib/prismaEnums';
import { GiArcher } from 'react-icons/gi';
import { CiTrophy } from 'react-icons/ci';
import { Badge } from '@/components/common/Badge/Badge';

type PracticeType = 'TRENING' | 'KONKURRANSE';

interface PracticeTypeBadgeProps {
	practiceType?: PracticeType | string | null;
}

export const PracticeTypeBadge: React.FC<PracticeTypeBadgeProps> = ({ practiceType }) => {
	const isCompetition = practiceType === 'KONKURRANSE';
	return isCompetition ? (
		<Badge variant="competition" icon={<CiTrophy size={14} />}>
			Konkurranse
		</Badge>
	) : (
		<Badge variant="training" icon={<GiArcher size={14} />}>
			Trening
		</Badge>
	);
};

interface EnvironmentBadgeProps {
	environment: Environment;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment }) => (
	<Badge variant="default" icon={environment === 'INDOOR' ? <LuHouse size={14} /> : <LuMaximize2 size={14} />}>
		{environment === 'INDOOR' ? 'Inne' : 'Ute'}
	</Badge>
);
