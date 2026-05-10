'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastContext';
import styles from './page.module.css';

export default function RulesPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRules() {
      const supabase = createClient();
      const { data } = await supabase.from('detection_rules').select('*').order('created_at', { ascending: true });
      if (data) setRules(data);
      setLoading(false);
    }
    fetchRules();
  }, []);

  const toggleRule = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setRules(rules.map(r => r.id === id ? { ...r, is_active: newStatus } : r));

    const { error } = await supabase
      .from('detection_rules')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      // Revert optimistic update
      setRules(rules.map(r => r.id === id ? { ...r, is_active: currentStatus } : r));
      toast({ type: 'error', title: '규칙 상태 변경 실패', message: error.message });
    } else {
      toast({ type: 'success', title: '규칙 상태 변경', message: `규칙이 ${newStatus ? '활성화' : '비활성화'} 되었습니다.` });
    }
  };

  const renderThreshold = (threshold: Record<string, any>) => {
    return Object.entries(threshold).map(([key, val]) => {
      let label = key;
      let displayVal = String(val);
      if (key === 'multiplier') { label = '정가 대비 배율'; displayVal = `${val}배 이상`; }
      if (key === 'max_daily_quantity') { label = '일일 최대 구매량'; displayVal = `${val}매`; }
      if (key === 'max_monthly_resales') { label = '월간 최대 재판매'; displayVal = `${val}회`; }
      if (key === 'max_hours') { label = '재판매 제한 시간'; displayVal = `${val}시간 이내`; }
      if (key === 'max_accounts_per_ip') { label = 'IP당 최대 계정'; displayVal = `${val}개`; }

      return (
        <div key={key} className={styles.configRow}>
          <span className={styles.configLabel}>{label}</span>
          <span className={styles.configValue}>{displayVal}</span>
        </div>
      );
    });
  };

  if (loading) return <div style={{ padding: '2rem' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.pageTitle}>탐지 규칙 관리</h1>
          <p className={styles.pageSubtitle}>이상 거래 탐지 엔진의 규칙과 가중치를 설정합니다.</p>
        </div>
        <Button variant="primary">새 규칙 추가</Button>
      </div>

      <div className={styles.ruleGrid}>
        {rules.map(rule => (
          <div key={rule.id} className={styles.ruleCard}>
            <div className={styles.ruleHeader}>
              <div>
                <div className={styles.ruleName}>{rule.name}</div>
                <div className={styles.ruleType}>{rule.type}</div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={rule.is_active}
                  onChange={() => toggleRule(rule.id, rule.is_active)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <p className={styles.ruleDesc}>{rule.description}</p>

            <div className={styles.ruleConfig}>
              <div className={styles.configRow}>
                <span className={styles.configLabel}>위험도 가중치 (0~100)</span>
                <span className={styles.configValue} style={{ color: 'var(--color-danger-light)' }}>{rule.weight}점</span>
              </div>
              {renderThreshold(rule.threshold)}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm">규칙 수정</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
