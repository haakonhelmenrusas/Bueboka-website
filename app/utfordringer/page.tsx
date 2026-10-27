'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, ChallengeList, ChallengeForm } from '@/components';
import { useChallenges, type FetchChallengesParams } from '@/lib/hooks';
import type { PublicProfile } from '@/lib/types';
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
    createChallenge,
  } = useChallenges();

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<PublicProfile | null>(null);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Modal state management
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedOpponent(null);
    setSearchQuery('');
    setProfiles([]);
    setModalError(null);
  };

  // Fetch profiles for opponent selection
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

  const handleSubmitChallenge = async (data: any) => {
    try {
      setModalError(null);
      if (!selectedOpponent) {
        throw new Error('Vennligst velg en motstander');
      }
      await createChallenge({ ...data, challengedId: selectedOpponent.id });
      closeModal();
      fetchChallenges({ status: filterStatus as any || undefined });
    } catch (err) {
      console.error('Error creating challenge:', err);
      setModalError(err instanceof Error ? err.message : 'Kunne ikke lage utfordring');
    }
  };

  const handleCreateNew = () => {
    openModal();
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

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ny utfordring</h2>
              <p className={styles.modalSubtitle}>
                Velg en motstander og opprett en utfordring
              </p>
              <button onClick={closeModal} className={styles.closeButton}>
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              {!selectedOpponent ? (
                <div className={styles.selectOpponent}>
                  <h3 className={styles.sectionTitle}>Finn motstander</h3>
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
                    <h3 className={styles.sectionTitle}>Valgt motstander</h3>
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
                    onSubmit={handleSubmitChallenge}
                    onCancel={closeModal}
                    loading={loading}
                  />
                </div>
              )}

              {modalError && (
                <div className={styles.error}>
                  {modalError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
