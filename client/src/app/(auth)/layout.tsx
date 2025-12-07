"use client";

import { AuthRightPanel } from "./_components/AuthRightPanel";
import styles from "./auth.module.scss";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>{children}</div>
      </div>
      <div className={styles.rightPanel}>
        <AuthRightPanel />
      </div>
    </div>
  );
}
