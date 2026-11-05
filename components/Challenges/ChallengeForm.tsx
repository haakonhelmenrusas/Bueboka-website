'use client';

import { useState, useEffect } from 'react';
import type { CreateChallengeInput, ChallengeCustomRules } from '@/lib/types';
import type { PublicProfile } from '@/lib/types';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './ChallengeForm.module.css';

// Type for numeric fields in ChallengeCustomRules
type NumericChallengeRuleField = keyof Omit<ChallengeCustomRules, 'targetType'>;

interface ChallengeFormProps {
  opponent: PublicProfile;
  onSubmit: (data: CreateChallengeInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function ChallengeForm({ opponent, onSubmit, onCancel, loading }: ChallengeFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [useCustomRules, setUseCustomRules] = useState(false);
  const [customRules, setCustomRules] = useState<ChallengeCustomRules>({
    distanceMeters: null,
    distanceFrom: null,
    distanceTo: null,
    targetType: null,
    targetSizeCm: null,
    numberArrows: null,
    arrowsWithoutScore: null,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set a default name
    setName(`${t['challenges.form.defaultName']} ${opponent.name || t['challenges.unknown'].toLowerCase()}`);
  }, [opponent.name, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t['challenges.form.nameRequired']);
      return;
    }

    const data: CreateChallengeInput = {
      challengedId: opponent.id,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (useCustomRules) {
      const rules: ChallengeCustomRules = {};
      if (customRules.distanceMeters !== null) rules.distanceMeters = customRules.distanceMeters;
      if (customRules.distanceFrom !== null) rules.distanceFrom = customRules.distanceFrom;
      if (customRules.distanceTo !== null) rules.distanceTo = customRules.distanceTo;
      if (customRules.targetType) rules.targetType = customRules.targetType;
      if (customRules.targetSizeCm !== null) rules.targetSizeCm = customRules.targetSizeCm;
      if (customRules.numberArrows !== null) rules.numberArrows = customRules.numberArrows;
      if (customRules.arrowsWithoutScore !== null) rules.arrowsWithoutScore = customRules.arrowsWithoutScore;

      // Only add custom rules if at least one field is set
      if (Object.keys(rules).length > 0) {
        data.customRules = rules;
      }
    }

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t['challenges.form.createError']);
    }
  };

  const handleNumberChange = (field: NumericChallengeRuleField, value: string) => {
    const num: number | null = value === '' ? null : Number(value);
    setCustomRules((prev) => ({
      ...prev,
      [field]: !isNaN(num!) ? num : null,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          {t['challenges.form.nameLabel']}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          {t['challenges.form.descriptionLabel']}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={3}
          placeholder={t['challenges.form.descriptionPlaceholder']}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useCustomRules}
            onChange={(e) => setUseCustomRules(e.target.checked)}
            className={styles.checkbox}
          />
          {t['challenges.form.useCustomRules']}
        </label>
      </div>

      {useCustomRules && (
        <div className={styles.customRules}>
          <h3 className={styles.sectionTitle}>{t['challenges.form.customRulesTitle']}</h3>

          <div className={styles.rulesGrid}>
            <div className={styles.field}>
              <label htmlFor="distanceMeters" className={styles.label}>
                {t['challenges.form.distance']}
              </label>
              <input
                type="number"
                id="distanceMeters"
                value={customRules.distanceMeters ?? ''}
                onChange={(e) => handleNumberChange('distanceMeters', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="distanceFrom" className={styles.label}>
                {t['challenges.form.distanceFrom']}
              </label>
              <input
                type="number"
                id="distanceFrom"
                value={customRules.distanceFrom ?? ''}
                onChange={(e) => handleNumberChange('distanceFrom', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="distanceTo" className={styles.label}>
                {t['challenges.form.distanceTo']}
              </label>
              <input
                type="number"
                id="distanceTo"
                value={customRules.distanceTo ?? ''}
                onChange={(e) => handleNumberChange('distanceTo', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="targetSizeCm" className={styles.label}>
                {t['challenges.form.targetSize']}
              </label>
              <input
                type="number"
                id="targetSizeCm"
                value={customRules.targetSizeCm ?? ''}
                onChange={(e) => handleNumberChange('targetSizeCm', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="numberArrows" className={styles.label}>
                {t['challenges.form.numberOfArrows']}
              </label>
              <input
                type="number"
                id="numberArrows"
                value={customRules.numberArrows ?? ''}
                onChange={(e) => handleNumberChange('numberArrows', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="arrowsWithoutScore" className={styles.label}>
                {t['challenges.form.arrowsWithoutScore']}
              </label>
              <input
                type="number"
                id="arrowsWithoutScore"
                value={customRules.arrowsWithoutScore ?? ''}
                onChange={(e) => handleNumberChange('arrowsWithoutScore', e.target.value)}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="targetType" className={styles.label}>
                {t['challenges.form.targetType']}
              </label>
              <input
                type="text"
                id="targetType"
                value={customRules.targetType ?? ''}
                onChange={(e) => setCustomRules((prev) => ({ ...prev, targetType: e.target.value || null }))}
                className={styles.input}
                placeholder={t['challenges.form.targetTypePlaceholder']}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
          {t['common.cancel']}
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? t['common.saving'] : t['challenges.form.create']}
        </button>
      </div>
    </form>
  );
}
