'use client';

import { useEffect, useState } from 'react';
import type { CreateChallengeInput, PublicProfile } from '@/lib/types';
import { ChallengeForm } from './ChallengeForm';
import { useTranslation } from '@/context/LanguageProvider';
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
  const { t } = useTranslation();
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
        throw new Error(details?.error || t['challenges.form.createError']);
      }

      const { challenge } = await res.json();
      onClose();
      onCreated?.(challenge.id);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : t['challenges.form.createError']);
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
            {t['challenges.modal.title']}
            <span className={styles.modalDescription}>
              {t['challenges.modal.description']}
            </span>
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label={t['common.close']}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {!selectedOpponent ? (
            <div className={styles.selectOpponent}>
              <h3 className={styles.sectionTitle}>{t['challenges.modal.findOpponent']}</h3>
              <input
                type="text"
                placeholder={t['challenges.modal.searchPlaceholder']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />

              {isLoadingProfiles && <p className={styles.loadingText}>{t['challenges.modal.searching']}</p>}

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
                      <span className={styles.profileName}>{profile.name || t['challenges.unknown']}</span>
                      {profile.club && (
                        <span className={styles.profileClub}>{profile.club}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {profiles.length === 0 && searchQuery && !isLoadingProfiles && (
                <p className={styles.noResults}>{t['challenges.modal.noResults']}</p>
              )}

              <p className={styles.instruction}>
                <strong>{t['challenges.modal.instructionPrefix']}</strong> {t['challenges.modal.instruction']}
              </p>
            </div>
          ) : (
            <div className={styles.formContainer}>
              <div className={styles.selectedOpponent}>
                <h3 className={styles.sectionTitle}>{t['challenges.modal.selectedOpponent']}</h3>
                <div className={styles.opponentInfo}>
                  <span className={styles.opponentName}>{selectedOpponent.name || t['challenges.unknown']}</span>
                  {selectedOpponent.club && (
                    <span className={styles.opponentClub}>{selectedOpponent.club}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedOpponent(null)}
                  className={styles.changeButton}
                >
                  {t['challenges.modal.changeOpponent']}
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
