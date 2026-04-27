"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import s from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/admin/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace("/admin");
      } else {
        const data = await res.json();
        setError(data.error ?? "인증에 실패했어요");
      }
    } catch {
      setError("서버 연결에 실패했어요");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.container}>
      <form onSubmit={handleSubmit} className={s.card}>
        <h1 className={s.title}>이랑 관리자</h1>
        <p className={s.subtitle}>비밀번호를 입력해 주세요</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className={s.input}
          autoFocus
          required
        />

        {error && <p className={s.error}>{error}</p>}

        <button type="submit" className={s.button} disabled={loading}>
          {loading ? "확인 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
}
