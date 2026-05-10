'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastContext';
import styles from './page.module.css';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      const supabase = createClient();
      const { data } = await supabase.from('reports').select('*').eq('id', params.id).single();
      if (data) setReport(data);
      setLoading(false);
    }
    fetchReport();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    if (!report) return;
    const supabase = createClient();
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', report.id);
    
    if (!error) {
      setReport({ ...report, status: newStatus });
      toast({ type: 'success', title: '상태 변경 완료', message: `신고 상태가 ${newStatus}로 변경되었습니다.` });
    } else {
      toast({ type: 'error', title: '상태 변경 실패', message: error.message });
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>신고를 찾을 수 없습니다</h2>
        <Button variant="secondary" onClick={() => router.push('/reports')}>목록으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/reports" className={styles.backLink}>← 신고 목록</Link>
        <div className={styles.actions}>
          {report.status === 'RECEIVED' && (
            <Button variant="primary" size="sm" onClick={() => updateStatus('INVESTIGATING')}>조사 시작</Button>
          )}
          {report.status === 'INVESTIGATING' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => updateStatus('REJECTED')}>기각</Button>
              <Button variant="primary" size="sm" onClick={() => updateStatus('RESOLVED')}>처리 완료</Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={() => router.push('/blacklist')}>블랙리스트 검토</Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <Card title="신고 상세 정보">
            <div className={styles.infoGrid}>
              <div className={styles.infoLabel}>신고 ID</div>
              <div className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{report.id}</div>

              <div className={styles.infoLabel}>접수일시</div>
              <div className={styles.infoValue}>{new Date(report.created_at).toLocaleString('ko-KR')}</div>

              <div className={styles.infoLabel}>신고자</div>
              <div className={styles.infoValue}>{report.reporter_name}</div>

              <div className={styles.infoLabel}>관련 거래 ID</div>
              <div className={styles.infoValue}>
                {report.transaction_id ? (
                  <Link href={`/transactions/${report.transaction_id}`} style={{ color: 'var(--color-secondary-light)', fontFamily: 'monospace' }}>
                    {report.transaction_id}
                  </Link>
                ) : '없음'}
              </div>

              <div className={styles.infoLabel}>신고 내용</div>
              <div className={styles.infoValue}>{report.description}</div>
            </div>

            {report.evidence_url && (
              <div className={styles.evidenceBox}>
                <div className={styles.evidenceTitle}>첨부 증빙 자료</div>
                <a href={report.evidence_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary-light)', fontSize: '13px' }}>
                  {report.evidence_url}
                </a>
              </div>
            )}
          </Card>
        </div>

        <div className={styles.rightCol}>
          <Card title="처리 상태">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>현재 상태</span>
                <Badge variant="reportStatus" value={report.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>담당자</span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{report.assigned_to || '미지정'}</span>
              </div>

              {report.resolved_at && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>처리일시</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    {new Date(report.resolved_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />

              <div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>관리자 메모</div>
                <textarea
                  style={{ 
                    width: '100%', minHeight: '100px', fontSize: '13px', color: 'var(--color-text-primary)', 
                    background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '6px',
                    border: '1px solid var(--color-border)', resize: 'vertical'
                  }}
                  defaultValue={report.admin_note || ''}
                  placeholder="메모를 남겨주세요..."
                />
                <Button variant="secondary" size="sm" style={{ marginTop: '0.5rem', float: 'right' }}>저장</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
