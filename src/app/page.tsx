'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다. (가입이 필요할 수 있습니다)');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Background Glows */}
      <div className={`${styles.bgGlow} ${styles.bgGlow1}`} />
      <div className={`${styles.bgGlow} ${styles.bgGlow2}`} />
      <div className={`${styles.bgGlow} ${styles.bgGlow3}`} />

      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>SB</div>
          <h1 className={styles.title}>SafeBase</h1>
          <p className={styles.subtitle}>KBO 리그 AI 기반 티켓 이상 거래 탐지 시스템</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>이메일</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="admin@safebase.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <div className={styles.divider}>데모 계정</div>
          <div className={styles.demoNotice}>
            <strong>admin@safebase.kr</strong> / <strong>admin1234</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
