'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './Header.module.css';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/transactions': '거래 관리',
  '/reports': '신고 관리',
  '/reports/new': '신고 등록',
  '/blacklist': '블랙리스트',
  '/settings/rules': '탐지 규칙',
  '/settings/users': '사용자 관리',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  // Build breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  const pageName = PAGE_NAMES[pathname] || segments[segments.length - 1] || '';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          <span>SafeBase</span>
          {segments.map((seg, i) => {
            const href = '/' + segments.slice(0, i + 1).join('/');
            const name = PAGE_NAMES[href] || seg;
            const isLast = i === segments.length - 1;
            return (
              <React.Fragment key={href}>
                <span className={styles.separator}>/</span>
                {isLast ? (
                  <span className={styles.current}>{name}</span>
                ) : (
                  <a href={href}>{name}</a>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.time}>{currentTime}</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
