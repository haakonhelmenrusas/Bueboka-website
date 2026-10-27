'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, ChallengeList } from '@/components';
import { useChallenges, type FetchChallengesParams } from '@/lib/hooks';
import styles from './page.module.css';

export default function ChallengesPage() {
  const router = useRouter();
  const {
    challenges,
    pagination,
    loading,
    error,
    user,
    sessionPending,
    fetchChallenges,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    deleteChallenge,
    resetError,
  } = useChallenges();

  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchChallenges({ status: filterStatus as any || undefined });
  }, [filterStatus, fetchChallenges]);

  const handlePageChange = (params: FetchChallengesParams) => {
    fetchChallenges({ ...params, status: filterStatus as any || undefined });
  };

  const handleChallengeAction = async (challengeId: string, action: 'accept' | 'decline' | 'cancel' | 'submit' | 'view') => {
    try {
      switch (action) {
        case 'accept':
          await acceptChallenge(challengeId);
          break;
        case 'decline':
          await declineChallenge(challengeId);
          break;
        case 'cancel':
          await cancelChallenge(challengeId);
          break;
        case 'submit':
          router.push(`/utfordringer/${challengeId}/resultat`);
          break;
        case 'view':
          router.push(`/utfordringer/${challengeId}`);
          break;
      }
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  const handleCreateNew = () => {
    router.push('/utfordringer/ny');
  };

  return (
    <div className={styles.page}>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Utfordringer</h1>
          <p className={styles.subtitle}>
            Konkurrer mot andre skyttere i 1v1 utfordringer
          </p>

          <div className={styles.filterBar}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Alle statuser</option>
              <option value="PENDING">Venter på svar</option>
              <option value="ACCEPTED">Akseptert</option>
              <option value="COMPLETED">Fullført</option>
            </select>

            {!sessionPending && user && (
              <button
                onClick={handleCreateNew}
                className={styles.createButton}
              >
                + Ny utfordring
              </button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <ChallengeList
            challenges={challenges}
            pagination={pagination}
            loading={loading}
            error={error}
            onChallengeAction={handleChallengeAction}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
