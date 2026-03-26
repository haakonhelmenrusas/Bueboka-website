'use client';

import { useState } from 'react';
import { Button, Modal, NumberInput } from '@/components';
import { useModalBehavior } from '@/lib/hooks';
import type { CalculatedMarks, FullMarksResult } from '@/types/SightMarks';
import styles from './CalculateMarksModal.module.css';

interface CalculateMarksModalProps {
	open: boolean;
	onClose: () => void;
	ballistics: CalculatedMarks | null;
	sightMarkId: string | null;
	onResultCreated: (result: FullMarksResult) => void;
}

export function CalculateMarksModal({ open, onClose, ballistics, sightMarkId, onResultCreated }: CalculateMarksModalProps) {
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
		if (!distanceFrom) errs.distanceFrom = 'Verdi mangler';
		if (!distanceTo) errs.distanceTo = 'Verdi mangler';
		if (!interval) errs.interval = 'Verdi mangler';
		if (distanceTo <= distanceFrom) errs.distanceTo = 'Til-avstand må være større enn fra-avstand';
		setErrors(errs);
		return Object.keys(errs).length === 0;
	}

	async function handleSubmit() {
		if (!validate()) return;
		if (!ballistics) {
			setErrorMsg('Ballistikkdata mangler. Legg inn et siktemerke først.');
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
				throw new Error(body?.error || 'Kunne ikke beregne siktemerker');
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
					throw new Error(body?.error || 'Kunne ikke lagre resultat');
				}
			}

			onResultCreated(result);
			onClose();
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : 'Kunne ikke beregne siktemerker');
			setStatus('error');
		} finally {
			setStatus('idle');
		}
	}

	return (
		<Modal open={open} onClose={onClose} title="Beregn siktemerker">
			<div className={styles.body}>
				<section className={styles.fieldGroup}>
					<h3 className={styles.groupLabel}>Avstandsrekke</h3>
					<div className={styles.row}>
						<NumberInput
							label="Fra avstand"
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
							label="Til avstand"
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
							label="Intervall"
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
					<h3 className={styles.groupLabel}>Hellvinkel (valgfritt)</h3>
					<p className={styles.groupHint}>Legg inn opptil 3 vinkler for å se siktemerker ved ulik terrengvinkel.</p>
					<div className={styles.row}>
						{[0, 1, 2].map((i) => (
							<NumberInput
								key={i}
								label={`Vinkel ${i + 1}`}
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
					<Button label="Lukk" buttonType="outline" onClick={onClose} disabled={status === 'pending'} />
					<Button label={status === 'pending' ? 'Beregner...' : 'Beregn'} onClick={handleSubmit} disabled={status === 'pending'} />
				</div>
			</div>
		</Modal>
	);
}
