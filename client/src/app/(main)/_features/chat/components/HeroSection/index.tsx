import styles from "./HeroSection.module.scss";
export const HeroSection = () => {
  return (
    <div className={styles.upperContent}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>Generate Chart with Graphe</h1>
        <p className={styles.heroSubtitle}>
          Just type one prompt to instantly create charts from your data.
        </p>
      </div>
    </div>
  );
};
