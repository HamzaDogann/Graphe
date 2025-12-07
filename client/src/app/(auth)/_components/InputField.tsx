import { InputHTMLAttributes, ReactNode } from "react";
import styles from "./InputField.module.scss";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabel?: ReactNode;
  rightIcon?: ReactNode;
}

export function InputField({
  label,
  rightLabel,
  rightIcon,
  ...props
}: InputFieldProps) {
  return (
    <div className={styles.inputField}>
      <div className={styles.labelRow}>
        <label className={styles.label}>{label}</label>
        {rightLabel && <span className={styles.rightLabel}>{rightLabel}</span>}
      </div>
      <div className={styles.inputWrapper}>
        <input className={styles.input} {...props} />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
    </div>
  );
}
