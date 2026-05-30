'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer, Button, SightMarksSection } from '@/components';
import { CalculatedMarksTable } from '@/components/SightMarks/CalculatedMarksTable';
import { CalculateMarksModal } from '@/components/SightMarks/CalculateMarksModal';
import { SightMarkChooserModal } from '@/components/SightMarks/SightMarkChooserModal';
import { SightMarksPrintModal } from '@/components/SightMarks/SightMarksPrintModal';
import type { SightMarksPrintData } from '@/components/SightMarks/SightMarksPrintCard';
import { LuArrowLeft, LuChartLine, LuPrinter, LuRefreshCw, LuTarget, LuTrash2, LuWind } from 'react-icons/lu';
import type { SightMark, SightMarkResult, CalculatedMarks, FullMarksResult } from '@/types/SightMarks';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './page.module.css';

function mapResult(result: SightMarkResult): FullMarksResult {
	return {
		distances: result.distances,
		sight_marks_by_hill_angle: result.sightMarksByAngle as unknown as Record<string, number[]>,
		arrow_speed_by_angle: result.arrowSpeedByAngle as unknown as Record<string, number[]>,
	};
}

export default function SiktemerkerPage() {
	const { t } = useTranslation();
	const router = useRouter();

	const [sightMarks, setSightMarks] = useState<SightMark[]>([]);
	const [activeSightMark, setActiveSightMark] = useState<SightMark | null>(null);
	const [calculatedMarks, setCalculatedMarks] = useState<FullMarksResult | null>(null);
	const [showSpeed, setShowSpeed] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [chooserOpen, setChooserOpen] = useState(false);
	const [printOpen, setPrintOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [deletingResult, setDeletingResult] = useState(false);
	const [activeResultId, setActiveResultId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(
		async (sightMarkId?: string) => {
			setLoading(true);
			setError(null);
			try {
				const smRes = await fetch('/api/sight-marks');
				if (!smRes.ok) {
					if (smRes.status === 401) {
						router.replace('/logg-inn');
						return;
					}
					throw new Error(t['siktemerker.fetchError']);
				}
				const { sightMarks: marks } = (await smRes.json()) as { sightMarks: SightMark[] };
				setSightMarks(marks);

				const current = sightMarkId ? (marks.find((m) => m.id === sightMarkId) ?? marks[0] ?? null) : (marks[0] ?? null);
				setActiveSightMark(current);

				if (!current) {
					setCalculatedMarks(null);
					return;
				}

				const resRes = await fetch(`/api/sight-marks/${current.id}/results`);
				if (!resRes.ok) {
					setCalculatedMarks(null);
					return;
				}
				const { sightMarkResults } = (await resRes.json()) as { sightMarkResults: SightMarkResult[] };

				if (sightMarkResults.length === 0) {
					setCalculatedMarks(null);
					setActiveResultId(null);
					return;
				}

				const latest = sightMarkResults[0];
				setActiveResultId(latest.id);
				setCalculatedMarks(mapResult(latest));
			} catch {
				setError(t['siktemerker.genericError']);
			} finally {
				setLoading(false);
			}
		},
		[router, t]
	);

	const silentRefresh = useCallback(async () => {
		try {
			const smRes = await fetch('/api/sight-marks');
			if (!smRes.ok) return;
			const { sightMarks: marks } = (await smRes.json()) as { sightMarks: SightMark[] };
			setSightMarks(marks);
		} catch {
			// non-critical
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	async function deleteResult(): Promise<boolean> {
		setDeletingResult(true);
		try {
			await fetch(`/api/sight-marks/results/${activeResultId}`, { method: 'DELETE' });
			setCalculatedMarks(null);
			setActiveResultId(null);
			return true;
		} catch {
			return false;
		} finally {
			setDeletingResult(false);
		}
	}

	async function handleRemoveResult() {
		if (!activeResultId) {
			setModalOpen(true);
			return;
		}
		const ok = await deleteResult();
		if (ok) setModalOpen(true);
	}

	async function handleDeleteResult() {
		if (!activeResultId) return;
		await deleteResult();
	}

	function handleChooserConfirm(sm: SightMark) {
		setActiveSightMark(sm);
		setModalOpen(true);
	}

	function handleResultCreated(result: FullMarksResult) {
		setCalculatedMarks(result);
		if (activeSightMark?.id) {
			fetch(`/api/sight-marks/${activeSightMark.id}/results`)
				.then((r) => r.json())
				.then(({ sightMarkResults }: { sightMarkResults: SightMarkResult[] }) => {
					if (sightMarkResults?.length > 0) setActiveResultId(sightMarkResults[0].id);
				})
				.catch(() => {});
		}
	}

	const ballistics = activeSightMark?.ballisticsParameters as CalculatedMarks | null;
	const hasEnoughDistances = (ballistics?.given_distances?.length ?? 0) >= 2;

	function renderEmptyState() {
		if (!activeSightMark) {
			return (
				<div className={styles.emptyCard}>
					<LuTarget size={40} className={styles.emptyIcon} />
					<h2 className={styles.emptyTitle}>{t['siktemerker.noMarks']}</h2>
					<p className={styles.emptyText}>{t['siktemerker.noMarksText']}</p>
				</div>
			);
		}
		if (!hasEnoughDistances) {
			return (
				<div className={styles.emptyCard}>
					<LuTarget size={40} className={styles.emptyIcon} />
					<h2 className={styles.emptyTitle}>{t['siktemerker.fewMarks']}</h2>
					<p className={styles.emptyText}>{t['siktemerker.fewMarksText']}</p>
				</div>
			);
		}
		return (
			<div className={styles.emptyCard}>
				<LuChartLine size={40} className={styles.emptyIcon} />
				<h2 className={styles.emptyTitle}>{t['siktemerker.noCalculated']}</h2>
				<p className={styles.emptyText}>{t['siktemerker.noCalculatedText']}</p>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<Header />
			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<div className={styles.breadcrumb}>
						<Link href="/min-side" className={styles.backLink}>
							<LuArrowLeft size={16} />
							{t['siktemerker.home']}
						</Link>
					</div>
					<h1 className={styles.pageTitle}>
						<LuTarget size={26} aria-hidden="true" />
						{t['siktemerker.title']}
					</h1>
				</div>
				<SightMarksSection onChanged={silentRefresh} />
				<div className={styles.calculatedSection}>
					<div className={styles.calculatedHeader}>
						<div className={styles.calculatedTitleRow}>
							<h2 className={styles.calculatedTitle}>
								<LuChartLine size={20} aria-hidden="true" />
								{t['siktemerker.calculated']}
							</h2>
							{sightMarks.length > 0 && (
								<Button label={t['siktemerker.selectCalculate']} onClick={() => setChooserOpen(true)} icon={<LuTarget size={16} />} />
							)}
						</div>

						{activeSightMark && (
							<div className={styles.infoStrip}>
								<span className={styles.infoItem}>
									<strong>{t['siktemerker.bow']}</strong> {activeSightMark.name || activeSightMark.bow?.name || t['siktemerker.unknownBow']}
								</span>
								{ballistics?.given_distances && (
									<span className={styles.infoItem}>
										<strong>{t['siktemerker.distances']}</strong> {ballistics.given_distances.map((d) => `${d} m`).join(' · ')}
									</span>
								)}
								{ballistics?.arrow_name && (
									<span className={styles.infoItem}>
										<strong>{t['siktemerker.arrows']}</strong> {ballistics.arrow_name}
									</span>
								)}
							</div>
						)}
					</div>
					<div className={styles.card}>
						{loading ? (
							<div className={styles.loadingState}>{t['common.loading']}</div>
						) : error ? (
							<div className={styles.errorBox} role="alert">
								{error}
							</div>
						) : calculatedMarks ? (
							<>
								<CalculatedMarksTable marksData={calculatedMarks} showSpeed={showSpeed} />
								<div className={styles.toolbar}>
									<Button
										label={showSpeed ? t['siktemerker.hideVelocities'] : t['siktemerker.showVelocities']}
										buttonType="outline"
										onClick={() => setShowSpeed((v) => !v)}
										icon={<LuWind size={16} />}
									/>
									<Button label={t['siktemerker.shareOrPrint']} buttonType="outline" onClick={() => setPrintOpen(true)} icon={<LuPrinter size={16} />} />
									<Button
										label={deletingResult ? t['common.deleting'] : t['siktemerker.recalculate']}
										buttonType="outline"
										onClick={handleRemoveResult}
										disabled={deletingResult}
										icon={<LuRefreshCw size={16} />}
									/>
									<Button
										label={deletingResult ? t['common.deleting'] : t['siktemerker.removeCalculation']}
										buttonType="outline"
										onClick={handleDeleteResult}
										disabled={deletingResult || !activeResultId}
										icon={<LuTrash2 size={16} />}
									/>
								</div>
							</>
						) : (
							renderEmptyState()
						)}
					</div>
				</div>
			</main>
			<Footer />
			<CalculateMarksModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				ballistics={ballistics}
				sightMarkId={activeSightMark?.id ?? null}
				onResultCreated={handleResultCreated}
			/>
			<SightMarkChooserModal
				open={chooserOpen}
				onClose={() => setChooserOpen(false)}
				sightMarks={sightMarks}
				currentId={activeSightMark?.id ?? null}
				onChoose={handleChooserConfirm}
			/>

			{calculatedMarks && activeSightMark && (
				<SightMarksPrintModal
					open={printOpen}
					onClose={() => setPrintOpen(false)}
					data={
						{
							marksData: calculatedMarks,
							setName: activeSightMark.name || activeSightMark.bow?.name || t['siktemerker.title'],
							bowName: activeSightMark.bow?.name || t['siktemerker.unknownBow'],
							arrowName: ballistics?.arrow_name,
							givenDistances: ballistics?.given_distances,
							showSpeed,
						} satisfies SightMarksPrintData
					}
				/>
			)}
		</div>
	);
}
