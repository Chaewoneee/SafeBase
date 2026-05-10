'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// 더미 사용자 데이터
const MOCK_USERS = [
  { id: 'usr-001', name: '김관리', email: 'admin@safebase.kr', role: 'ADMIN', lastLogin: '2026-05-10T09:00:00Z', status: 'ACTIVE' },
  { id: 'usr-002', name: '이운영', email: 'manager@safebase.kr', role: 'MANAGER', lastLogin: '2026-05-09T14:30:00Z', status: 'ACTIVE' },
  { id: 'usr-003', name: '박모니터', email: 'viewer@safebase.kr', role: 'VIEWER', lastLogin: '2026-05-08T10:15:00Z', status: 'INACTIVE' },
];

export default function UsersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>사용자 관리</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            SafeBase 시스템에 접근할 수 있는 운영진 및 모니터링 요원을 관리합니다.
          </p>
        </div>
        <Button variant="primary">사용자 초대</Button>
      </div>

      <Card noPadding>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>이름</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>이메일</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>역할</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>마지막 접속</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>상태</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-primary)' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant="custom" value={user.role} label={user.role} showDot={false} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ 
                      color: user.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                      fontSize: '0.75rem'
                    }}>
                      {user.status === 'ACTIVE' ? '● 활성' : '○ 비활성'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Button variant="ghost" size="sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>수정</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
