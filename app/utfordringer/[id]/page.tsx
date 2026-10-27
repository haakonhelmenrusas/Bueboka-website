'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, ChallengeDetail } from '@/components';
import { useChallenges } from '@/lib/hooks';
import type { Challenge } from '@/lib/types';
import styles from './page.module.css';

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { currentChallenge, loading, error, fetchChallengeById, acceptChallenge, declineChallenge, cancelChallenge, deleteChallenge, resetError } = useChallenges();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve params
  useEffect(() => {
    const load = async () => {
      const resolvedParams = await params;
      fetchChallenge(resolvedParams.id);
    };
    load();
  }, [params]);

  const fetchChallenge = async (id: string) => {
    try {
      setIsLoading(true);
      resetError();
      const data = await fetchChallengeById(id);
      setChallenge(data);
    } catch (err) {
      console.error('Error fetching challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'accept' | 'decline' | 'cancel' | 'submit' | 'delete') => {
    if (!challenge) return;

    try {
      switch (action) {
        case 'accept':
          await acceptChallenge(challenge.id);
          setChallenge({ ...challenge, status: 'ACCEPTED' });
          break;
        case 'decline':
          await declineChallenge(challenge.id);
          setChallenge({ ...challenge, status: 'DECLINED' });
          break;
        case 'cancel':
          await cancelChallenge(challenge.id);
          setChallenge({ ...challenge, status: 'CANCELLED' });
          break;
        case 'submit':
          router.push(`/utfordringer/${challenge.id}/resultat`);
          break;
        case 'delete':
          await deleteChallenge(challenge.id);
          router.push('/utfordringer');
          break;
      }
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main id="main-content" className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Laster utfordring...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Header />
        <main id="main-content" className={styles.main}>
          <div className={styles.error}>
            <h2>Feil</h2>
            <p>{error.message}</p>
            <button onClick={() => router.push('/utfordringer')} className={styles.backButton}>
              Tilbake til utfordringer
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className={styles.page}>
        <Header />
        <main id="main-content" className={styles.main}>
          <div className={styles.notFound}>
            <h2>Utfordring ikke funnet</h2>
            <p>Beklager, vi kunne ikke finne denne utfordringen.</p>
            <button onClick={() => router.push('/utfordringer')} className={styles.backButton}>
              Tilbake til utfordringer
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.header}>
          <button onClick={() => router.push('/utfordringer')} className={styles.backButton}>
            ← Tilbake
          </button>
        </div>

        <div className={styles.content}>
          <ChallengeDetail challenge={challenge} onAction={handleAction} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
