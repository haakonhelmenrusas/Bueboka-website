'use client';

import type { ChallengeStatus } from '@/lib/types';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './ChallengeStatusBadge.module.css';

interface ChallengeStatusBadgeProps {
  status: ChallengeStatus;
}

export const statusColors: Record<ChallengeStatus, string> = {
  PENDING: '#F39C12', // Orange
  ACCEPTED: '#2ECC71', // Green
  DECLINED: '#E74C3C', // Red
  COMPLETED: '#3498DB', // Blue
  CANCELLED: '#95A5A6', // Gray
};

export function ChallengeStatusBadge({ status }: ChallengeStatusBadgeProps) {
  const { t } = useTranslation();
  const color = statusColors[status];

  const texts: Record<ChallengeStatus, string> = {
    PENDING: t['challenges.status.PENDING'],
    ACCEPTED: t['challenges.status.ACCEPTED'],
    DECLINED: t['challenges.status.DECLINED'],
    COMPLETED: t['challenges.status.COMPLETED'],
    CANCELLED: t['challenges.status.CANCELLED'],
  };

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {texts[status]}
    </span>
  );
}
