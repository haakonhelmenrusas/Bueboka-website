'use client';

import Link from 'next/link';
import type { ChallengeListItem } from '@/lib/types';
import { ChallengeStatusBadge } from './ChallengeStatusBadge';
import styles from './ChallengeCard.module.css';
import { useChallenges } from '@/lib/hooks';
import { useTranslation } from '@/context/LanguageProvider';

interface ChallengeCardProps {
  challenge: ChallengeListItem;
  onAction?: (challengeId: string, action: 'accept' | 'decline' | 'cancel' | 'submit' | 'view') => void;
}

export function ChallengeCard({ challenge, onAction }: ChallengeCardProps) {
  const { t } = useTranslation();
  const {
    canCancelChallenge,
    canSubmitResult,
    hasSubmittedResult,
    isChallengeOwner,
    getOpponentName,
  } = useChallenges();

  const showAcceptDecline = challenge.status === 'PENDING';
  const showCancel = canCancelChallenge(challenge);
  const showSubmit = canSubmitResult(challenge);
  const isOwner = isChallengeOwner(challenge);
  const opponentName = getOpponentName(challenge);

  const handleAccept = () => {
    onAction?.(challenge.id, 'accept');
  };

  const handleDecline = () => {
    onAction?.(challenge.id, 'decline');
  };

  const handleCancel = () => {
    onAction?.(challenge.id, 'cancel');
  };

  const handleSubmit = () => {
    onAction?.(challenge.id, 'submit');
  };

  const handleView = () => {
    onAction?.(challenge.id, 'view');
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/utfordringer/${challenge.id}`} className={styles.title} onClick={handleView}>
          {challenge.name}
        </Link>
        <ChallengeStatusBadge status={challenge.status} />
      </div>

      <div className={styles.details}>
        <span className={styles.opponent}>
          {t['challenges.opponent']}: {opponentName}
        </span>
        <span className={styles.date}>
          {new Date(challenge.createdAt).toLocaleDateString('no-NO')}
        </span>
      </div>

      {challenge.status === 'COMPLETED' && (
        <div className={styles.result}>
          {challenge.winnerId ? (
            <span>
              {t['challenges.winner']}: {challenge.winnerId === (challenge.challengerId || challenge.challengedId) ? t['challenges.you'] : opponentName}
            </span>
          ) : (
            <span>{t['challenges.draw']}</span>
          )}
          {challenge.challengerScore !== null && challenge.challengedScore !== null && (
            <span className={styles.scores}>
              {isOwner ? challenge.challengerScore : challenge.challengedScore} - {isOwner ? challenge.challengedScore : challenge.challengerScore}
            </span>
          )}
        </div>
      )}

      {showAcceptDecline && !isOwner && (
        <div className={styles.actions}>
          <button onClick={handleDecline} className={styles.buttonDecline}>
            {t['challenges.decline']}
          </button>
          <button onClick={handleAccept} className={styles.buttonAccept}>
            {t['challenges.accept']}
          </button>
        </div>
      )}

      {showCancel && (
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.buttonCancel}>
            {t['challenges.cancel']}
          </button>
        </div>
      )}

      {showSubmit && !hasSubmittedResult(challenge) && (
        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.buttonSubmit}>
            {t['challenges.submitResult']}
          </button>
        </div>
      )}

      {hasSubmittedResult(challenge) && challenge.status === 'ACCEPTED' && (
        <div className={styles.submitted}>
          {t['challenges.resultSubmitted']}
        </div>
      )}
    </div>
  );
}
