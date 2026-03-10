import styles from './Sponsor.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { LuArrowRight } from 'react-icons/lu';

export function Sponsors() {
	return (
		<section id="support" className={styles.section}>
			<div className={styles.container}>
				<div className={`${styles.textCenter} ${styles.mb16}`}>
					<h2 className={styles.title}>Støtt prosjektet</h2>
					<p className={styles.subtitle}>
						Bueboka utvikles og driftes av frivillige på dugnad. Alle bidrag går direkte til drift av servere og videreutvikling.
					</p>
				</div>
				<div className={styles.supportGrid}>
					<div className={`${styles.card} ${styles.vippsCard}`}>
						<h3 className={styles.cardTitle}>Vipps et valgfritt beløp</h3>
						<p className={styles.cardDesc}>Skann QR-koden med Vipps-appen eller søk opp vårt nummer.</p>
						<div className={styles.vippsContent}>
							<div className={styles.qrPlaceholder}>
								<Image src="/assets/vipps-qr.png" alt="Vipps QR Kode" width={150} height={150} className={styles.qrImage} />
							</div>
							<div className={styles.vippsNumberBox}>
								<span className={styles.vippsLabel}>Vipps-nummer</span>
								<span className={styles.vippsNumber}>44294</span>
							</div>
						</div>
					</div>
					<div className={`${styles.card} ${styles.sponsorLinkCard}`}>
						<h3 className={styles.cardTitle}>For bedrifter</h3>
						<p className={styles.cardDesc}>Ønsker din bedrift å profilere seg for bueskyttere? Bli en offisiell samarbeidspartner.</p>
						<Link href="/sponsing" className={styles.primaryButton}>
							<span>Bli sponsor</span>
							<LuArrowRight size={20} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
