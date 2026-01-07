'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './ProfileEditModal.module.css';

interface ProfileEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: {
		id: string;
		name: string | null;
		email: string;
		club: string | null;
	};
	onProfileUpdate?: () => void;
}

type FormTab = 'profile' | 'bow' | 'arrows';

export function ProfileEditModal({ isOpen, onClose, user, onProfileUpdate }: ProfileEditModalProps) {
	const [activeTab, setActiveTab] = useState<FormTab>('profile');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	// Profile form
	const [clubInput, setClubInput] = useState(user.club || '');

	// Bow form
	const [bowName, setBowName] = useState('');
	const [bowType, setBowType] = useState<'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER'>('RECURVE');

	// Arrows form
	const [arrowName, setArrowName] = useState('');
	const [arrowMaterial, setArrowMaterial] = useState<'KARBON' | 'ALUMINIUM' | 'TREVERK'>('KARBON');

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ club: clubInput }),
			});

			if (!response.ok) throw new Error('Failed to update profile');

			setMessage({ type: 'success', text: 'Profil oppdatert' });
			setTimeout(() => {
				onProfileUpdate?.();
				onClose();
			}, 1000);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	const handleBowSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/bows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: bowName, type: bowType }),
			});

			if (!response.ok) throw new Error('Failed to create bow');

			setMessage({ type: 'success', text: 'Bue lagt til' });
			setBowName('');
			setTimeout(() => {
				onProfileUpdate?.();
			}, 1000);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	const handleArrowsSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/arrows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: arrowName, material: arrowMaterial }),
			});

			if (!response.ok) throw new Error('Failed to create arrows');

			setMessage({ type: 'success', text: 'Piler lagt til' });
			setArrowName('');
			setTimeout(() => {
				onProfileUpdate?.();
			}, 1000);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h2 className={styles.title}>Rediger profil</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
						<X size={24} />
					</button>
				</div>

				<div className={styles.tabs}>
					<button className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`} onClick={() => setActiveTab('profile')}>
						Profil
					</button>
					<button className={`${styles.tab} ${activeTab === 'bow' ? styles.activeTab : ''}`} onClick={() => setActiveTab('bow')}>
						Legg til bue
					</button>
					<button className={`${styles.tab} ${activeTab === 'arrows' ? styles.activeTab : ''}`} onClick={() => setActiveTab('arrows')}>
						Legg til piler
					</button>
				</div>

				<div className={styles.content}>
					{message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

					{activeTab === 'profile' && (
						<form onSubmit={handleProfileSubmit} className={styles.form}>
							<div className={styles.formGroup}>
								<label htmlFor="club">Klubb</label>
								<input
									id="club"
									type="text"
									value={clubInput}
									onChange={(e) => setClubInput(e.target.value)}
									placeholder="Din klubb"
									className={styles.input}
								/>
							</div>
							<button type="submit" disabled={loading} className={styles.submitBtn}>
								{loading ? 'Lagrer...' : 'Lagre'}
							</button>
						</form>
					)}

					{activeTab === 'bow' && (
						<form onSubmit={handleBowSubmit} className={styles.form}>
							<div className={styles.formGroup}>
								<label htmlFor="bowName">Navn på bue</label>
								<input
									id="bowName"
									type="text"
									value={bowName}
									onChange={(e) => setBowName(e.target.value)}
									placeholder="f.eks. Min recurve bue"
									className={styles.input}
									required
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="bowType">Type</label>
								<select
									id="bowType"
									value={bowType}
									onChange={(e) => setBowType(e.target.value as typeof bowType)}
									className={styles.input}
								>
									<option value="RECURVE">Recurve</option>
									<option value="COMPOUND">Compound</option>
									<option value="LONGBOW">Longbow</option>
									<option value="BAREBOW">Barebow</option>
									<option value="HORSEBOW">Horsebow</option>
									<option value="TRADITIONAL">Traditional</option>
									<option value="OTHER">Annet</option>
								</select>
							</div>
							<button type="submit" disabled={loading} className={styles.submitBtn}>
								{loading ? 'Legger til...' : 'Legg til bue'}
							</button>
						</form>
					)}

					{activeTab === 'arrows' && (
						<form onSubmit={handleArrowsSubmit} className={styles.form}>
							<div className={styles.formGroup}>
								<label htmlFor="arrowName">Navn på piler</label>
								<input
									id="arrowName"
									type="text"
									value={arrowName}
									onChange={(e) => setArrowName(e.target.value)}
									placeholder="f.eks. Mine karbonpiler"
									className={styles.input}
									required
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="arrowMaterial">Material</label>
								<select
									id="arrowMaterial"
									value={arrowMaterial}
									onChange={(e) => setArrowMaterial(e.target.value as typeof arrowMaterial)}
									className={styles.input}
								>
									<option value="KARBON">Karbon</option>
									<option value="ALUMINIUM">Aluminium</option>
									<option value="TREVERK">Treverk</option>
								</select>
							</div>
							<button type="submit" disabled={loading} className={styles.submitBtn}>
								{loading ? 'Legger til...' : 'Legg til piler'}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
