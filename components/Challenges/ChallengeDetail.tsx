'use client';

import type { Challenge } from '@/lib/types';
import { ChallengeStatusBadge } from './ChallengeStatusBadge';
import styles from './ChallengeDetail.module.css';
import { useChallenges } from '@/lib/hooks';
import { useTranslation } from '@/context/LanguageProvider';

interface ChallengeDetailProps {
  challenge: Challenge;
  onAction: (action: 'accept' | 'decline' | 'cancel' | 'submit' | 'delete') => void;
}

export function ChallengeDetail({ challenge, onAction }: ChallengeDetailProps) {
  const { t } = useTranslation();
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
    if (!dateString) return t['challenges.detail.notSet'];
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return t['challenges.detail.notSubmitted'];
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
          <span className={styles.metaLabel}>{t['challenges.detail.created']}</span>
          <span>{formatDate(challenge.createdAt)}</span>
        </div>
      </div>

      {challenge.description && (
        <div className={styles.description}>
          <h2 className={styles.sectionTitle}>{t['challenges.detail.description']}</h2>
          <p>{challenge.description}</p>
        </div>
      )}

      {challenge.customRules && (
        <div className={styles.rules}>
          <h2 className={styles.sectionTitle}>{t['challenges.detail.customRules']}</h2>
          <div className={styles.rulesGrid}>
            {challenge.customRules.distanceMeters && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>{t['challenges.detail.distance']}</span>
                <span>{challenge.customRules.distanceMeters} {t['challenges.detail.meter']}</span>
              </div>
            )}
            {challenge.customRules.distanceFrom && challenge.customRules.distanceTo && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>{t['challenges.detail.distance']}</span>
                <span>
                  {challenge.customRules.distanceFrom} - {challenge.customRules.distanceTo} {t['challenges.detail.meter']}
                </span>
              </div>
            )}
            {challenge.customRules.targetSizeCm && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>{t['challenges.detail.targetSize']}</span>
                <span>{challenge.customRules.targetSizeCm} {t['challenges.detail.cm']}</span>
              </div>
            )}
            {challenge.customRules.numberArrows && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>{t['challenges.detail.arrows']}</span>
                <span>{challenge.customRules.numberArrows}</span>
              </div>
            )}
            {challenge.customRules.targetType && (
              <div className={styles.ruleItem}>
                <span className={styles.ruleLabel}>{t['challenges.detail.targetType']}</span>
                <span>{challenge.customRules.targetType}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.participants}>
        <h2 className={styles.sectionTitle}>{t['challenges.detail.participants']}</h2>
        <div className={styles.participantsList}>
          <div className={styles.participant}>
            <span className={styles.participantName}>
              {isOwner ? t['challenges.you'] : opponentName}
            </span>
            <span className={styles.participantScore}>
              {formatScore(userScore)} {userTotalArrows ? `(${userTotalArrows} ${t['challenges.detail.arrowsCount']})` : ''}
            </span>
            {hasSubmittedResult(challenge) && (
              <span className={styles.submittedBadge}>{t['challenges.detail.submitted']}</span>
            )}
          </div>
          <div className={styles.participant}>
            <span className={styles.participantName}>{opponentName}</span>
            <span className={styles.participantScore}>
              {formatScore(opponentScore)} {opponentTotalArrows ? `(${opponentTotalArrows} ${t['challenges.detail.arrowsCount']})` : ''}
            </span>
            {!isCompleted && !isOwner && (
              <span className={styles.participantStatus}>
                {hasSubmittedResult(challenge) ? t['challenges.detail.submitted'] : t['challenges.detail.waiting']}
              </span>
            )}
          </div>
        </div>
      </div>

      {isCompleted && challenge.winnerId && (
        <div className={styles.result}>
          <h2 className={styles.sectionTitle}>{t['challenges.detail.result']}</h2>
          <div className={styles.winner}>
            {t['challenges.winner']}: {challenge.winnerId === (isOwner ? challenge.challengerId : challenge.challengedId) ? t['challenges.you'] : opponentName}
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
              {t['challenges.declineChallenge']}
            </button>
            <button onClick={handleAccept} className={styles.buttonAccept}>
              {t['challenges.acceptChallenge']}
            </button>
          </>
        )}

        {showCancel && (
          <button onClick={handleCancel} className={styles.buttonCancel}>
            {t['challenges.cancelChallenge']}
          </button>
        )}

        {showSubmit && (
          <button onClick={handleSubmit} className={styles.buttonSubmit}>
            {t['challenges.submitResult']}
          </button>
        )}

        {challenge.status === 'PENDING' && isOwner && (
          <button onClick={handleDelete} className={styles.buttonDelete}>
            {t['challenges.deleteChallenge']}
          </button>
        )}
      </div>
    </div>
  );
}
