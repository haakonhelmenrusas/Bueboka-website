'use client';

import type { ChallengeStatus } from '@/lib/types';
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

export const statusTexts: Record<ChallengeStatus, string> = {
  PENDING: 'Venter på svar',
  ACCEPTED: 'Akseptert',
  DECLINED: 'Avslått',
  COMPLETED: 'Fullført',
  CANCELLED: 'Kansellert',
};

export function ChallengeStatusBadge({ status }: ChallengeStatusBadgeProps) {
  const color = statusColors[status];
  const text = statusTexts[status];

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {text}
    </span>
  );
}
