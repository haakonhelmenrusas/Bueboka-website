'use client';

import React, { useRef, useState } from 'react';
import { Modal, Button } from '@/components';
import { SightMarksPrintCard } from './SightMarksPrintCard';
import type { SightMarksPrintData } from './SightMarksPrintCard';
import styles from './SightMarksPrintModal.module.css';
import { LuCheck, LuCopy, LuDownload } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';

interface SightMarksPrintModalProps {
	open: boolean;
	onClose: () => void;
	data: SightMarksPrintData;
}

export function SightMarksPrintModal({ open, onClose, data }: SightMarksPrintModalProps) {
	const { t } = useTranslation();
	const captureRef = useRef<HTMLDivElement>(null);
	const [downloading, setDownloading] = useState(false);
	const [copying, setCopying] = useState(false);
	const [copied, setCopied] = useState(false);

	const slug = data.setName.replace(/\s+/g, '-').toLowerCase();

	const captureImage = async (): Promise<Blob | null> => {
		if (!captureRef.current) return null;
		const { toPng } = await import('html-to-image');
		const el = captureRef.current;
		// Use scrollWidth/scrollHeight so the full card is captured on mobile,
		// even when the element is inside a scrollable modal that may constrain clientHeight.
		const dataUrl = await toPng(el, {
			pixelRatio: 2,
			cacheBust: true,
			width: el.scrollWidth,
			height: el.scrollHeight,
		});
		const res = await fetch(dataUrl);
		return res.blob();
	};

	const triggerDownload = (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bueboka-siktemerker-${slug}.png`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleDownload = async () => {
		setDownloading(true);
		try {
			const blob = await captureImage();
			if (blob) triggerDownload(blob);
		} catch {
			alert(t['sightMarksPrintModal.downloadError']);
		} finally {
			setDownloading(false);
		}
	};

	const handleCopy = async () => {
		setCopying(true);
		try {
			const blob = await captureImage();
			if (!blob) return;
			if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
				setCopied(true);
				setTimeout(() => setCopied(false), 2500);
			} else {
				triggerDownload(blob);
				alert(t['sightMarksPrintModal.copyFallback']);
			}
		} catch {
			alert(t['sightMarksPrintModal.copyError']);
		} finally {
			setCopying(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title={t['sightMarksPrintModal.title']} maxWidth={640} panelStyle={{ padding: '24px', gap: '20px' }}>
			<p className={styles.hint}>{t['sightMarksPrintModal.hint']}</p>

			<div className={styles.cardWrapper}>
				<SightMarksPrintCard ref={captureRef} data={data} />
			</div>

			<div className={styles.actions}>
				<Button
					label={copying ? t['sightMarksPrintModal.copying'] : copied ? t['sightMarksPrintModal.copied'] : t['sightMarksPrintModal.copy']}
					onClick={handleCopy}
					disabled={copying || downloading}
					buttonType="outline"
					icon={copied ? <LuCheck size={18} /> : <LuCopy size={18} />}
					width="100%"
				/>
				<Button
					label={downloading ? t['sightMarksPrintModal.downloading'] : t['sightMarksPrintModal.download']}
					onClick={handleDownload}
					disabled={downloading || copying}
					icon={<LuDownload size={18} />}
					width="100%"
				/>
			</div>
		</Modal>
	);
}
