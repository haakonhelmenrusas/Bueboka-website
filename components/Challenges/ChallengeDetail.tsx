'use client';

import type { Challenge } from '@/lib/types';
import { ChallengeStatusBadge } from './ChallengeStatusBadge';
import styles from './ChallengeDetail.module.css';
import { useChallenges } from '@/lib/hooks';

interface ChallengeDetailProps {
  challenge: Challenge;
  onAction: (action: 'accept' | 'decline' | 'cancel' | 'submit' | 'delete') => void;
}

export function ChallengeDetail({ challenge, onAction }: ChallengeDetailProps) {
  const {
    canAcceptChallenge,
    canCancelChallenge,
    canSubmitResult,
    hasSubmittedResult,
    isChallengeOwner,
    getOpponentName,
    getUserScore,
    isChallengeCompleted,
  } = useChallenges();

  const isOwner = isChallengeOwner(challenge);
  const opponentName = getOpponentName(challenge);
  const userScore = getUserScore(challenge);
  const userTotalArrows = isOwner ? challenge.challengerTotalArrows : challenge.challengedTotalArrows;
  const opponentScore = isOwner ? challenge.challengedScore : challenge.challengerScore;
  const opponentTotalArrows = isOwner ? challenge.challengedTotalArrows : challenge.challengerTotalArrows;

  const showAcceptDecline = canAcceptChallenge(challenge);
  const showCancel = canCancelChallenge(challenge);
  const showSubmit = canSubmitResult(challenge) && !hasSubmittedResult(challenge);
  const isCompleted = isChallengeCompleted(challenge);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Ikke satt';
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'Ikke sendt';
    return score;
  };

  const handleAccept = () => onAction('accept');
  const handleDecline = () => onAction('decline');
  const handleCancel = () => onAction('cancel');
  const handleSubmit = () => onAction('submit');
  const handleDelete = () => onAction('delete');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{challenge.name}</h1>
        <ChallengeStatusBadge status={challenge.status} />
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Opprettet:</span>
          <span>{formatDate(challenge.createdAt)}</span>
        </div>
        {challenge.startDate && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Start:</span>
            <span>{formatDate(challenge.startDate)}</span>
          </div>
        )}
        {challenge.endDate && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Slutt:</span>
            <span>{formatDate(challenge.endDate)}</span>
          </div>
        )}
      </div>

      {challenge.description && (
        <div className={styles.description}>
          <h2 className={styles.sectionTitle}>Beskrivelse</h2>
          <p>{challenge.description}</p>
        </div>
      )}

      {challenge.customRules && (
        <div className={styles.rules}>
          <h2 className={styles.sectionTitle}>Egendefinerte regler</h2>
          <div className={styles.rulesGrid}>
            {challenge.customRules.distanceMeters && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Avstand:</span>
                <span>{challenge.customRules.distanceMeters} meter</span>
              </div>
            )}
            {challenge.customRules.distanceFrom && challenge.customRules.distanceTo && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Avstand:</span>
                <span>
                  {challenge.customRules.distanceFrom} - {challenge.customRules.distanceTo} meter
                </span>
              </div>
            )}
            {challenge.customRules.targetSizeCm && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Målskive størrelse:</span>
                <span>{challenge.customRules.targetSizeCm} cm</span>
              </div>
            )}
            {challenge.customRules.numberArrows && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Antall piler:</span>
                <span>{challenge.customRules.numberArrows}</span>
              </div>
            )}
            {challenge.customRules.arrowsWithoutScore && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Piler uten poeng:</span>
                <span>{challenge.customRules.arrowsWithoutScore}</span>
              </div>
            )}
            {challenge.customRules.targetType && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>Målskive type:</span>
                <span>{challenge.customRules.targetType}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.participants}>
        <h2 className={styles.sectionTitle}>Deltakere</h2>
        <div className={styles.participantsList}>
          <div className={styles.participant}>
            <span className={styles.participantName}>
              {isOwner ? 'Deg' : opponentName}
            </span>
            <span className={styles.participantScore}>
              {formatScore(userScore)} {userTotalArrows ? `(${userTotalArrows} piler)` : ''}
            </span>
            {hasSubmittedResult(challenge) && (
              <span className={styles.submittedBadge}>✓ Sendt</span>
            )}
          </div>
          <div className={styles.participant}>
            <span className={styles.participantName}>{opponentName}</span>
            <span className={styles.participantScore}>
              {formatScore(opponentScore)} {opponentTotalArrows ? `(${opponentTotalArrows} piler)` : ''}
            </span>
            {!isCompleted && !isOwner && (
              <span className={styles.participantStatus}>
                {hasSubmittedResult(challenge) ? '✓ Sendt' : 'Venter'}
              </span>
            )}
          </div>
        </div>
      </div>

      {isCompleted && challenge.winnerId && (
        <div className={styles.result}>
          <h2 className={styles.sectionTitle}>Resultat</h2>
          <div className={styles.winner}>
            Vinner: {challenge.winnerId === (isOwner ? challenge.challengerId : challenge.challengedId) ? 'Deg' : opponentName}
          </div>
          <div className={styles.scores}>
            <span className={styles.score}>
              {formatScore(userScore)} - {formatScore(opponentScore)}
            </span>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {showAcceptDecline && (
          <>
            <button onClick={handleDecline} className={styles.buttonDecline}>
              Avslå utfordring
            </button>
            <button onClick={handleAccept} className={styles.buttonAccept}>
              Godta utfordring
            </button>
          </>
        )}

        {showCancel && (
          <button onClick={handleCancel} className={styles.buttonCancel}>
            Kanseller utfordring
          </button>
        )}

        {showSubmit && (
          <button onClick={handleSubmit} className={styles.buttonSubmit}>
            Send inn resultat
          </button>
        )}

        {challenge.status === 'PENDING' && isOwner && (
          <button onClick={handleDelete} className={styles.buttonDelete}>
            Slett utfordring
          </button>
        )}
      </div>
    </div>
  );
}
