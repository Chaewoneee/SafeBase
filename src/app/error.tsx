'use client';

import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(220, 38, 38, 0.1)',
        color: 'var(--color-danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: '1rem'
      }}>
        ⚠️
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        예기치 않은 오류가 발생했습니다
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        서버 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나, 문제가 지속되면 관리자에게 문의하세요.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="secondary" onClick={() => window.location.href = '/'}>
          홈으로 가기
        </Button>
        <Button variant="primary" onClick={() => reset()}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
