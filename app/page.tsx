import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <div className={styles.header_info}>
          <h1 className={styles.title}>Bueboka</h1>
          <p className={styles.description}>Bueskyting for alle </p>
          <div className={styles.storeLinks}>
            <a
              href="https://play.google.com/store/apps/details?id=com.aaronshade.bueboka&hl=no_nb"
              aria-label="Link to Play Store"
              className={styles.button}
            >
              <Image
                className={styles.logo}
                src="/assets/playStore.png"
                alt="Phone"
                width={220}
                height={64}
                priority
              />
            </a>
            <a
              href="/"
              aria-label="Link to App Store"
              className={styles.button}
            >
              <Image
                className={styles.logo}
                src="/assets/appStore.png"
                alt="Phone"
                width={220}
                height={64}
                priority
              />
            </a>
          </div>
        </div>
        <div>
          <Image
            className={styles.logo}
            src="/assets/iOS.png"
            alt="Phone"
            width={300}
            height={600}
          />
          <Image
            className={styles.logo}
            src="/assets/Android.png"
            alt="Mobile"
            width={300}
            height={600}
          />
        </div>
      </section>
    </main>
  );
}
