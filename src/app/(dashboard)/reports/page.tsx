'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

const PER_PAGE = 20;

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchReports() {
      const supabase = createClient();
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, []);

  useEffect(() => {
    let result = [...reports];
    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [reports, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  if (loading) {
    return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.pageTitle}>신고 관리</h1>
          <p className={styles.pageSubtitle}>사용자가 접수한 이상 거래 신고를 확인하고 처리합니다.</p>
        </div>
        <span className={styles.resultCount}>{filtered.length}건</span>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">전체 상태</option>
          <option value="RECEIVED">접수됨</option>
          <option value="INVESTIGATING">조사중</option>
          <option value="RESOLVED">처리완료</option>
          <option value="REJECTED">기각됨</option>
        </select>
      </div>

      <Card noPadding>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>접수일시</th>
                <th>신고자</th>
                <th>신고 내용 요약</th>
                <th>관련 거래 ID</th>
                <th>상태</th>
                <th>담당자</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(report => (
                <tr 
                  key={report.id}
                  className={styles.clickableRow}
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <td>{new Date(report.created_at).toLocaleDateString('ko-KR')}</td>
                  <td>{report.reporter_name}</td>
                  <td>
                    <span className={styles.description}>{report.description}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {report.transaction_id ? (
                      <Link href={`/transactions/${report.transaction_id}`} style={{ color: 'var(--color-secondary-light)' }}>
                        {report.transaction_id.substring(0, 8)}...
                      </Link>
                    ) : '-'}
                  </td>
                  <td><Badge variant="reportStatus" value={report.status} showDot={false} /></td>
                  <td>{report.assigned_to || '-'}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                    조회된 신고 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className={styles.pagination} style={{ padding: '0 var(--space-4)' }}>
            <span className={styles.pageInfo}>
              {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} / {filtered.length}건
            </span>
            <div className={styles.pageButtons}>
              <button className={styles.pageBtn} disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>이전</button>
              <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>다음</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
