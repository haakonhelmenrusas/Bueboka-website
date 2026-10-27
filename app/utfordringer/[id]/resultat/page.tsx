'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, ChallengeStatusBadge } from '@/components';
import { useChallenges } from '@/lib/hooks';
import type { Challenge } from '@/lib/types';
import styles from './page.module.css';

export default function SubmitChallengeResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { currentChallenge, loading, error, fetchChallengeById, submitChallengeResult, resetError } = useChallenges();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState('');
  const [totalArrows, setTotalArrows] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve params and fetch challenge
  useEffect(() => {
    const load = async () => {
      const resolvedParams = await params;
      fetchChallenge(resolvedParams.id);
    };
    load();
  }, [params]);

  const fetchChallenge = async (id: string) => {
    try {
      setIsSubmitting(false);
      resetError();
      const data = await fetchChallengeById(id);
      setChallenge(data);
    } catch (err) {
      console.error('Error fetching challenge:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge) return;

    try {
      setIsSubmitting(true);
      resetError();

      const result = {
        score: Number(score),
        totalArrows: totalArrows ? Number(totalArrows) : undefined,
      };

      await submitChallengeResult(challenge.id, result);
      router.push(`/utfordringer/${challenge.id}`);
    } catch (err) {
      console.error('Error submitting result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) {
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

  return (
    <div className={styles.page}>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.header}>
          <button onClick={() => router.push(`/utfordringer/${challenge.id}`)} className={styles.backButton}>
            ← Tilbake
          </button>
          <h1 className={styles.title}>Send inn resultat</h1>
          <ChallengeStatusBadge status={challenge.status} />
        </div>

        <div className={styles.content}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{challenge.name}</h2>
            <p className={styles.cardDescription}>
              Mot: {challenge.challenger?.name || challenge.challenged?.name || 'Ukjent'}
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error.message}</div>}

              <div className={styles.field}>
                <label htmlFor="score" className={styles.label}>
                  Totalt poeng *
                </label>
                <input
                  type="number"
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className={styles.input}
                  required
                  min="0"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="totalArrows" className={styles.label}>
                  Antall piler (valgfritt)
                </label>
                <input
                  type="number"
                  id="totalArrows"
                  value={totalArrows}
                  onChange={(e) => setTotalArrows(e.target.value)}
                  className={styles.input}
                  min="0"
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => router.push(`/utfordringer/${challenge.id}`)}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || !score}
                >
                  {isSubmitting ? 'Sender...' : 'Send inn resultat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
