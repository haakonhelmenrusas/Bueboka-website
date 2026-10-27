'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, ChallengeForm, PublicProfileList } from '@/components';
import { useChallenges } from '@/lib/hooks';
import type { PublicProfile } from '@/lib/types';
import styles from './page.module.css';

export default function CreateChallengePage() {
  const router = useRouter();
  const { createChallenge, loading, error, resetError } = useChallenges();
  const [selectedOpponent, setSelectedOpponent] = useState<PublicProfile | null>(null);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!searchQuery.trim()) {
        setProfiles([]);
        return;
      }

      try {
        setIsLoadingProfiles(true);
        const response = await fetch(`/api/public/profiles?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setProfiles(data.profiles || []);
        }
      } catch (err) {
        console.error('Error searching profiles:', err);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    const debounceTimer = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectOpponent = (profile: PublicProfile) => {
    setSelectedOpponent(profile);
    setSearchQuery('');
    setProfiles([]);
  };

  const handleSubmit = async (data: any) => {
    try {
      resetError();
      if (!selectedOpponent) {
        throw new Error('Vennligst velg en motstander');
      }
      await createChallenge({ ...data, challengedId: selectedOpponent.id });
      router.push('/utfordringer');
    } catch (err) {
      console.error('Error creating challenge:', err);
    }
  };

  const handleCancel = () => {
    router.push('/utfordringer');
  };

  return (
    <div className={styles.page}>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Ny utfordring</h1>
          <p className={styles.subtitle}>
            Velg en motstander og opprett en utfordring
          </p>
        </div>

        <div className={styles.content}>
          {!selectedOpponent ? (
            <div className={styles.selectOpponent}>
              <h2 className={styles.sectionTitle}>Finn motstander</h2>
              <input
                type="text"
                placeholder="Søk etter skytter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />

              {isLoadingProfiles && <p className={styles.loadingText}>Søker...</p>}

              {profiles.length > 0 && (
                <div className={styles.profilesList}>
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={styles.profileItem}
                      onClick={() => handleSelectOpponent(profile)}
                    >
                      <span className={styles.profileName}>{profile.name || 'Ukjent'}</span>
                      {profile.club && (
                        <span className={styles.profileClub}>{profile.club}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {profiles.length === 0 && searchQuery && !isLoadingProfiles && (
                <p className={styles.noResults}>Ingen skyttere funnet</p>
              )}

              <p className={styles.instruction}>
                <strong>Eller:</strong> Be en venn om å opprette en profil og del lenken til profilen sin.
              </p>
            </div>
          ) : (
            <div className={styles.formContainer}>
              <div className={styles.selectedOpponent}>
                <h2 className={styles.sectionTitle}>Valgt motstander</h2>
                <div className={styles.opponentInfo}>
                  <span className={styles.opponentName}>{selectedOpponent.name || 'Ukjent'}</span>
                  {selectedOpponent.club && (
                    <span className={styles.opponentClub}>{selectedOpponent.club}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedOpponent(null)}
                  className={styles.changeButton}
                >
                  Endre motstander
                </button>
              </div>

              <ChallengeForm
                opponent={selectedOpponent}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error.message}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
