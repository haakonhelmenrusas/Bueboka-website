'use client';

import { useState } from 'react';
import { Button, Modal, NumberInput } from '@/components';
import { useModalBehavior } from '@/lib/hooks';
import type { CalculatedMarks, FullMarksResult } from '@/types/SightMarks';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './CalculateMarksModal.module.css';

interface CalculateMarksModalProps {
	open: boolean;
	onClose: () => void;
	ballistics: CalculatedMarks | null;
	sightMarkId: string | null;
	onResultCreated: (result: FullMarksResult) => void;
}

export function CalculateMarksModal({ open, onClose, ballistics, sightMarkId, onResultCreated }: CalculateMarksModalProps) {
	const { t } = useTranslation();
	const [distanceFrom, setDistanceFrom] = useState(10);
	const [distanceTo, setDistanceTo] = useState(90);
	const [interval, setInterval] = useState(5);
	const [angles, setAngles] = useState<(number | null)[]>([0, null, null]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle');
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useModalBehavior({ open, onClose });

	function setAngle(index: number, value: number | null) {
		setAngles((prev) => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	}

	function validate() {
		const errs: Record<string, string> = {};
		if (!distanceFrom) errs.distanceFrom = t['calculateMarksModal.errorValueMissing'];
		if (!distanceTo) errs.distanceTo = t['calculateMarksModal.errorValueMissing'];
		if (!interval) errs.interval = t['calculateMarksModal.errorValueMissing'];
		if (distanceTo <= distanceFrom) errs.distanceTo = t['calculateMarksModal.errorToGreaterThanFrom'];
		setErrors(errs);
		return Object.keys(errs).length === 0;
	}

	async function handleSubmit() {
		if (!validate()) return;
		if (!ballistics) {
			setErrorMsg(t['calculateMarksModal.errorNoBallisticsData']);
			return;
		}

		setStatus('pending');
		setErrorMsg(null);

		try {
			const validAngles = angles.filter((a) => a !== null && !Number.isNaN(a)) as number[];

			// Send explicit distances so the service computes a mark for every step.
			const allDistances: number[] = [];
			for (let d = distanceFrom; d <= distanceTo + 1e-9; d += interval) {
				allDistances.push(Math.round(d * 1000) / 1000);
			}

			const calcRes = await fetch('/api/sight-marks/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ballistics_pars: ballistics.ballistics_pars,
					distances_def: [distanceFrom, distanceTo, interval],
					distances: allDistances,
					angles: validAngles.length > 0 ? validAngles : [0],
				}),
			});

			if (!calcRes.ok) {
				const body = await calcRes.json().catch(() => ({}));
				throw new Error(body?.error || t['calculateMarksModal.errorCalculate']);
			}

			const rawResult = await calcRes.json();

			// Prefer the service's echoed distances; fall back to the locally-built list.
			const fullDistances: number[] =
				Array.isArray(rawResult.distances) && rawResult.distances.length > 1 ? rawResult.distances : allDistances;

			const result: FullMarksResult = {
				distances: fullDistances,
				sight_marks_by_hill_angle: rawResult.sight_marks_by_hill_angle ?? {},
				arrow_speed_by_angle: rawResult.arrow_speed_by_angle ?? {},
			};

			// Persist the result if we have a sightMarkId
			if (sightMarkId) {
				const saveRes = await fetch(`/api/sight-marks/${sightMarkId}/results`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						distanceFrom,
						distanceTo,
						interval,
						angles: validAngles.length > 0 ? validAngles : [0],
						distances: result.distances,
						sightMarksByAngle: result.sight_marks_by_hill_angle,
						arrowSpeedByAngle: result.arrow_speed_by_angle,
					}),
				});
				if (!saveRes.ok) {
					const body = await saveRes.json().catch(() => ({}));
					throw new Error(body?.error || t['calculateMarksModal.errorSave']);
				}
			}

			onResultCreated(result);
			onClose();
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : t['calculateMarksModal.errorCalculate']);
			setStatus('error');
		} finally {
			setStatus('idle');
		}
	}

	return (
		<Modal open={open} onClose={onClose} title={t['calculateMarksModal.title']}>
			<div className={styles.body}>
				<section className={styles.fieldGroup}>
					<h3 className={styles.groupLabel}>{t['calculateMarksModal.distanceRange']}</h3>
					<div className={styles.row}>
						<NumberInput
							label={t['calculateMarksModal.fromDistance']}
							value={distanceFrom}
							onChange={setDistanceFrom}
							min={1}
							max={300}
							step={1}
							unit="m"
							startEmpty
							errorMessage={errors.distanceFrom}
						/>
						<NumberInput
							label={t['calculateMarksModal.toDistance']}
							value={distanceTo}
							onChange={setDistanceTo}
							min={1}
							max={300}
							step={1}
							unit="m"
							startEmpty
							errorMessage={errors.distanceTo}
						/>
						<NumberInput
							label={t['calculateMarksModal.interval']}
							value={interval}
							onChange={setInterval}
							min={1}
							max={50}
							step={1}
							unit="m"
							startEmpty
							errorMessage={errors.interval}
						/>
					</div>
				</section>

				<section className={styles.fieldGroup}>
					<h3 className={styles.groupLabel}>{t['calculateMarksModal.hillAngle']}</h3>
					<p className={styles.groupHint}>{t['calculateMarksModal.hillAngleHint']}</p>
					<div className={styles.row}>
						<NumberInput
							key={0}
							label={t['calculateMarksModal.flatGround']}
							value={0}
							onChange={() => {}}
							min={0}
							max={0}
							step={0.5}
							unit="°"
							disabled
						/>
						{[1, 2].map((i) => (
							<NumberInput
								key={i}
								label={`${t['calculateMarksModal.angle']} ${i}`}
								value={angles[i] ?? 0}
								onChange={(v) => setAngle(i, v)}
								min={-90}
								max={90}
								step={0.5}
								unit="°"
								startEmpty={angles[i] === null}
								emptyBehavior="ignore"
								onEmpty={() => setAngle(i, null)}
							/>
						))}
					</div>
				</section>

				{errorMsg && (
					<div className={styles.errorBox} role="alert">
						{errorMsg}
					</div>
				)}

				<div className={styles.actions}>
					<Button label={t['common.close']} buttonType="outline" onClick={onClose} disabled={status === 'pending'} />
					<Button label={status === 'pending' ? t['calculateMarksModal.calculating'] : t['calculateMarksModal.calculate']} onClick={handleSubmit} disabled={status === 'pending'} />
				</div>
			</div>
		</Modal>
	);
}
