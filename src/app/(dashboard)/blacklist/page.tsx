'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

const PER_PAGE = 20;

export default function BlacklistPage() {
  const [loading, setLoading] = useState(true);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchBlacklist() {
      const supabase = createClient();
      const { data } = await supabase
        .from('blacklist')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setBlacklist(data);
      setLoading(false);
    }
    fetchBlacklist();
  }, []);

  useEffect(() => {
    let result = [...blacklist];
    if (levelFilter) result = result.filter(b => b.level === levelFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [blacklist, levelFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  if (loading) return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.pageTitle}>블랙리스트</h1>
          <p className={styles.pageSubtitle}>악성 거래 계정을 조회하고 제재 수준을 관리합니다.</p>
        </div>
        <div>
          <Button variant="primary">수동 등록</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="">전체 등급</option>
          <option value="WATCH">관찰 대상</option>
          <option value="SUSPENDED">이용 정지</option>
          <option value="BANNED">영구 정지</option>
        </select>
      </div>

      <Card noPadding>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>등록일</th>
                <th>계정 ID</th>
                <th>제재 등급</th>
                <th>등록 사유</th>
                <th>관련 거래수</th>
                <th>만료일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleDateString('ko-KR')}</td>
                  <td><span className={styles.accountId}>{entry.account_id}</span></td>
                  <td><Badge variant="blacklist" value={entry.level} showDot={false} /></td>
                  <td><span className={styles.reason} title={entry.reason}>{entry.reason}</span></td>
                  <td>{entry.related_transactions ? entry.related_transactions.length : 0}건</td>
                  <td>
                    {entry.expires_at ? new Date(entry.expires_at).toLocaleDateString('ko-KR') : <span style={{ color: 'var(--color-danger)' }}>영구</span>}
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" style={{ padding: '4px 8px', fontSize: '12px' }}>수정</Button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                    조회된 블랙리스트 내역이 없습니다.
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
