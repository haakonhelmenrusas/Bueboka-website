'use client';

import Link from 'next/link';
import type { ChallengeListItem } from '@/lib/types';
import { ChallengeStatusBadge } from './ChallengeStatusBadge';
import styles from './ChallengeCard.module.css';
import { useChallenges } from '@/lib/hooks';

interface ChallengeCardProps {
  challenge: ChallengeListItem;
  onAction?: (challengeId: string, action: 'accept' | 'decline' | 'cancel' | 'submit' | 'view') => void;
}

export function ChallengeCard({ challenge, onAction }: ChallengeCardProps) {
  const {
    canAcceptChallenge,
    canCancelChallenge,
    canSubmitResult,
    hasSubmittedResult,
    isChallengeOwner,
    getOpponentName,
    getChallengeStatusText,
  } = useChallenges();

  const showAcceptDecline = challenge.status === 'PENDING';
  const showCancel = canCancelChallenge(challenge as any);
  const showSubmit = canSubmitResult(challenge as any);
  const isOwner = isChallengeOwner(challenge as any);
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
          Mot: {opponentName}
        </span>
        <span className={styles.date}>
          {new Date(challenge.createdAt).toLocaleDateString('no-NO')}
        </span>
      </div>

      {challenge.status === 'COMPLETED' && (
        <div className={styles.result}>
          {challenge.winnerId ? (
            <span>
              Vinner: {challenge.winnerId === (challenge.challengerId || challenge.challengedId) ? 'Deg' : opponentName}
            </span>
          ) : (
            <span>Uavgjort</span>
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
            Avslå
          </button>
          <button onClick={handleAccept} className={styles.buttonAccept}>
            Godta
          </button>
        </div>
      )}

      {showCancel && (
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.buttonCancel}>
            Kanseller
          </button>
        </div>
      )}

      {showSubmit && !hasSubmittedResult(challenge as any) && (
        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.buttonSubmit}>
            Send inn resultat
          </button>
        </div>
      )}

      {hasSubmittedResult(challenge as any) && challenge.status === 'ACCEPTED' && (
        <div className={styles.submitted}>
          Resultat sendt inn ✓
        </div>
      )}
    </div>
  );
}
