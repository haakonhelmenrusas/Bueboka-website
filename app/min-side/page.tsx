'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
	ArrowsModal,
	BowModal,
	Button,
	PracticeCreateModal,
	PracticeDetailsModal,
	PracticesList,
	ProfileEditModal
} from '@/components';
import { BowArrow, Edit, LogOut, Menu, Navigation, Plus } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import * as Sentry from '@sentry/nextjs';
import { PracticeCreateInput } from '@/components/Practices/PracticeCreateModal';
import { Environment, WeatherCondition } from '@prisma/client';
import { MyPageSkeleton } from './Skeleton';

interface User {
	id: string;
	email: string;
	name: string | null;
	club: string | null;
	image: string | null;
	bows: Bow[];
	arrows: Arrow[];
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

interface Arrow {
	id: string;
	name: string;
	material: string;
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
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [createPracticeOpen, setCreatePracticeOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [bowModalOpen, setBowModalOpen] = useState(false);
	const [arrowsModalOpen, setArrowsModalOpen] = useState(false);
	const [selectedBow, setSelectedBow] = useState<Bow | null>(null);
	const [selectedArrows, setSelectedArrows] = useState<Arrow | null>(null);
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

			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}

				let errMsg: string = 'Kunne ikke lagre trening';
				const fieldErrors = details && typeof details === 'object' ? (details as any).fieldErrors : undefined;
				if (res.status === 400 && fieldErrors && typeof fieldErrors === 'object') {
					const msgs = Object.entries(fieldErrors)
						.map(([field, msg]) => `${field}: ${msg}`)
						.join('\n');
					errMsg = `Manglende/ugyldige felt:\n${msgs}`;
				} else if (details && typeof details === 'object' && (details as any).error) {
					errMsg = (details as any).error;
				}

				return Promise.reject(new Error(errMsg));
			}

			await fetchUser();
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'create-practice' } });
			throw err;
		}
	};

	if (loading) {
		return <MyPageSkeleton />;
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
								<button
									className={styles.editButton}
									onClick={() => setProfileModalOpen(true)}
									aria-label="Edit profile"
									title="Edit profile"
								>
									<Edit size={18} />
									Rediger
								</button>
							</div>
						</section>

						<section className={styles.right}>
							<div className={styles.topRightRow}>
								<div className={styles.rightActions}>
									<Button
										label="Ny bue"
										onClick={() => {
											setSelectedBow(null);
											setBowModalOpen(true);
										}}
										icon={<BowArrow size={18} />}
										width={170}
										size="small"
									/>
									<Button
										label="Nye piler"
										onClick={() => setArrowsModalOpen(true)}
										icon={<Navigation size={18} />}
										width={170}
										size="small"
									/>
								</div>
							</div>

							<div className={styles.rightContent}>
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
														setBowModalOpen(true);
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
											<div className={styles.placeholderCard}>Ingen buer funnet</div>
										)}
									</div>
								</div>

								<div>
									<div className={styles.sectionTitle}>Piler</div>
									<div className={styles.list}>
										{user.arrows && user.arrows.length > 0 ? (
											user.arrows.map((a) => (
												<div
													key={a.id}
													className={styles.item}
													onClick={() => {
														setSelectedArrows(a);
														setArrowsModalOpen(true);
													}}
												>
													<div className={styles.itemLeft}>
														<div>{a.name}</div>
														<div className={styles.itemMeta}>{a.material}</div>
													</div>
													<div className={styles.itemIcon}>
														<Navigation size={18} />
													</div>
												</div>
											))
										) : (
											<div className={styles.placeholderCard}>Legg til dine første piler</div>
										)}
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>

			{/* Practices moved to dedicated section below main card */}
			<section className={styles.practicesSection}>
				<div className={styles.practicesHeader}>
					<h2 className={styles.practicesTitle}>Treninger</h2>
					<Button
						label="Ny trening"
						onClick={() => setCreatePracticeOpen(true)}
						icon={<Plus size={18} />}
						width={240}
						buttonStyle={{ marginLeft: 'auto' }}
					/>
				</div>
				<div className={styles.practicesList}>
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
			</section>

			<ProfileEditModal
				isOpen={profileModalOpen}
				onClose={() => setProfileModalOpen(false)}
				user={{
					id: user.id,
					name: user.name,
					email: user.email,
					club: user.club,
				}}
				onProfileUpdate={fetchUser}
			/>

			<BowModal
				open={bowModalOpen}
				onClose={() => {
					setBowModalOpen(false);
					setSelectedBow(null);
				}}
				editingBow={
					selectedBow
						? {
								id: selectedBow.id,
								name: selectedBow.name,
								type: selectedBow.type as any,
								eyeToNock: selectedBow.eyeToNock,
								aimMeasure: selectedBow.aimMeasure,
								eyeToSight: selectedBow.eyeToSight,
								isFavorite: selectedBow.isFavorite,
								notes: selectedBow.notes,
							}
						: undefined
				}
				onSaved={fetchUser}
			/>

			<ArrowsModal
				open={arrowsModalOpen}
				onClose={() => {
					setArrowsModalOpen(false);
					setSelectedArrows(null);
				}}
				editingArrows={
					selectedArrows
						? {
								id: selectedArrows.id,
								name: selectedArrows.name,
								material: selectedArrows.material as any,
							}
						: undefined
				}
				onSaved={() => {
					setArrowsModalOpen(false);
					setSelectedArrows(null);
					fetchUser();
				}}
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
				arrows={user.arrows}
			/>
		</div>
	);
}
