'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 임시 접수 처리 딜레이
    setTimeout(() => {
      router.push('/reports');
      router.refresh();
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>수동 신고 접수</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          사용자 제보나 외부 채널을 통해 확인된 이상 거래 내역을 수동으로 등록합니다.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>관련 거래 ID (선택)</label>
            <input 
              type="text" 
              placeholder="예: tx-0123" 
              style={{
                padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
                borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>제보자 / 신고 채널 *</label>
            <input 
              type="text" 
              placeholder="예: 트위터 제보, 고객센터 접수" 
              required
              style={{
                padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
                borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>신고 내용 *</label>
            <textarea 
              rows={4}
              placeholder="적발된 판매 게시물 내용, 가격 정보 등 상세 내용을 입력하세요." 
              required
              style={{
                padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
                borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem', resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>증빙 자료 URL (선택)</label>
            <input 
              type="url" 
              placeholder="https://" 
              style={{
                padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
                borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="ghost" type="button" onClick={() => router.push('/reports')}>취소</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? '등록 중...' : '신고 등록'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
