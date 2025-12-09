"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import styles from "./forgot.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password:", { email });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.forgotPage}>
        <Logo />
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.description}>
          We&apos;ve sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className={styles.backLink}>
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.forgotPage}>
      <Logo />

      <h1 className={styles.title}>Forgot password?</h1>
      <p className={styles.description}>
        No worries, we&apos;ll send you reset instructions.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
        />

        <Button type="submit">Reset password</Button>
      </form>

      <Link href="/login" className={styles.backLink}>
        ← Back to login
      </Link>
    </div>
  );
}
