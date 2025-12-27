"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // ArrowLeft eklendi
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import styles from "./reset.module.scss";
import { useLoaderStore } from "@/store/useLoaderStore";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const loader = useLoaderStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Missing token");
      return;
    }

    loader.show();

    try {
      await axios.post("/api/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 4000);
    } catch (err: any) {
      setError("Invalid or expired token");
    } finally {
      loader.hide();
    }
  };

  if (success) {
    return (
      <div className={styles.resetPage}>
        <Logo />
        <h1 className={styles.title}>Password Reset Successful!</h1>
        <p className={styles.description}>
          You can now log in with your new password. <br />
          Redirecting to login...
        </p>
        {/* Başarı ekranındaki ana buton (Mavi) */}
        <Link href="/login" className={styles.successButton}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.resetPage}>
      <Logo />
      <h1 className={styles.title}>Set new password</h1>
      <p className={styles.description}>
        Your new password must be different to previously used passwords.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="New Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightIcon={
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          }
        />

        <InputField
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <div className={styles.errorMessage}>{error}</div>}

        <Button type="submit">Reset Password</Button>
      </form>

      {/* Form altındaki geri dön butonu (Gri & Sol) */}
      <Link href="/login" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to login
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
