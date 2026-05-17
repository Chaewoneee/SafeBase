'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBypassLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      // 심사용 자동 접속 (데모 계정으로 강제 로그인)
      let { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@safebase.kr',
        password: 'admin1234',
      });

      // 만약 계정이 없다면 자동 가입 시도
      if (authError && authError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'admin@safebase.kr',
          password: 'admin1234',
        });
        
        if (!signUpError) {
          // 가입 성공 시 다시 로그인 시도
          const retry = await supabase.auth.signInWithPassword({
            email: 'admin@safebase.kr',
            password: 'admin1234',
          });
          authError = retry.error;
        }
      }

      if (authError) {
        console.error("Auth Error:", authError);
        setError(`자동 로그인 실패: ${authError.message}`);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error("Login Exception:", err);
      setError(`접속 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
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

        <div className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--color-primary-light)', fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>
              심사용 임시 접속 페이지
            </strong>
            현재 심사 편의를 위해 로그인 기능이 해제되어 있습니다.<br />
            아래 버튼을 클릭하시면 데모 계정으로 자동 접속됩니다.
          </div>

          <button
            onClick={handleBypassLogin}
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '입장 중...' : '대시보드 입장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
