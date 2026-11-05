'use client';

import type { ChallengeListItem } from '@/lib/types';
import { ChallengeCard } from './ChallengeCard';
import styles from './ChallengeList.module.css';
import type { FetchChallengesParams } from '@/lib/hooks';
import { useTranslation } from '@/context/LanguageProvider';

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
  const { t } = useTranslation();
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (loading && challenges.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>{t['challenges.loadingList']}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{t['challenges.errorLabel']} {error.message}</p>
        <button onClick={() => onPageChange({})} className={styles.retryButton}>
          {t['challenges.retry']}
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{t['challenges.emptyTitle']}</p>
        <p>{t['challenges.emptyText']}</p>
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
            {t['common.previous']}
          </button>
          <span className={styles.pageInfo}>
            {t['common.page']} {pagination.page} {t['common.of']} {totalPages}
          </span>
          <button
            onClick={() => onPageChange({ page: Math.min(totalPages, pagination.page + 1) })}
            disabled={pagination.page === totalPages || loading}
            className={styles.pageButton}
          >
            {t['common.next']}
          </button>
        </div>
      )}
    </div>
  );
}
