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
	editingBow?: {
		id: string;
		name: string;
		type: 'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER';
		eyeToNock: number | null;
		aimMeasure: number | null;
		eyeToSight: number | null;
		isFavorite: boolean;
		notes: string | null;
	};
	onProfileUpdate?: () => void;
}

type FormTab = 'profile' | 'bow' | 'arrows';

export function ProfileEditModal({ isOpen, onClose, user, editingBow, onProfileUpdate }: ProfileEditModalProps) {
	const [activeTab, setActiveTab] = useState<FormTab>(editingBow ? 'bow' : 'profile');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	// Profile form
	const [clubInput, setClubInput] = useState(user.club || '');

	// Bow form
	const [bowName, setBowName] = useState(editingBow?.name || '');
	const [bowType, setBowType] = useState<'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER'>(
		editingBow?.type || 'RECURVE'
	);
	const [eyeToNock, setEyeToNock] = useState<string>(editingBow?.eyeToNock?.toString() || '');
	const [aimMeasure, setAimMeasure] = useState<string>(editingBow?.aimMeasure?.toString() || '');
	const [eyeToSight, setEyeToSight] = useState<string>(editingBow?.eyeToSight?.toString() || '');
	const [isFavorite, setIsFavorite] = useState(editingBow?.isFavorite || false);
	const [bowNotes, setBowNotes] = useState(editingBow?.notes || '');

	// Arrows form
	const [arrowName, setArrowName] = useState('');
	const [arrowMaterial, setArrowMaterial] = useState<'KARBON' | 'ALUMINIUM' | 'TREVERK'>('KARBON');

	// Update form when editingBow changes
	React.useEffect(() => {
		if (editingBow) {
			setBowName(editingBow.name);
			setBowType(editingBow.type);
			setEyeToNock(editingBow.eyeToNock?.toString() || '');
			setAimMeasure(editingBow.aimMeasure?.toString() || '');
			setEyeToSight(editingBow.eyeToSight?.toString() || '');
			setIsFavorite(editingBow.isFavorite);
			setBowNotes(editingBow.notes || '');
		}
	}, [editingBow]);

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
			const url = editingBow ? `/api/bows/${editingBow.id}` : '/api/bows';
			const method = editingBow ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: bowName,
					type: bowType,
					eyeToNock: eyeToNock ? parseInt(eyeToNock, 10) : undefined,
					aimMeasure: aimMeasure ? parseInt(aimMeasure, 10) : undefined,
					eyeToSight: eyeToSight ? parseInt(eyeToSight, 10) : undefined,
					isFavorite,
					notes: bowNotes || undefined,
				}),
			});

			if (!response.ok) throw new Error(editingBow ? 'Failed to update bow' : 'Failed to create bow');

			setMessage({ type: 'success', text: editingBow ? 'Bue oppdatert' : 'Bue lagt til' });
			if (!editingBow) {
				setBowName('');
				setEyeToNock('');
				setAimMeasure('');
				setEyeToSight('');
				setIsFavorite(false);
				setBowNotes('');
			}
			setTimeout(() => {
				onProfileUpdate?.();
				if (editingBow) onClose();
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
					<h2 className={styles.title}>{activeTab === 'bow' && editingBow ? 'Rediger bue' : 'Rediger profil'}</h2>
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
									<option value="LONGBOW">Langbue</option>
									<option value="BAREBOW">Barebow</option>
									<option value="HORSEBOW">Hestebue</option>
									<option value="TRADITIONAL">Tradisjonell</option>
									<option value="OTHER">Annet</option>
								</select>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="eyeToNock">Øye til nock</label>
								<div style={{ position: 'relative' }}>
									<input
										id="eyeToNock"
										type="number"
										value={eyeToNock}
										onChange={(e) => setEyeToNock(e.target.value)}
										placeholder="f.eks. 85"
										className={styles.input}
										style={{ paddingRight: '40px' }}
										min="0"
									/>
									<span
										style={{
											position: 'absolute',
											right: '12px',
											top: '50%',
											transform: 'translateY(-50%)',
											color: '#666',
											pointerEvents: 'none',
										}}
									>
										cm
									</span>
								</div>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="aimMeasure">Aim measure</label>
								<div style={{ position: 'relative' }}>
									<input
										id="aimMeasure"
										type="number"
										value={aimMeasure}
										onChange={(e) => setAimMeasure(e.target.value)}
										placeholder="f.eks. 85"
										className={styles.input}
										style={{ paddingRight: '40px' }}
										min="0"
									/>
									<span
										style={{
											position: 'absolute',
											right: '12px',
											top: '50%',
											transform: 'translateY(-50%)',
											color: '#666',
											pointerEvents: 'none',
										}}
									>
										cm
									</span>
								</div>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="eyeToSight">Øye til sight</label>
								<div style={{ position: 'relative' }}>
									<input
										id="eyeToSight"
										type="number"
										value={eyeToSight}
										onChange={(e) => setEyeToSight(e.target.value)}
										placeholder="f.eks. 45"
										className={styles.input}
										style={{ paddingRight: '40px' }}
										min="0"
									/>
									<span
										style={{
											position: 'absolute',
											right: '12px',
											top: '50%',
											transform: 'translateY(-50%)',
											color: '#666',
											pointerEvents: 'none',
										}}
									>
										cm
									</span>
								</div>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="bowNotes">Notater</label>
								<textarea
									id="bowNotes"
									value={bowNotes}
									onChange={(e) => setBowNotes(e.target.value)}
									placeholder="Tilleggsnotater om buen..."
									className={styles.input}
									style={{ resize: 'vertical', minHeight: '80px' }}
								/>
							</div>
							<div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
								<input
									id="isFavorite"
									type="checkbox"
									checked={isFavorite}
									onChange={(e) => setIsFavorite(e.target.checked)}
									style={{ width: 'auto', cursor: 'pointer' }}
								/>
								<label htmlFor="isFavorite" style={{ margin: 0, cursor: 'pointer' }}>
									Favorittbue
								</label>
							</div>
							<button type="submit" disabled={loading} className={styles.submitBtn}>
								{loading ? (editingBow ? 'Oppdaterer...' : 'Legger til...') : editingBow ? 'Oppdater bue' : 'Legg til bue'}
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
