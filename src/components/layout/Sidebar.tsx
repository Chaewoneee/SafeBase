'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  {
    label: '모니터링',
    items: [
      { name: '대시보드', href: '/dashboard', icon: '📊' },
      { name: '거래 관리', href: '/transactions', icon: '🔍' },
    ],
  },
  {
    label: '운영',
    items: [
      { name: '신고 관리', href: '/reports', icon: '🚨' },
      { name: '블랙리스트', href: '/blacklist', icon: '🚫' },
    ],
  },
  {
    label: '관리',
    items: [
      { name: '탐지 규칙', href: '/settings/rules', icon: '⚙️' },
      { name: '사용자 관리', href: '/settings/users', icon: '👥' },
    ],
  },
];

export default function Sidebar({ userName = '관리자', userRole = 'ADMIN', userEmail = '' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>SB</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>SafeBase</span>
          <span className={styles.logoSub}>KBO 암표 탐지 시스템</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((section) => (
          <div key={section.label} className={styles.navSection}>
            <div className={styles.navLabel}>{section.label}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userRole}>{userRole}</div>
          </div>
        </div>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? '▶' : '◀ 접기'}
        </button>
      </div>
    </aside>
  );
}
