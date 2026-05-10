'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import TrendChart from '@/components/charts/TrendChart';
import TeamChart from '@/components/charts/TeamChart';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, DashboardStats, TrendDataPoint, TeamAnomalyData } from '@/types';
import { KBO_TEAMS } from '@/types';
import styles from './page.module.css';

function getScoreClass(riskLevel: string) {
  switch (riskLevel) {
    case 'DANGER': return styles.scoreDanger;
    case 'WARNING': return styles.scoreWarning;
    case 'CAUTION': return styles.scoreCaution;
    default: return styles.scoreNormal;
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<Transaction[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [teamData, setTeamData] = useState<TeamAnomalyData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // 1. Fetch recent alerts (top 10 abnormal transactions)
      const { data: alerts } = await supabase
        .from('transactions')
        .select('*')
        .neq('risk_level', 'NORMAL')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (alerts) setRecentAlerts(alerts as Transaction[]);

      // 2. Fetch Dashboard Stats (aggregate)
      // Since Supabase doesn't have custom endpoints in MVP, we fetch all to aggregate (or we could use RPC).
      // For MVP, we'll fetch basic counts.
      const { count: totalTxs } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
      const { count: anomalyTxs } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).neq('risk_level', 'NORMAL');
      const { count: activeBl } = await supabase.from('blacklist').select('*', { count: 'exact', head: true }).neq('level', 'WATCH');

      const tTotal = totalTxs || 0;
      const tAnomaly = anomalyTxs || 0;

      setDashboardStats({
        totalTransactions: tTotal,
        anomalyTransactions: tAnomaly,
        anomalyRate: tTotal > 0 ? Math.round((tAnomaly / tTotal) * 1000) / 10 : 0,
        activeBlacklist: activeBl || 0,
        totalTransactionsDelta: 12, // Dummy delta
        anomalyTransactionsDelta: 8, // Dummy delta
      });

      // 3. Trend Data & Team Data (Fetch recent transactions for simple aggregation)
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('created_at, risk_level, team')
        .order('created_at', { ascending: false })
        .limit(1000); // Fetch up to 1000 for aggregation
      
      if (recentTxs) {
        // Trend
        const dateMap = new Map<string, TrendDataPoint>();
        recentTxs.forEach(tx => {
          const date = tx.created_at.split('T')[0];
          if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, normal: 0, caution: 0, warning: 0, danger: 0 });
          const d = dateMap.get(date)!;
          d.total++;
          d[tx.risk_level.toLowerCase() as 'normal' | 'caution' | 'warning' | 'danger']++;
        });
        setTrendData(Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-14));

        // Team
        const tmMap = new Map<string, { total: number; anomaly: number }>();
        KBO_TEAMS.forEach(t => tmMap.set(t, { total: 0, anomaly: 0 }));
        recentTxs.forEach(tx => {
          const d = tmMap.get(tx.team);
          if (d) {
            d.total++;
            if (tx.risk_level !== 'NORMAL') d.anomaly++;
          }
        });
        setTeamData(KBO_TEAMS.map(team => {
          const d = tmMap.get(team)!;
          return { team, count: d.anomaly, percentage: d.total > 0 ? (d.anomaly / d.total) * 100 : 0 };
        }));
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !dashboardStats) {
    return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>대시보드</h1>
        <p className={styles.pageSubtitle}>KBO 리그 티켓 이상 거래 현황을 한눈에 파악합니다.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          icon="📋"
          label="총 거래 건수"
          value={dashboardStats.totalTransactions}
          delta={dashboardStats.totalTransactionsDelta}
          color="blue"
        />
        <StatCard
          icon="⚠️"
          label="이상 거래 건수"
          value={dashboardStats.anomalyTransactions}
          delta={dashboardStats.anomalyTransactionsDelta}
          color="red"
        />
        <StatCard
          icon="📊"
          label="이상 거래 비율"
          value={`${dashboardStats.anomalyRate}%`}
          color="amber"
        />
        <StatCard
          icon="🚫"
          label="활성 블랙리스트"
          value={dashboardStats.activeBlacklist}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <Card title="이상 거래 추이" subtitle="최근 14일간 등급별 이상 거래 건수">
          <TrendChart data={trendData} />
        </Card>
        <Card title="구단별 이상 거래" subtitle="구단별 이상 거래 건수">
          <TeamChart data={teamData} />
        </Card>
      </div>

      {/* Alert Feed */}
      <Card title="최근 탐지 알림" subtitle="위험도가 높은 최근 거래" action={
        <Link href="/transactions" style={{ fontSize: '13px', color: 'var(--color-secondary-light)' }}>
          전체 보기 →
        </Link>
      }>
        <div className={styles.alertFeed}>
          {recentAlerts.map((tx, i) => (
            <Link
              key={tx.id}
              href={`/transactions/${tx.id}`}
              className={styles.alertItem}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`${styles.alertScore} ${getScoreClass(tx.risk_level)}`}>
                {tx.risk_score}
              </div>
              <div className={styles.alertInfo}>
                <div className={styles.alertTitle}>
                  {tx.team} — {tx.seat_info.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className={styles.alertMeta}>
                  <Badge variant="risk" value={tx.risk_level} showDot={false} />
                  <span>{tx.account_id}</span>
                  <span>{tx.source_platform}</span>
                </div>
              </div>
              <span className={styles.alertTime}>{formatTimeAgo(tx.created_at)}</span>
            </Link>
          ))}
          {recentAlerts.length === 0 && (
            <div style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '13px' }}>최근 탐지된 알림이 없습니다.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
