'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion, Button, Checkbox, ConfirmModal, EmailVerificationBanner, Footer, Header, ProfileEditModal } from '@/components';
import { signOut } from '@/lib/auth-client';
import { useSession } from '@/context/SessionProvider';
import { LuArrowLeft, LuGlobe, LuKey, LuLock, LuPencil, LuShield, LuTarget } from 'react-icons/lu';
import styles from './page.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export default function SettingsPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	// Public profile settings
	const [isPublic, setIsPublic] = useState(false);
	const [publicName, setPublicName] = useState(true);
	const [publicClub, setPublicClub] = useState(true);
	const [publicStats, setPublicStats] = useState(false);
	const [publicSkytternr, setPublicSkytternr] = useState(false);
	const [publicAchievements, setPublicAchievements] = useState(false);
	const [publicSettingsLoaded, setPublicSettingsLoaded] = useState(false);
	const [publicSettingsSaving, setPublicSettingsSaving] = useState(false);
	const [publicSettingsMessage, setPublicSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	// Account info
	const [profileId, setProfileId] = useState<string | null>(null);
	const [profileName, setProfileName] = useState<string | null>(null);
	const [profileClub, setProfileClub] = useState<string | null>(null);
	const [profileSkytternr, setProfileSkytternr] = useState<string | null>(null);
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [profileModalOpen, setProfileModalOpen] = useState(false);

	useEffect(() => {
		if (!isPending && !session?.user) {
			router.push('/logg-inn');
		}
	}, [session, isPending, router]);

	// Load current public profile settings
	useEffect(() => {
		if (!isPending && session?.user) {
			fetch('/api/profile')
				.then((res) => res.json())
				.then((data) => {
					if (data.profile) {
						setProfileId(data.profile.id);
						setProfileName(data.profile.name ?? null);
						setProfileClub(data.profile.club ?? null);
						setProfileSkytternr(data.profile.skytternr ?? null);
						setProfileImage(data.profile.image ?? null);
						setIsPublic(data.profile.isPublic ?? false);
						setPublicName(data.profile.publicName ?? true);
						setPublicClub(data.profile.publicClub ?? true);
						setPublicStats(data.profile.publicStats ?? false);
						setPublicSkytternr(data.profile.publicSkytternr ?? false);
						setPublicAchievements(data.profile.publicAchievements ?? false);
					}
					setPublicSettingsLoaded(true);
				})
				.catch(() => setPublicSettingsLoaded(true));
		}
	}, [isPending, session]);

	const handleProfileUpdate = () => {
		fetch('/api/profile')
			.then((res) => res.json())
			.then((data) => {
				if (data.profile) {
					setProfileName(data.profile.name ?? null);
					setProfileClub(data.profile.club ?? null);
					setProfileSkytternr(data.profile.skytternr ?? null);
					setProfileImage(data.profile.image ?? null);
				}
			})
			.catch(() => {});
	};

	const handlePublicSettingChange = async (updates: {
		isPublic?: boolean;
		publicName?: boolean;
		publicClub?: boolean;
		publicStats?: boolean;
		publicSkytternr?: boolean;
		publicAchievements?: boolean;
	}) => {
		setPublicSettingsSaving(true);
		setPublicSettingsMessage(null);

		const newValues = {
			isPublic: updates.isPublic ?? isPublic,
			publicName: updates.publicName ?? publicName,
			publicClub: updates.publicClub ?? publicClub,
			publicStats: updates.publicStats ?? publicStats,
			publicSkytternr: updates.publicSkytternr ?? publicSkytternr,
			publicAchievements: updates.publicAchievements ?? publicAchievements,
		};

		// Update local state immediately
		if (updates.isPublic !== undefined) setIsPublic(updates.isPublic);
		if (updates.publicName !== undefined) setPublicName(updates.publicName);
		if (updates.publicClub !== undefined) setPublicClub(updates.publicClub);
		if (updates.publicStats !== undefined) setPublicStats(updates.publicStats);
		if (updates.publicSkytternr !== undefined) setPublicSkytternr(updates.publicSkytternr);
		if (updates.publicAchievements !== undefined) setPublicAchievements(updates.publicAchievements);

		try {
			const res = await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newValues),
			});

			if (!res.ok) {
				setPublicSettingsMessage({ type: 'error', text: t['settings.savingError'] });
			} else {
				setPublicSettingsMessage({ type: 'success', text: t['settings.saveSuccess'] });
				setTimeout(() => setPublicSettingsMessage(null), 3000);
			}
		} catch {
			setPublicSettingsMessage({ type: 'error', text: t['settings.savingError'] });
		} finally {
			setPublicSettingsSaving(false);
		}
	};

	const handleDeleteClick = () => {
		setShowConfirmModal(true);
	};

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		setError(null);

		try {
			const res = await fetch('/api/users/delete', {
				method: 'DELETE',
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || t['settings.deleteAccount']);
			}

			// Sign out to clear session state before redirecting
			await signOut();

			// Redirect to home page after deletion
			router.push('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'En feil oppstod');
			setShowConfirmModal(false);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleBackClick = () => {
		router.push('/min-side');
	};

	// Show nothing while checking session or if not logged in
	if (isPending || !session?.user) {
		return null;
	}

	return (
		<div className={styles.page}>
			<Header />
			<main id="main-content" className={styles.main}>
				<div className={styles.container}>
					<div className={styles.header}>
						<button className={styles.backButton} onClick={handleBackClick} aria-label={t['settings.back']}>
							<LuArrowLeft size={20} />
						</button>
						<h1 className={styles.title}>{t['settings.title']}</h1>
					</div>

					{session.user.email && (
						<EmailVerificationBanner userEmail={session.user.email} emailVerified={session.user.emailVerified || false} />
					)}

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>{t['settings.labelName']}</h2>
						<div className={styles.card}>
							<div className={styles.cardContent}>
								<div className={styles.accountGrid}>
									<div className={styles.userInfo}>
										<p className={styles.label}>{t['settings.labelName']}</p>
										<p className={styles.value}>{profileName ?? '—'}</p>
									</div>
									<div className={styles.userInfo}>
										<p className={styles.label}>{t['settings.labelEmail']}</p>
										<p className={styles.value}>{session.user.email}</p>
									</div>
									<div className={styles.userInfo}>
										<p className={styles.label}>{t['settings.labelClub']}</p>
										<p className={styles.value}>{profileClub ?? '—'}</p>
									</div>
									<div className={styles.userInfo}>
										<p className={styles.label}>{t['settings.labelArcherNumber']}</p>
										<p className={styles.value}>{profileSkytternr ?? '—'}</p>
									</div>
								</div>
								<div className={styles.cardActions}>
									<Button
										label={t['settings.editProfile']}
										buttonType="outline"
										icon={<LuPencil size={14} />}
										onClick={() => setProfileModalOpen(true)}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>
							<span className={styles.sectionTitleWithIcon}>
								<LuGlobe size={20} /> {t['settings.makePublic']}
							</span>
						</h2>
						<div className={styles.card}>
							<div className={styles.cardContent}>
								<p className={styles.privacyText}>{t['settings.makePublicHelp']}</p>
								{publicSettingsLoaded && (
									<>
										<Checkbox
											label={t['settings.makePublic']}
											checked={isPublic}
											onChange={(checked) => handlePublicSettingChange({ isPublic: checked })}
											disabled={publicSettingsSaving}
											helpText={t['settings.makePublicHelp']}
										/>
										{isPublic && (
											<div className={styles.publicSubSettings}>
												<p className={styles.label}>{t['settings.choosePublicFields']}</p>
												<Checkbox
													label={t['settings.labelName']}
													checked={publicName}
													onChange={(checked) => handlePublicSettingChange({ publicName: checked })}
													disabled={publicSettingsSaving}
												/>
												<Checkbox
													label={t['settings.labelClub']}
													checked={publicClub}
													onChange={(checked) => handlePublicSettingChange({ publicClub: checked })}
													disabled={publicSettingsSaving}
												/>
												<Checkbox
													label={t['settings.labelArcherNumber']}
													checked={publicSkytternr}
													onChange={(checked) => handlePublicSettingChange({ publicSkytternr: checked })}
													disabled={publicSettingsSaving}
												/>
												<Checkbox
													label="Statistikk (totalt antall piler og snittpoeng)"
													checked={publicStats}
													onChange={(checked) => handlePublicSettingChange({ publicStats: checked })}
													disabled={publicSettingsSaving}
												/>
												<Checkbox
													label="Prestasjoner (antall oppnådde prestasjoner)"
													checked={publicAchievements}
													onChange={(checked) => handlePublicSettingChange({ publicAchievements: checked })}
													disabled={publicSettingsSaving}
												/>
											</div>
										)}
										{publicSettingsMessage && (
											<div className={publicSettingsMessage.type === 'success' ? styles.successMessage : styles.error}>
												{publicSettingsMessage.text}
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</div>
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Personvern og datasikkerhet</h2>
						<div className={styles.card}>
							<div className={styles.cardContent}>
								<p className={styles.privacyText}>
									Dine data er trygge hos oss. Vi tar personvern på alvor og forplikter oss til å beskytte informasjonen din.
								</p>
								<ul className={styles.privacyList}>
									<li className={styles.privacyItem}>
										<span className={styles.privacyIcon}>
											<LuLock size={18} />
										</span>
										<div>
											<strong>Aldri delt eller solgt</strong>: Vi deler eller selger aldri dataene dine til tredjeparter. Din informasjon
											forblir privat.
										</div>
									</li>
									<li className={styles.privacyItem}>
										<span className={styles.privacyIcon}>
											<LuTarget size={18} />
										</span>
										<div>
											<strong>Kun til appens drift</strong>: Vi bruker kun dataene dine til å drive appen og gi deg den beste
											brukeropplevelsen.
										</div>
									</li>
									<li className={styles.privacyItem}>
										<span className={styles.privacyIcon}>
											<LuKey size={18} />
										</span>
										<div>
											<strong>Din kontroll</strong>: Du kan når som helst slette kontoen din og all tilhørende data.
										</div>
									</li>
									<li className={styles.privacyItem}>
										<span className={styles.privacyIcon}>
											<LuShield size={18} />
										</span>
										<div>
											<strong>Sikker lagring</strong>: All data krypteres og lagres sikkert i samsvar med moderne sikkerhetsstandarder.
										</div>
									</li>
									<li className={styles.privacyItem}>
										<span className={styles.privacyIcon}>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
												<path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
												<path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
											</svg>
										</span>
										<div>
											<strong>Analyse og forbedring</strong>: Vi bruker{' '}
											<a
												href="https://clarity.microsoft.com/"
												target="_blank"
												rel="noopener noreferrer"
												style={{ color: 'var(--primary)', textDecoration: 'underline' }}
											>
												Microsoft Clarity
											</a>{' '}
											for å forstå hvordan nettsiden brukes. Dette hjelper oss med å forbedre brukeropplevelsen. Clarity kan registrere
											økten din, inkludert musebevegelser, klikk og rulling. Ingen personlig identifiserbar informasjon samles inn uten ditt
											samtykke. Les mer om{' '}
											<a
												href="https://privacy.microsoft.com/privacystatement"
												target="_blank"
												rel="noopener noreferrer"
												style={{ color: 'var(--primary)', textDecoration: 'underline' }}
											>
												Microsofts personvernerklæring
											</a>
											.
										</div>
									</li>
								</ul>
								<p className={styles.privacyFooter}>
									Hvis du har spørsmål om hvordan vi håndterer dataene dine, ta gjerne kontakt med oss.
								</p>
							</div>
						</div>
					</div>
					<div className={styles.dangerZone}>
						<div className={styles.dangerCard}>
							<div className={styles.dangerContent}>
								<div className={styles.dangerInfo}>
									<h3 className={styles.dangerHeading}>{t['settings.deleteAccount']}</h3>
									<p className={styles.dangerDescription}>{t['settings.deleteAccountDesc']}</p>
								</div>
								{error && <div className={styles.error}>{error}</div>}
								<button className={styles.deleteButton} onClick={handleDeleteClick} disabled={isDeleting}>
									{isDeleting ? t['settings.deleting'] : t['settings.deleteAccount']}
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
			<ConfirmModal
				open={showConfirmModal}
				onClose={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmDelete}
				title={t['settings.confirmDeleteTitle']}
				message={t['settings.confirmDeleteMessage']}
				confirmLabel={t['settings.confirmDeleteButton']}
				cancelLabel={t['settings.cancelButton']}
				variant="danger"
				isLoading={isDeleting}
			/>
			{profileId && (
				<ProfileEditModal
					isOpen={profileModalOpen}
					onClose={() => setProfileModalOpen(false)}
					user={{
						id: profileId,
						name: profileName,
						email: session.user.email,
						club: profileClub,
						image: profileImage,
						skytternr: profileSkytternr,
					}}
					onProfileUpdate={handleProfileUpdate}
				/>
			)}
		</div>
	);
}
