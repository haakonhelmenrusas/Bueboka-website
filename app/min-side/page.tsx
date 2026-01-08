'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { PracticeCreateModal, PracticeDetailsModal, PracticesList, ProfileEditModal } from '@/components';
import { BowArrow, Edit, LogOut, Menu } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import * as Sentry from '@sentry/nextjs';
import { PracticeCreateInput } from '@/components/Practices/PracticeCreateModal';
import { Environment, WeatherCondition } from '@prisma/client';

interface User {
	id: string;
	email: string;
	name: string | null;
	club: string | null;
	image: string | null;
	bows: Bow[];
	practices: Practice[];
}

interface Bow {
	id: string;
	name: string;
	type: string;
	eyeToNock: number | null;
	aimMeasure: number | null;
	eyeToSight: number | null;
	isFavorite: boolean;
	notes: string | null;
}

interface Practice {
	id: string;
	date: string;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	roundType?: {
		name: string;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
	};
	bow?: {
		name: string;
		type: string;
	};
	arrows?: {
		name: string;
		material: string;
	};
	ends?: Array<{
		id: string;
		arrows: number;
		scores: number[];
		arrowsPerEnd?: number | null;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
	}>;
}

export default function MyPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedBow, setSelectedBow] = useState<Bow | null>(null);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [createPracticeOpen, setCreatePracticeOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const router = useRouter();

	const toggleProfileMenu = () => setProfileMenuOpen((v) => !v);
	const closeProfileMenu = () => setProfileMenuOpen(false);

	const handleLogout = async () => {
		try {
			await signOut();
			closeProfileMenu();
			router.push('/');
		} catch (err) {
			Sentry.captureException(err, {
				tags: { page: 'min-side', action: 'logout' },
				extra: { message: 'Logout failed' },
			});
			console.error('Logout failed', err);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	// Close profile menu on Escape and handle click outside
	useEffect(() => {
		if (!profileMenuOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeProfileMenu();
			}

			if (e.key === 'Tab') {
				// focus trap
				const el = menuRef.current;
				if (!el) return;
				const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		const onClickOutside = (ev: MouseEvent) => {
			const el = menuRef.current;
			if (!el) return;
			if (ev.target instanceof Node && !el.contains(ev.target)) {
				closeProfileMenu();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('mousedown', onClickOutside);

		// focus first focusable inside menu after open
		setTimeout(() => {
			const el = menuRef.current;
			if (!el) return;
			const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (focusable.length) focusable[0].focus();
		}, 0);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('mousedown', onClickOutside);
		};
	}, [profileMenuOpen]);

	const fetchUser = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/users');
			if (!response.ok) {
				if (response.status === 401) {
					setError('Du må være logget inn');
				} else {
					setError('Kunne ikke hente brukerdata');
				}
				return;
			}
			const data = await response.json();
			if (data.users && data.users.length > 0) {
				setUser(data.users[0]);
			}
		} catch (err) {
			setError('En feil oppstod');
			Sentry.captureException(err, {
				tags: { page: 'min-side', action: 'fetchUser' },
				extra: { message: 'Error fetching user data' },
			});
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePractice = async (input: PracticeCreateInput) => {
		try {
			const res = await fetch('/api/practices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});
			if (!res.ok) throw new Error('Kunne ikke lagre trening');
			await fetchUser();
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'create-practice' } });
			throw err;
		}
	};

	if (loading) {
		return (
			<div className={styles.page}>
				<div className={styles.headerBar}>
					<div className={styles.logoBox}>
						<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
					</div>
					<div className={styles.brand}>Bueboka</div>
				</div>
				<main className={styles.main}>
					<div className={styles.card}>
						<div className={styles.empty}>Laster inn...</div>
					</div>
				</main>
			</div>
		);
	}

	if (error || !user) {
		return (
			<div className={styles.page}>
				<div className={styles.headerBar}>
					<div className={styles.logoBox}>
						<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
					</div>
					<div className={styles.brand}>Bueboka</div>
				</div>
				<main className={styles.main}>
					<div className={styles.card}>
						<div className={styles.empty}>{error || 'Du må være logget inn for å se denne siden.'}</div>
					</div>
				</main>
			</div>
		);
	}

	const practiceCards = (user.practices || []).map((p) => {
		const arrowsShot = p.ends?.reduce((sum, end) => sum + (end.arrows ?? end.scores?.length ?? 0), 0) ?? 0;
		return {
			id: p.id,
			date: p.date,
			arrowsShot,
		};
	});

	const handleSelectPractice = (id: string) => {
		const found = user.practices.find((p) => p.id === id);
		if (found) {
			setSelectedPractice(found);
			setPracticeModalOpen(true);
		}
	};

	return (
		<div className={styles.page}>
			<header className={styles.headerBar}>
				<div className={styles.logoBox}>
					<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
				</div>
				<div className={styles.brand}>Bueboka</div>

				{/* Profile menu */}
				<div style={{ marginLeft: 'auto', position: 'relative' }} ref={menuRef}>
					<button onClick={toggleProfileMenu} className={styles.menuButton} aria-label="Profile menu">
						<Menu size={24} />
					</button>

					{profileMenuOpen && (
						<div
							style={{
								position: 'absolute',
								top: 'calc(100% + 8px)',
								right: 0,
								background: 'white',
								color: '#053546',
								borderRadius: '10px',
								boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
								minWidth: '160px',
								overflow: 'hidden',
								zIndex: 60,
								padding: '6px',
								animation: 'dropdown-in 160ms cubic-bezier(.2,.9,.2,1) both',
							}}
						>
							<button
								onClick={handleLogout}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									padding: '10px 12px',
									background: 'transparent',
									border: 'none',
									width: '100%',
									textAlign: 'left',
									cursor: 'pointer',
									color: 'inherit',
									fontWeight: 600,
									borderRadius: '4px',
								}}
								onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(5,53,70,0.06)')}
								onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
							>
								<LogOut size={18} />
								Logg ut
							</button>
						</div>
					)}
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.card}>
					<div className={styles.twoColumn}>
						<section className={styles.left}>
							<div className={styles.profileCard}>
								{user.image ? (
									<Image
										loading="eager"
										src={user.image}
										alt={user.name || 'User avatar'}
										width={128}
										height={128}
										className={styles.avatarLarge}
									/>
								) : (
									<div className={styles.avatarLarge} />
								)}
								<div className={styles.profileName}>{user.name || user.email}</div>
								<div className={styles.profileMeta}>{user.club || 'Ingen klubb oppgitt'}</div>
								<button className={styles.editButton} onClick={() => setIsModalOpen(true)} aria-label="Edit profile" title="Edit profile">
									<Edit size={18} />
									Rediger
								</button>
							</div>
						</section>

						<section className={styles.right}>
							<div>
								<div className={styles.sectionTitle}>Buer</div>
								<div className={styles.list}>
									{user.bows && user.bows.length > 0 ? (
										user.bows.map((bow) => (
											<div
												key={bow.id}
												className={styles.item}
												onClick={() => {
													setSelectedBow(bow);
													setIsModalOpen(true);
												}}
											>
												<div className={styles.itemLeft}>
													<div>{bow.name}</div>
													<div className={styles.itemMeta}>{bow.type}</div>
												</div>
												<div className={styles.itemIcon}>
													<BowArrow size={18} />
												</div>
											</div>
										))
									) : (
										<div className={styles.empty}>Ingen buer funnet</div>
									)}
								</div>
							</div>

							<div>
								<div className={styles.sectionTitleRow}>
									<div className={styles.sectionTitle}>Treninger</div>
									<button className={styles.smallButton} onClick={() => setCreatePracticeOpen(true)}>
										Ny trening
									</button>
								</div>
								<div className={styles.list}>
									{loading ? (
										<div className={styles.list}>
											{Array.from({ length: 3 }).map((_, i) => (
												<div key={i} className={styles.skeletonItem} />
											))}
										</div>
									) : (
										<PracticesList practices={practiceCards} onSelectPractice={handleSelectPractice} />
									)}
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>

			<ProfileEditModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedBow(null);
				}}
				user={{
					id: user.id,
					name: user.name,
					email: user.email,
					club: user.club,
				}}
				editingBow={
					selectedBow
						? {
								id: selectedBow.id,
								name: selectedBow.name,
								type: selectedBow.type as 'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER',
								eyeToNock: selectedBow.eyeToNock,
								aimMeasure: selectedBow.aimMeasure,
								eyeToSight: selectedBow.eyeToSight,
								isFavorite: selectedBow.isFavorite,
								notes: selectedBow.notes,
							}
						: undefined
				}
				onProfileUpdate={fetchUser}
			/>

			<PracticeDetailsModal
				open={practiceModalOpen}
				practice={selectedPractice || undefined}
				onClose={() => {
					setPracticeModalOpen(false);
					setSelectedPractice(null);
				}}
			/>

			<PracticeCreateModal
				open={createPracticeOpen}
				onClose={() => setCreatePracticeOpen(false)}
				onCreate={handleCreatePractice}
				bows={user.bows}
				roundTypes={[]}
				arrows={[]}
			/>
		</div>
	);
}
