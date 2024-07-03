import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <div className={styles.header_info}>
          <Image
            className={styles.logo}
            src="/assets/logo.png"
            alt="Logo"
            width={200}
            height={200}
            priority
          />
          <h1 className={styles.title}>Bueboka</h1>
          <p className={styles.description}>Bueskyting for alle </p>
          <div className={styles.storeLinks}>
            <a
              href="https://play.google.com/store/apps/details?id=com.aaronshade.bueboka&hl=no_nb"
              aria-label="Link to Google Play Store"
              className={styles.button}
            >
              <Image
                className={styles.storeLogo}
                src="/assets/playStore.png"
                alt="Phone"
                width={220}
                height={64}
                priority
              />
            </a>
            <a
              href="/"
              aria-label="Link to Apple App Store"
              className={styles.button}
            >
              <Image
                className={styles.storeLogo}
                src="/assets/appStore.png"
                alt="Phone"
                width={220}
                height={64}
                priority
              />
            </a>
          </div>
        </div>
        <div className={styles.phones}>
          <Image src="/assets/iOS.png" alt="Phone" width={300} height={600} />
          <Image
            src="/assets/Android.png"
            alt="Mobile"
            width={300}
            height={600}
          />
        </div>
      </section>
      <footer className={styles.footer}>
        <p>Rusås Design</p>
        <div className={styles.socialLinks}>
          <a
            href="https://www.facebook.com/profile.php?id=61560373960234"
            target="_blank"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://www.instagram.com/bueboka/"
            target="_blank"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </footer>
    </main>
  );
}
