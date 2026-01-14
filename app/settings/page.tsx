'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal, Header } from '@/components';
import { useSession } from '@/lib/auth-client';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function SettingsPage() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	useEffect(() => {
		if (!isPending && !session?.user) {
			router.push('/logg-inn');
		}
	}, [session, isPending, router]);

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
				throw new Error(data.error || 'Kunne ikke slette konto');
			}

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
			<main className={styles.main}>
				<div className={styles.container}>
					<div className={styles.header}>
						<button className={styles.backButton} onClick={handleBackClick} aria-label="Tilbake">
							<ArrowLeft size={20} />
						</button>
						<h1 className={styles.title}>Innstillinger</h1>
					</div>

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Konto</h2>
						<div className={styles.card}>
							<div className={styles.cardContent}>
								<div className={styles.userInfo}>
									<p className={styles.label}>E-post</p>
									<p className={styles.value}>{session.user.email}</p>
								</div>
								{session.user.name && (
									<div className={styles.userInfo}>
										<p className={styles.label}>Navn</p>
										<p className={styles.value}>{session.user.name}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className={styles.dangerZone}>
						<h2 className={styles.dangerTitle}>Farlig sone</h2>
						<div className={styles.dangerCard}>
							<div className={styles.dangerContent}>
								<div className={styles.dangerInfo}>
									<h3 className={styles.dangerHeading}>Slett konto</h3>
									<p className={styles.dangerDescription}>
										Når du sletter kontoen din, vil alle dine data bli permanent fjernet. Dette inkluderer treningsøkter, utstyr og
										profilinformasjon. Denne handlingen kan ikke angres.
									</p>
								</div>
								{error && <div className={styles.error}>{error}</div>}
								<button className={styles.deleteButton} onClick={handleDeleteClick} disabled={isDeleting}>
									{isDeleting ? 'Sletter konto...' : 'Slett konto'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>

			<ConfirmModal
				open={showConfirmModal}
				onClose={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmDelete}
				title="Bekreft sletting av konto"
				message="Er du sikker på at du vil slette kontoen din? Alle dine data vil bli permanent fjernet, inkludert treningsøkter, utstyr og profilinformasjon. Denne handlingen kan ikke angres."
				confirmLabel="Ja, slett konto"
				cancelLabel="Avbryt"
				variant="danger"
				isLoading={isDeleting}
			/>
		</div>
	);
}
