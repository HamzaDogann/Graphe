"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import { GoogleButton } from "../_components/GoogleButton";
import { Divider } from "../_components/Divider";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // NextAuth SignIn (Credentials)
    const callback = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (callback?.error) {
      setLoading(false);
    }

    if (callback?.ok && !callback?.error) {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className={styles.loginPage}>
      <Logo />
      <h1 className={styles.title}>Log in to your account</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightLabel={
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot?
            </Link>
          }
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

        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Log in"}
        </Button>
      </form>

      <Divider />

      <GoogleButton onClick={handleGoogleLogin} />

      <p className={styles.footerText}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={styles.link}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
