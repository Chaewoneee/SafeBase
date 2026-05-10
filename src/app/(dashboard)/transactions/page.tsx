'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types';
import styles from './page.module.css';

const PER_PAGE = 20;

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchTxs() {
      const supabase = createClient();
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setAllTransactions(data as Transaction[]);
      }
      setLoading(false);
    }
    fetchTxs();
  }, []);

  useEffect(() => {
    let result = [...allTransactions];
    if (riskFilter) result = result.filter(tx => tx.risk_level === riskFilter);
    if (statusFilter) result = result.filter(tx => tx.status === statusFilter);
    if (teamFilter) result = result.filter(tx => tx.team === teamFilter);
    
    setFiltered(result);
    setCurrentPage(1);
  }, [allTransactions, riskFilter, statusFilter, teamFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  if (loading) {
    return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.pageTitle}>거래 관리</h1>
          <p className={styles.pageSubtitle}>실시간으로 수집된 거래 내역을 조회하고 상태를 변경합니다.</p>
        </div>
        <span className={styles.resultCount}>총 {filtered.length}건 조회됨</span>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="">모든 등급</option>
          <option value="DANGER">DANGER</option>
          <option value="WARNING">WARNING</option>
          <option value="CAUTION">CAUTION</option>
          <option value="NORMAL">NORMAL</option>
        </select>

        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">모든 상태</option>
          <option value="PENDING">대기중</option>
          <option value="REVIEWED">검토완료</option>
          <option value="REPORTED">신고됨</option>
          <option value="DISMISSED">기각됨</option>
        </select>

        <select className={styles.filterSelect} value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
          <option value="">모든 구단</option>
          <option value="LG 트윈스">LG 트윈스</option>
          <option value="KT 위즈">KT 위즈</option>
          <option value="SSG 랜더스">SSG 랜더스</option>
          <option value="NC 다이노스">NC 다이노스</option>
          <option value="두산 베어스">두산 베어스</option>
          <option value="KIA 타이거즈">KIA 타이거즈</option>
          <option value="롯데 자이언츠">롯데 자이언츠</option>
          <option value="삼성 라이온즈">삼성 라이온즈</option>
          <option value="한화 이글스">한화 이글스</option>
          <option value="키움 히어로즈">키움 히어로즈</option>
        </select>
      </div>

      <Card noPadding>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>거래 일시</th>
                <th>계정 ID</th>
                <th>구단</th>
                <th>좌석 정보</th>
                <th>정가 대비</th>
                <th>위험도</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(tx => {
                const ratio = tx.resale_price ? Math.round((tx.resale_price / tx.original_price) * 100) : 100;
                return (
                  <tr key={tx.id} className={tx.risk_level === 'DANGER' ? styles.rowDanger : undefined}>
                    <td>
                      <Link href={`/transactions/${tx.id}`} className={styles.rowLink}>
                        {new Date(tx.created_at).toLocaleString('ko-KR')}
                      </Link>
                    </td>
                    <td>{tx.account_id}</td>
                    <td>{tx.team}</td>
                    <td>{tx.seat_info}</td>
                    <td style={{ color: ratio > 150 ? 'var(--color-danger)' : 'inherit' }}>
                      {tx.resale_price ? `${ratio}% (${tx.resale_price.toLocaleString()}원)` : '정가'}
                    </td>
                    <td><Badge variant="risk" value={tx.risk_level} /></td>
                    <td><Badge variant="status" value={tx.status} showDot={false} /></td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                    조회된 거래 내역이 없습니다.
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
