'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import { ProfileEditModal } from '@/components';
import { Edit } from 'lucide-react';

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
}

interface Practice {
	id: string;
	date: Date;
	totalScore: number;
}

export default function MyPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchUser();
	}, []);

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
			console.error(err);
		} finally {
			setLoading(false);
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
											<div key={bow.id} className={styles.item}>
												<div className={styles.itemLeft}>
													<div>{bow.name}</div>
													<div className={styles.itemMeta}>{bow.type}</div>
												</div>
												<div>→</div>
											</div>
										))
									) : (
										<div className={styles.empty}>Ingen buer funnet</div>
									)}
								</div>
							</div>

							<div>
								<div className={styles.sectionTitle}>Treninger</div>
								<div className={styles.list}>
									{user.practices && user.practices.length > 0 ? (
										user.practices.map((p) => (
											<div key={p.id} className={styles.item}>
												<div className={styles.itemLeft}>
													<div>{new Date(p.date).toLocaleDateString()}</div>
													<div className={styles.itemMeta}>{p.totalScore} poeng</div>
												</div>
												<div>→</div>
											</div>
										))
									) : (
										<div className={styles.empty}>Ingen treninger funnet</div>
									)}
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>

			<ProfileEditModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				user={{
					id: user.id,
					name: user.name,
					email: user.email,
					club: user.club,
				}}
				onProfileUpdate={fetchUser}
			/>
		</div>
	);
}
