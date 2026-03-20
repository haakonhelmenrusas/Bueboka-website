'use client';

import React, { useRef, useState } from 'react';
import { Modal, Button } from '@/components';
import { useModalBehavior } from '@/lib/hooks';
import { SessionShareCard } from './SessionShareCard';
import type { SessionShareData } from './SessionShareCard';
import styles from './SessionShareModal.module.css';
import { LuDownload, LuCopy, LuCheck } from 'react-icons/lu';

interface SessionShareModalProps {
	open: boolean;
	onClose: () => void;
	data: SessionShareData;
}

export const SessionShareModal: React.FC<SessionShareModalProps> = ({ open, onClose, data }) => {
	useModalBehavior({ open, onClose });

	const captureRef = useRef<HTMLDivElement>(null);
	const [downloading, setDownloading] = useState(false);
	const [copying, setCopying] = useState(false);
	const [copied, setCopied] = useState(false);

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

	const handleDownload = async () => {
		setDownloading(true);
		try {
			const blob = await captureImage();
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const dateStr = new Date(data.date).toISOString().slice(0, 10);
			a.download = `bueboka-okting-${dateStr}.png`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Nedlasting feilet:', err);
			alert('Kunne ikke laste ned bildet. Prøv igjen.');
		} finally {
			setDownloading(false);
		}
	};

	const handleCopy = async () => {
		setCopying(true);
		try {
			const blob = await captureImage();
			if (!blob) return;

			// Try native clipboard API first (Chrome/Edge)
			if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
				setCopied(true);
				setTimeout(() => setCopied(false), 2500);
			} else {
				// Fallback: trigger download instead
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				const dateStr = new Date(data.date).toISOString().slice(0, 10);
				a.download = `bueboka-okting-${dateStr}.png`;
				a.click();
				URL.revokeObjectURL(url);
				alert('Bildet ble lastet ned (utklippstavle ikke tilgjengelig i denne nettleseren).');
			}
		} catch (err) {
			console.error('Kopiering feilet:', err);
			alert('Kunne ikke kopiere bildet. Prøv «Last ned» i stedet.');
		} finally {
			setCopying(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="Del økt" maxWidth={540} panelStyle={{ padding: '24px', gap: '20px' }}>
			<p className={styles.hint}>Last ned eller kopier ditt personlige sammendrag.</p>

			{/* Card preview */}
			<div className={styles.cardWrapper}>
				<SessionShareCard ref={captureRef} data={data} />
			</div>

			{/* Actions */}
			<div className={styles.actions}>
				<Button
					label={copying ? 'Kopierer…' : copied ? 'Kopiert!' : 'Kopier til utklippstavle'}
					onClick={handleCopy}
					disabled={copying || downloading}
					buttonType="outline"
					icon={copied ? <LuCheck size={18} /> : <LuCopy size={18} />}
					width="100%"
				/>
				<Button
					label={downloading ? 'Laster ned…' : 'Last ned som bilde'}
					onClick={handleDownload}
					disabled={downloading || copying}
					icon={<LuDownload size={18} />}
					width="100%"
				/>
			</div>
		</Modal>
	);
};
