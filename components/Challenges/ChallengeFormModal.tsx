'use client';

import { useEffect, useState } from 'react';
import type { CreateChallengeInput, PublicProfile } from '@/lib/types';
import { ChallengeForm } from './ChallengeForm';
import styles from './ChallengeFormModal.module.css';

interface ChallengeFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new challenge's id after it was created successfully */
  onCreated?: (challengeId: string) => void;
}

/**
 * Shared "Ny utfordring" modal: opponent search, then the challenge form.
 * Used by the utfordringer page and the min-side quick actions.
 */
export function ChallengeFormModal({ open, onClose, onCreated }: ChallengeFormModalProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<PublicProfile | null>(null);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Reset the flow every time the modal is opened (adjust state on prop change)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedOpponent(null);
      setProfiles([]);
      setSearchQuery('');
      setModalError(null);
    }
  }

  // Debounced opponent search
  useEffect(() => {
    if (!open) return;

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
  }, [searchQuery, open]);

  const handleSubmit = async (data: CreateChallengeInput) => {
    try {
      setIsSubmitting(true);
      setModalError(null);

      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let details: { error?: string } | null = null;
        try {
          details = await res.json();
        } catch {
          // ignore — fall back to the generic message below
        }
        throw new Error(details?.error || 'Kunne ikke lage utfordring');
      }

      const { challenge } = await res.json();
      onClose();
      onCreated?.(challenge.id);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Kunne ikke lage utfordring');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Ny utfordring
            <span className={styles.modalDescription}>
              Velg en motstander og opprett en utfordring
            </span>
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Lukk">
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
                      onClick={() => {
                        setSelectedOpponent(profile);
                        setSearchQuery('');
                        setProfiles([]);
                      }}
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
                onSubmit={handleSubmit}
                onCancel={onClose}
                loading={isSubmitting}
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
  );
}
