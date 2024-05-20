import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
	return (
		<main className={styles.main}>
			<div className={styles.header}>
				<h1 className={styles.title}>Velkommen til Bueboka</h1>
				<Image className={styles.logo} src='/next.svg' alt='Next.js Logo' width={180} height={37} priority />
			</div>
		</main>
	);
}
