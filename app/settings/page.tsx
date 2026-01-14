'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion, ConfirmModal, Header } from '@/components';
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

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Ofte stilte spørsmål (FAQ)</h2>
						<Accordion
							items={[
								{
									id: 'bows',
									title: 'Hva er forskjellen på buetypene?',
									icon: (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M12 2v20" stroke="currentColor" strokeWidth="2" />
											<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
										</svg>
									),
									content: (
										<div>
											<p>Det finnes flere typer buer, hver med sine styrker:</p>
											<ul>
												<li>
													<strong>Recurve</strong>: Klassisk OL-bue med lemmer som bøyer seg forover. Presis og allsidig.
												</li>
												<li>
													<strong>Compound</strong>: Moderne bue med trinser for jevn trekkvekt og høy presisjon.
												</li>
												<li>
													<strong>Barebow</strong>: Enkel bue uten sikte, populær i tradisjonell skyting.
												</li>
												<li>
													<strong>Langbue</strong>: Historisk bue med lang profil, skytes uten moderne hjelpemidler.
												</li>
											</ul>
										</div>
									),
								},
								{
									id: 'features',
									title: 'Hva kan jeg gjøre på Bueboka?',
									icon: (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" />
											<path d="M8 8h8v8H8z" stroke="currentColor" strokeWidth="2" />
										</svg>
									),
									content: (
										<div>
											<p>
												På Bueboka kan du registrere treningsøkter, lagre og administrere utstyr (buer og piler), se statistikk, og
												sammenligne fremgangen din over tid.
											</p>
											<ul>
												<li>Registrer og rediger treningsøkter</li>
												<li>Hold oversikt over buer og pilsett</li>
												<li>Se oppsummeringer og statistikk</li>
												<li>Bruk vær og miljø for å få bedre innsikt</li>
											</ul>
										</div>
									),
								},
								{
									id: 'apps',
									title: 'Har dere både nettside og mobilapp?',
									icon: (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M7 2h10v20H7z" stroke="currentColor" strokeWidth="2" />
											<circle cx="12" cy="18" r="1" fill="currentColor" />
										</svg>
									),
									content: (
										<div>
											<p>
												Ja! Du kan bruke både nettsiden og mobilappen vår — med samme innlogging. Dataen din synkroniseres automatisk, slik
												at du alltid har alt tilgjengelig uansett plattform.
											</p>
											<p>Tips: Aktiver mørk modus for en behagelig opplevelse på kveldstid. Du kan bytte tema i menyen oppe til høyre.</p>
										</div>
									),
								},
								{
									id: 'resources',
									title: 'Nyttige ressurser',
									icon: (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M3 4h18v2H3z" fill="currentColor" />
											<path d="M6 8h12v12H6z" stroke="currentColor" strokeWidth="2" />
										</svg>
									),
									content: (
										<div>
											<ul>
												<li>
													<a href="https://www.bueskyting.no" target="_blank" rel="noopener noreferrer">
														Norges Bueskytterforbund
													</a>
												</li>
												<li>
													<a href="https://www.ianseo.net" target="_blank" rel="noopener noreferrer">
														IANSEO (resultater og stevner)
													</a>
												</li>
												<li>
													<a href="https://www.arcticbuesport.no" target="_blank" rel="noopener noreferrer">
														Arctic Bueskytter (butikk)
													</a>
												</li>
											</ul>
										</div>
									),
								},
							]}
						/>
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
