"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Yönlendirme için
import axios from "axios"; // Fetch yerine axios daha temiz (npm install axios)
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "../_components/Logo";
import { InputField } from "../_components/InputField";
import { Button } from "../_components/Button";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend API'mize istek atıyoruz
      await axios.post("/api/register", {
        name,
        email,
        password,
      });

      router.push("/login"); // Login'e yönlendir
    } catch (error: any) {
      if (error.response?.status === 409) {
      } else {
      }
    } finally {
      setLoading(false);
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

        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
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
