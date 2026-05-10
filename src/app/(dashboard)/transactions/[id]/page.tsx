'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastContext';
import type { Transaction } from '@/types';
import styles from './page.module.css';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<Transaction | null>(null);
  const [relatedTxs, setRelatedTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTx() {
      const supabase = createClient();
      const { data } = await supabase.from('transactions').select('*').eq('id', params.id).single();
      
      if (data) {
        setTx(data as Transaction);
        
        // Fetch related transactions by the same account
        const { data: related } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', data.account_id)
          .neq('id', data.id)
          .order('created_at', { ascending: false });
        
        if (related) setRelatedTxs(related as Transaction[]);
      }
      setLoading(false);
    }
    fetchTx();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    if (!tx) return;
    const supabase = createClient();
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', tx.id);
    
    if (!error) {
      setTx({ ...tx, status: newStatus as any });
      toast({ type: 'success', title: '상태 변경 완료', message: `거래 상태가 ${newStatus}로 변경되었습니다.` });
    } else {
      toast({ type: 'error', title: '상태 변경 실패', message: error.message });
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  if (!tx) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>해당 거래를 찾을 수 없습니다.</h2>
        <Button variant="secondary" onClick={() => router.push('/transactions')} style={{ marginTop: '1rem' }}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/transactions" className={styles.backLink}>← 거래 목록</Link>
        <div className={styles.actions}>
          {tx.status === 'PENDING' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => updateStatus('DISMISSED')}>정상 처리 (기각)</Button>
              <Button variant="primary" size="sm" onClick={() => updateStatus('REVIEWED')}>검토 완료</Button>
            </>
          )}
          {tx.status === 'REVIEWED' && (
            <Button variant="primary" size="sm" onClick={() => updateStatus('REPORTED')}>이상 거래 신고</Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => router.push('/blacklist')}>블랙리스트 추가</Button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          <Card title="기본 정보" action={<Badge variant="status" value={tx.status} />}>
            <div className={styles.infoGrid}>
              <div className={styles.infoLabel}>거래 ID</div>
              <div className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{tx.id}</div>
              
              <div className={styles.infoLabel}>거래 일시</div>
              <div className={styles.infoValue}>{new Date(tx.created_at).toLocaleString('ko-KR')}</div>
              
              <div className={styles.infoLabel}>구단 / 경기</div>
              <div className={styles.infoValue}>{tx.team} ({tx.game_id})</div>
              
              <div className={styles.infoLabel}>좌석 정보</div>
              <div className={styles.infoValue}>{tx.seat_info}</div>
              
              <div className={styles.infoLabel}>정가</div>
              <div className={styles.infoValue}>{tx.original_price.toLocaleString()}원</div>
              
              <div className={styles.infoLabel}>재판매가</div>
              <div className={styles.infoValue}>
                {tx.resale_price ? (
                  <span style={{ color: 'var(--color-danger)' }}>
                    {tx.resale_price.toLocaleString()}원 
                    ({Math.round((tx.resale_price / tx.original_price) * 100)}%)
                  </span>
                ) : '없음'}
              </div>

              <div className={styles.infoLabel}>출처 플랫폼</div>
              <div className={styles.infoValue}>
                {tx.source_platform}
                {tx.listing_url && (
                  <a href={tx.listing_url} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: 'var(--color-secondary-light)', fontSize: '13px', textDecoration: 'underline' }}>
                    🔗 판매 글 보기
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card title="계정 거래 히스토리" subtitle={`동일 계정(${tx.account_id})의 다른 거래 내역`}>
            {relatedTxs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {relatedTxs.map(rtx => (
                  <Link key={rtx.id} href={`/transactions/${rtx.id}`} className={styles.historyItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {new Date(rtx.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <Badge variant="risk" value={rtx.risk_level} showDot={false} />
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {rtx.team} · {rtx.seat_info}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>이전 거래 내역이 없습니다.</div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          <Card title="위험도 분석" className={styles.analysisCard}>
            <div className={styles.scoreCircleWrapper}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreLabel}>Risk Score</span>
                <span className={styles.scoreValue} style={{ color: `var(--color-${tx.risk_level.toLowerCase()})` }}>
                  {tx.risk_score}
                </span>
                <Badge variant="risk" value={tx.risk_level} />
              </div>
            </div>

            <div className={styles.rulesList}>
              <h4 className={styles.rulesTitle}>탐지된 이상 패턴</h4>
              {tx.flagged_rules.length > 0 ? (
                tx.flagged_rules.map((rule, idx) => (
                  <div key={idx} className={styles.ruleItem}>
                    <span className={styles.ruleIcon}>⚠️</span>
                    <span className={styles.ruleText}>{rule}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>탐지된 이상 패턴이 없습니다.</div>
              )}
            </div>
          </Card>

          <Card title="관리자 메모">
            <textarea
              className={styles.memoArea}
              placeholder="조사 내용이나 특이사항을 기록하세요..."
              defaultValue={tx.admin_note || ''}
              readOnly
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="secondary" size="sm">메모 저장</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
