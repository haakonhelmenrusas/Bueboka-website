'use client';

import React, { useState } from 'react';
import styles from './WhatsNewModal.module.css';
import { LuChevronRight } from 'react-icons/lu';
import { Button, Modal } from '@/components';
import { LiaFireAltSolid } from 'react-icons/lia';
import Image from 'next/image';
import { PiChartBarLight, PiCheckSquareLight } from 'react-icons/pi';
import { IoMdTrendingUp } from 'react-icons/io';
import { HiOutlineXMark } from 'react-icons/hi2';
import { useTranslation } from '@/context/LanguageProvider';

function SafeHtml({ text }: { text: string }) {
	const parts = text.split(/(<strong>.*?<\/strong>)/g);
	return (
		<>
			{parts.map((part, i) => {
				const match = part.match(/^<strong>(.*)<\/strong>$/);
				if (match) return <strong key={i}>{match[1]}</strong>;
				return <React.Fragment key={i}>{part}</React.Fragment>;
			})}
		</>
	);
}

interface WhatsNewModalProps {
	open: boolean;
	onClose: () => void;
}

export function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const { t } = useTranslation();

	if (!open) return null;

	const handleClose = () => {
		setCurrentStep(0);
		onClose();
	};

	const steps = [
		{
			title: t['whatsNew.welcomeTitle'],
			subtitle: t['whatsNew.welcomeSubtitle'],
			content: (
				<div className={styles.welcomeContent}>
					<div className={styles.heroSection}>
						<div className={styles.heroIcon}>
							<Image src="/assets/logo.png" alt="Bueboka" width={96} height={96} className={styles.heroLogoImg} />
						</div>
						<p className={styles.heroText}>{t['whatsNew.heroText']}</p>
					</div>
					<div className={styles.featureGrid}>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<LiaFireAltSolid className="w-7 h-7" />
							</div>
							<div>
								<h4>{t['whatsNew.featureLogTitle']}</h4>
								<p>{t['whatsNew.featureLogText']}</p>
							</div>
						</div>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<PiChartBarLight className="w-7 h-7" />
							</div>
							<div>
								<h4>{t['whatsNew.featureStatsTitle']}</h4>
								<p>{t['whatsNew.featureStatsText']}</p>
							</div>
						</div>
						<div className={styles.featureCard}>
							<div className={styles.featureIconWrapper}>
								<IoMdTrendingUp className="w-7 h-7" />
							</div>
							<div>
								<h4>{t['whatsNew.featureProgressTitle']}</h4>
								<p>{t['whatsNew.featureProgressText']}</p>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: t['whatsNew.getStartedTitle'],
			subtitle: t['whatsNew.getStartedSubtitle'],
			content: (
				<div className={styles.stepsContent}>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>1</div>
						<div className={styles.stepText}>
							<h4>{t['whatsNew.step1Title']}</h4>
							<p><SafeHtml text={t['whatsNew.step1Text']} /></p>
						</div>
					</div>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>2</div>
						<div className={styles.stepText}>
							<h4>{t['whatsNew.step2Title']}</h4>
							<p><SafeHtml text={t['whatsNew.step2Text']} /></p>
						</div>
					</div>
					<div className={styles.stepItem}>
						<div className={styles.stepNumber}>3</div>
						<div className={styles.stepText}>
							<h4>{t['whatsNew.step3Title']}</h4>
							<p><SafeHtml text={t['whatsNew.step3Text']} /></p>
						</div>
					</div>
				</div>
			),
		},
		{
			title: t['whatsNew.tipsTitle'],
			subtitle: t['whatsNew.tipsSubtitle'],
			content: (
				<div className={styles.tipsContent}>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>{t['whatsNew.tip1Title']}</strong>
							<p>{t['whatsNew.tip1Text']}</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>{t['whatsNew.tip2Title']}</strong>
							<p>{t['whatsNew.tip2Text']}</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>{t['whatsNew.tip3Title']}</strong>
							<p>{t['whatsNew.tip3Text']}</p>
						</div>
					</div>
					<div className={styles.tipItem}>
						<PiCheckSquareLight className="w-5 h-5" />
						<div>
							<strong>{t['whatsNew.tip4Title']}</strong>
							<p>{t['whatsNew.tip4Text']}</p>
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
			handleClose();
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
			onClose={handleClose}
			title={currentStepData.title}
			maxWidth={800}
			zIndex={300}
			hideHeader
			panelStyle={{ overflow: 'hidden', padding: 0, gap: 0, borderRadius: 'var(--radius-xl)' }}
		>
			<button className={styles.closeBtn} onClick={handleClose} aria-label={t['whatsNew.closeLabel']}>
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
								aria-label={`${t['whatsNew.goToStep']} ${index + 1}`}
							/>
						))}
					</div>
					<div className={styles.actions}>
						{currentStep > 0 && <Button label={t['common.previous']} onClick={handlePrevious} buttonType="outline" width={120} />}
						<Button
							label={isLastStep ? t['whatsNew.getStartedButton'] : t['common.next']}
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
