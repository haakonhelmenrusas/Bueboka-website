'use client';

import type { ChallengeListItem } from '@/lib/types';
import { ChallengeCard } from './ChallengeCard';
import styles from './ChallengeList.module.css';
import { useChallenges, type FetchChallengesParams } from '@/lib/hooks';

interface ChallengeListProps {
  challenges: ChallengeListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: Error | null;
  onChallengeAction: (challengeId: string, action: 'accept' | 'decline' | 'cancel' | 'submit' | 'view') => void;
  onPageChange: (params: FetchChallengesParams) => void;
}

export function ChallengeList({
  challenges,
  pagination,
  loading,
  error,
  onChallengeAction,
  onPageChange,
}: ChallengeListProps) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (loading && challenges.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Laster utfordringer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Feil: {error.message}</p>
        <button onClick={() => onPageChange({})} className={styles.retryButton}>
          Prøv igjen
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Ingen utfordringer funnet</p>
        <p>Opprett en ny utfordring for å konkurrere mot andre skyttere</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onAction={onChallengeAction}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange({ page: Math.max(1, pagination.page - 1) })}
            disabled={pagination.page === 1 || loading}
            className={styles.pageButton}
          >
            Forrige
          </button>
          <span className={styles.pageInfo}>
            Side {pagination.page} av {totalPages}
          </span>
          <button
            onClick={() => onPageChange({ page: Math.min(totalPages, pagination.page + 1) })}
            disabled={pagination.page === totalPages || loading}
            className={styles.pageButton}
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}
