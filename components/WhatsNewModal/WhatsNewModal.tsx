'use client';

import React, { useEffect, useState } from 'react';
import styles from './WhatsNewModal.module.css';
import { LuChevronRight } from 'react-icons/lu';
import { Button, Modal } from '@/components';
import { LiaFireAltSolid } from 'react-icons/lia';
import { PiChartBarLight, PiCheckSquareLight } from 'react-icons/pi';
import { IoMdTrendingUp } from 'react-icons/io';
import { HiOutlineXMark } from 'react-icons/hi2';

interface WhatsNewModalProps {
	open: boolean;
	onClose: () => void;
}

export function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
	const [currentStep, setCurrentStep] = useState(0);

	// Reset to first step when modal opens
	useEffect(() => {
		if (open) {
			setCurrentStep(0);
		}
	}, [open]);

	if (!open) return null;

	const steps = [
		{
			title: 'Velkommen til Bueboka! 🏹',
			subtitle: 'Din digitale treningsdagbok for bueskyting',
			content: (
				<div className={styles.welcomeContent}>
					<div className={styles.heroSection}>
						<div className={styles.heroIcon}>
							<LiaFireAltSolid className="w-16 h-16 stroke-1" />
						</div>
						<p className={styles.heroText}>
							Bueboka hjelper deg å holde oversikt over treningene dine, følge din utvikling, og forbedre skytingen din.
						</p>
					</div>
					<div className={styles.featureGrid}>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<LiaFireAltSolid className="w-7 h-7" />
							</div>
							<div>
								<h4>Registrer treninger</h4>
								<p>Logg alle treningene dine med detaljer om bue, piler, distanse og score</p>
							</div>
						</div>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<PiChartBarLight className="w-7 h-7" />
							</div>
							<div>
								<h4>Se statistikk</h4>
								<p>Få innsikt i din utvikling med detaljerte grafer og trender</p>
							</div>
						</div>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<IoMdTrendingUp className="w-7 h-7" />
							</div>
							<div>
								<h4>Følg fremgang</h4>
								<p>Hold oversikt over din forbedring over tid</p>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: 'Kom i gang på 3 enkle steg',
			subtitle: 'Slik setter du opp Bueboka',
			content: (
				<div className={styles.stepsContent}>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>1</div>
						<div className={styles.stepText}>
							<h4>Legg til utstyret ditt</h4>
							<p>
								Gå til <strong>Min Side</strong> og legg til buen og pilene dine under "Utstyr"-seksjonen. Marker gjerne favoritter for
								raskere registrering senere!
							</p>
						</div>
					</div>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>2</div>
						<div className={styles.stepText}>
							<h4>Registrer din første trening</h4>
							<p>
								Klikk på <strong>"Ny trening"</strong> for å logge økten din. Legg inn antall piler, score, distanse og eventuelle notater.
							</p>
						</div>
					</div>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>3</div>
						<div className={styles.stepText}>
							<h4>Utforsk statistikken din</h4>
							<p>
								Besøk <strong>Statistikk</strong>-siden for å se din utvikling over tid. Her får du oversikt over trender og forbedringer.
							</p>
						</div>
					</div>
				</div>
			),
		},
		{
			title: 'Tips for best opplevelse',
			subtitle: 'Få mest mulig ut av Bueboka',
			content: (
				<div className={styles.tipsContent}>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>Vurder treningene dine</strong>
							<p>Bruk vurderingsskalaen (1-10) for å evaluere hvordan økten gikk</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>Skriv notater</strong>
							<p>Legg til notater om hva som fungerte bra og hva som kan forbedres</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>Vær konsistent</strong>
							<p>Logg alle treningene dine for å få best mulig oversikt over utviklingen</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>Eksporter dataene dine</strong>
							<p>Du kan laste ned statistikken din som CSV for videre analyse</p>
						</div>
					</div>
				</div>
			),
		},
	];

	const isLastStep = currentStep === steps.length - 1;
	const currentStepData = steps[currentStep];

	const handleNext = () => {
		if (isLastStep) {
			onClose();
		} else {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={currentStepData.title}
			maxWidth={800}
			zIndex={300}
			hideHeader
			panelStyle={{ overflow: 'hidden', padding: 0, gap: 0, borderRadius: 'var(--radius-xl)' }}
		>
			<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
				<HiOutlineXMark className="w-6 h-6" />
			</button>

			<div className={styles.content}>
				<div className={styles.header}>
					<h2 id="whats-new-title" className={styles.title}>
						{currentStepData.title}
					</h2>
					<p className={styles.subtitle}>{currentStepData.subtitle}</p>
				</div>

				<div className={styles.body}>{currentStepData.content}</div>

				<div className={styles.footer}>
					<div className={styles.progressDots}>
						{steps.map((_, index) => (
							<button
								key={index}
								className={`${styles.dot} ${index === currentStep ? styles.dotActive : ''} ${index < currentStep ? styles.dotCompleted : ''}`}
								onClick={() => setCurrentStep(index)}
								aria-label={`Gå til steg ${index + 1}`}
							/>
						))}
					</div>
					<div className={styles.actions}>
						{currentStep > 0 && <Button label="Forrige" onClick={handlePrevious} buttonType="outline" width={120} />}
						<Button
							label={isLastStep ? 'Kom i gang!' : 'Neste'}
							onClick={handleNext}
							icon={<LuChevronRight className="w-4 h-4" />}
							iconPosition="right"
							width={isLastStep ? 160 : 120}
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}
