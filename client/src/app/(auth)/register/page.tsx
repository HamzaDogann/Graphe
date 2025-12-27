"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import styles from "./register.module.scss";
import { useLoaderStore } from "@/store/useLoaderStore";

export default function RegisterPage() {
  const router = useRouter();
  const loader = useLoaderStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loader.show();

    try {
      await axios.post("/api/register", {
        name,
        email,
        password,
      });

      router.push("/login");

      loader.hide();
    } catch (err: any) {
      loader.hide();

      if (err.response?.status === 409) {
        setError("This email is already in use.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className={styles.registerPage}>
      <Logo />
      <h1 className={styles.title}>Create your account</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        {/* Hata Mesajı Alanı */}
        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.875rem",
              marginTop: "-8px",
              marginBottom: "8px",
            }}
          >
            {error}
          </div>
        )}

        {/* Button artık local loading beklemiyor, global loader çalışırken disable olabilir */}
        <Button type="submit" disabled={loader.isLoading}>
          Create Account
        </Button>
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
