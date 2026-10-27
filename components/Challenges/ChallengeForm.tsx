'use client';

import { useState, useEffect } from 'react';
import type { CreateChallengeInput, ChallengeCustomRules } from '@/lib/types';
import type { PublicProfile } from '@/lib/types';
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
    setName(`Utfordring mot ${opponent.name || 'skytter'}`);
  }, [opponent.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Navn er påkrevd');
      return;
    }

    const data: CreateChallengeInput = {
      challengedId: opponent.id,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (startDate) data.startDate = startDate;
    if (endDate) data.endDate = endDate;

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
      setError(err instanceof Error ? err.message : 'Kunne ikke lage utfordring');
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
      <h2 className={styles.title}>Ny utfordring</h2>
      <p className={styles.subtitle}>
        Mot: {opponent.name || 'Ukjent skytter'}
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Navn på utfordring *
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
          Beskrivelse (valgfritt)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={3}
          placeholder="Skriv en beskrivelse av utfordringen..."
        />
      </div>

      <div className={styles.dateFields}>
        <div className={styles.field}>
          <label htmlFor="startDate" className={styles.label}>
            Startdato (valgfritt)
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="endDate" className={styles.label}>
            Sluttdato (valgfritt)
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useCustomRules}
            onChange={(e) => setUseCustomRules(e.target.checked)}
            className={styles.checkbox}
          />
          Bruk egendefinerte regler
        </label>
      </div>

      {useCustomRules && (
        <div className={styles.customRules}>
          <h3 className={styles.sectionTitle}>Egendefinerte regler</h3>

          <div className={styles.rulesGrid}>
            <div className={styles.field}>
              <label htmlFor="distanceMeters" className={styles.label}>
                Avstand (meter)
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
                Avstand fra (meter)
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
                Avstand til (meter)
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
                Målskive størrelse (cm)
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
                Antall piler
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
                Piler uten poeng
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
                Målskive type
              </label>
              <input
                type="text"
                id="targetType"
                value={customRules.targetType ?? ''}
                onChange={(e) => setCustomRules((prev) => ({ ...prev, targetType: e.target.value || null }))}
                className={styles.input}
                placeholder="f.eks. FITA, 3D"
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
          Avbryt
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Lagrer...' : 'Opprett utfordring'}
        </button>
      </div>
    </form>
  );
}
