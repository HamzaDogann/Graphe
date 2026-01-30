"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./landing.module.scss";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.landing}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📊</span>
          <span className={styles.logoText}>Graphe</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">How it Works</Link>
          <Link href="#pricing">Pricing</Link>
        </div>
        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginBtn}>
            Sign In
          </Link>
          <Link href="/register" className={styles.registerBtn}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Transform Your Data Into
            <span className={styles.gradient}> Powerful Insights</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Upload your data, ask questions in natural language, and get
            beautiful visualizations instantly. No coding required.
          </p>
          <div className={styles.heroCta}>
            <button
              onClick={() => router.push("/register")}
              className={styles.primaryBtn}
            >
              Start Creating Charts
              <span className={styles.arrow}>→</span>
            </button>
            <button className={styles.secondaryBtn}>
              Watch Demo
              <span className={styles.playIcon}>▶</span>
            </button>
          </div>
          <p className={styles.heroNote}>
            ✓ Free forever for basic use &nbsp;&nbsp; ✓ No credit card required
          </p>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.chartPreview}>
            <div className={styles.mockChart}>
              <div className={styles.bar} style={{ height: "60%" }} />
              <div className={styles.bar} style={{ height: "80%" }} />
              <div className={styles.bar} style={{ height: "45%" }} />
              <div className={styles.bar} style={{ height: "90%" }} />
              <div className={styles.bar} style={{ height: "70%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose Graphe?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI-Powered Analysis</h3>
            <p>
              Simply describe what you want to see, and our AI creates the
              perfect visualization for you.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Instant Results</h3>
            <p>
              Upload your CSV, Excel, or connect to databases. Get charts in
              seconds, not hours.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3>Beautiful Charts</h3>
            <p>
              Professional-grade visualizations ready for presentations,
              reports, and dashboards.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure & Private</h3>
            <p>
              Your data stays yours. Enterprise-grade security with end-to-end
              encryption.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Upload Your Data</h3>
            <p>
              Drag and drop your CSV, Excel files, or connect to your database.
            </p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Ask Questions</h3>
            <p>
              Type what you want to see: "Show me sales by region" or "Compare
              monthly trends"
            </p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Get Insights</h3>
            <p>
              Instantly receive beautiful, interactive charts you can customize
              and export.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to Visualize Your Data?</h2>
        <p>Join thousands of teams making better decisions with Graphe.</p>
        <button
          onClick={() => router.push("/register")}
          className={styles.ctaBtn}
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span>📊</span> Graphe
          </div>
          <div className={styles.footerLinks}>
            <Link href="/login">Sign In</Link>
            <Link href="/register">Sign Up</Link>
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it Works</Link>
          </div>
          <p className={styles.copyright}>
            © 2026 Graphe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
