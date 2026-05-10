'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
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
        fontSize: '6rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1
      }}>
        404
      </div>
      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
        페이지를 찾을 수 없습니다
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        요청하신 페이지가 삭제되었거나, 잘못된 주소입니다. 입력하신 주소가 정확한지 다시 한번 확인해 주세요.
      </p>
      <Link href="/dashboard">
        <Button variant="primary">대시보드로 돌아가기</Button>
      </Link>
    </div>
  );
}
