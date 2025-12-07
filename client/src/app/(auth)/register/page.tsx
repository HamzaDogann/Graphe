"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement register logic
    console.log("Register:", { fullName, email, password });
  };

  return (
    <div className={styles.registerPage}>
      <Logo />

      <h1 className={styles.title}>Create your account</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder=""
        />

        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
        />

        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=""
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

        <Button type="submit">Create Account</Button>
      </form>

      <p className={styles.footerText}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </div>
  );
}
