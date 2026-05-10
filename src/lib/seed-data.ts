import type {
  Game, Transaction, TrendDataPoint, TeamAnomalyData,
  DashboardStats, Report, BlacklistEntry, DetectionRule,
  KBOTeam, RiskLevel, TransactionType, TransactionStatus,
  ReportStatus, BlacklistLevel,
} from '@/types';
import { KBO_TEAMS, KBO_STADIUMS } from '@/types';

// ===== Deterministic random =====
let seed = 42;
function random() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// ===== Generate Games =====
function generateGames(): Game[] {
  const games: Game[] = [];
  const startDate = new Date('2026-04-01');

  for (let day = 0; day < 40; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    if (random() < 0.15) continue; // skip some days

    const numGames = randomInt(3, 5);
    const usedTeams = new Set<KBOTeam>();

    for (let g = 0; g < numGames; g++) {
      let home: KBOTeam, away: KBOTeam;
      do { home = pick(KBO_TEAMS); } while (usedTeams.has(home));
      usedTeams.add(home);
      do { away = pick(KBO_TEAMS); } while (usedTeams.has(away) || away === home);
      usedTeams.add(away);

      const hours = [14, 17, 18, 18.5];
      const h = pick(hours);
      const gameDate = new Date(date);
      gameDate.setHours(Math.floor(h), (h % 1) * 60, 0, 0);

      games.push({
        id: `game-${String(games.length + 1).padStart(3, '0')}`,
        home_team: home,
        away_team: away,
        stadium: KBO_STADIUMS[home],
        game_date: gameDate.toISOString(),
        is_soldout: random() < 0.3,
      });
    }
  }
  return games;
}

// ===== Generate Transactions =====
const SEAT_SECTIONS = ['1루 내야', '3루 내야', '1루 외야', '3루 외야', '중앙 지정석', '테이블석', '스카이박스', '응원석'];
const PLATFORMS = ['티켓링크', '인터파크', '중고나라', '번개장터', '트위터', '당근마켓'];
const PRICE_RANGES: Record<string, [number, number]> = {
  '1루 내야': [25000, 40000],
  '3루 내야': [25000, 40000],
  '1루 외야': [12000, 18000],
  '3루 외야': [12000, 18000],
  '중앙 지정석': [35000, 55000],
  '테이블석': [60000, 100000],
  '스카이박스': [80000, 150000],
  '응원석': [8000, 15000],
};

function generateTransactions(games: Game[]): Transaction[] {
  const transactions: Transaction[] = [];
  const accountPool = Array.from({ length: 80 }, (_, i) => `user_${String(i + 1).padStart(3, '0')}`);
  const scalperAccounts = accountPool.slice(0, 8); // 10% are scalpers

  for (let i = 0; i < 500; i++) {
    const game = pick(games);
    const seat = pick(SEAT_SECTIONS);
    const [minP, maxP] = PRICE_RANGES[seat];
    const originalPrice = randomInt(minP, maxP);
    const isScalper = random() < 0.3;
    const account = isScalper ? pick(scalperAccounts) : pick(accountPool);

    let transactionType: TransactionType = 'PURCHASE';
    let resalePrice: number | null = null;
    let riskScore = 0;
    let riskLevel: RiskLevel = 'NORMAL';
    const flaggedRules: string[] = [];
    let quantity = randomInt(1, 4);
    let platform = pick(PLATFORMS.slice(0, 2));

    if (isScalper) {
      const pattern = random();

      if (pattern < 0.35) {
        // High price resale
        transactionType = 'RESALE';
        const markup = 1.5 + random() * 5;
        resalePrice = Math.round(originalPrice * markup);
        platform = pick(PLATFORMS.slice(2));
        flaggedRules.push('HIGH_PRICE_RESALE');
        riskScore += 25 + randomInt(0, 20);
      }

      if (pattern < 0.55 || random() < 0.3) {
        // Bulk purchase
        quantity = randomInt(6, 20);
        flaggedRules.push('BULK_PURCHASE');
        riskScore += 20 + randomInt(0, 15);
      }

      if (random() < 0.4) {
        // Frequent resale
        flaggedRules.push('FREQUENT_RESALE');
        riskScore += 15 + randomInt(0, 10);
      }

      if (random() < 0.3) {
        // Quick resale
        transactionType = 'RESALE';
        if (!resalePrice) resalePrice = Math.round(originalPrice * (1.2 + random() * 2));
        platform = pick(PLATFORMS.slice(2));
        flaggedRules.push('QUICK_RESALE');
        riskScore += 15 + randomInt(0, 10);
      }

      if (random() < 0.2) {
        flaggedRules.push('SUSPICIOUS_IP');
        riskScore += 10 + randomInt(0, 10);
      }

      riskScore = Math.min(100, riskScore);
    } else {
      // Normal transaction with slight random score
      riskScore = randomInt(0, 25);
      if (random() < 0.05) {
        // False positive
        riskScore = randomInt(30, 50);
        flaggedRules.push('HIGH_PRICE_RESALE');
        transactionType = 'RESALE';
        resalePrice = Math.round(originalPrice * (1.3 + random() * 0.5));
        platform = pick(PLATFORMS.slice(2));
      }
    }

    // Determine risk level
    if (riskScore <= 30) riskLevel = 'NORMAL';
    else if (riskScore <= 60) riskLevel = 'CAUTION';
    else if (riskScore <= 80) riskLevel = 'WARNING';
    else riskLevel = 'DANGER';

    const statuses: TransactionStatus[] = ['PENDING', 'PENDING', 'PENDING', 'REVIEWED', 'REPORTED', 'DISMISSED'];
    let status: TransactionStatus = 'PENDING';
    if (riskScore > 60) {
      status = pick(statuses);
    }

    const txDate = new Date(game.game_date);
    txDate.setDate(txDate.getDate() - randomInt(1, 14));
    txDate.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59));

    const ipBase = isScalper ? `192.168.${randomInt(1, 3)}` : `10.${randomInt(1, 255)}.${randomInt(1, 255)}`;

    transactions.push({
      id: `tx-${String(i + 1).padStart(4, '0')}`,
      account_id: account,
      game_id: game.id,
      team: game.home_team,
      seat_info: `${seat} ${String.fromCharCode(65 + randomInt(0, 7))}블록 ${randomInt(1, 30)}열 ${randomInt(1, 40)}번`,
      original_price: originalPrice,
      resale_price: resalePrice,
      transaction_type: transactionType,
      quantity,
      source_platform: platform,
      listing_url: `https://example.com/item/${randomInt(100000, 999999)}`,
      risk_score: riskScore,
      risk_level: riskLevel,
      flagged_rules: flaggedRules,
      status,
      admin_note: null,
      ip_address: `${ipBase}.${randomInt(1, 255)}`,
      created_at: txDate.toISOString(),
      game,
    });
  }

  return transactions;
}

// ===== Generate Reports =====
function generateReports(transactions: Transaction[]): Report[] {
  const flaggedTxs = transactions.filter(t => t.risk_score > 50);
  const reports: Report[] = [];
  const reporters = ['김민수', '이영희', '박정호', '최수진', '정대현', '한소연', '오지훈'];

  for (let i = 0; i < 20; i++) {
    const tx = i < flaggedTxs.length ? flaggedTxs[i] : null;
    const statuses: ReportStatus[] = ['RECEIVED', 'INVESTIGATING', 'RESOLVED', 'REJECTED'];
    const status = pick(statuses);

    const createdAt = new Date('2026-04-10');
    createdAt.setDate(createdAt.getDate() + randomInt(0, 30));

    reports.push({
      id: `rpt-${String(i + 1).padStart(3, '0')}`,
      transaction_id: tx?.id || null,
      reporter_name: pick(reporters),
      description: tx
        ? `${tx.team} 경기 티켓이 정가 대비 ${tx.resale_price ? Math.round(((tx.resale_price - tx.original_price) / tx.original_price) * 100) : 0}% 높은 가격에 판매되고 있습니다. 계정: ${tx.account_id}`
        : `소셜 미디어에서 다량의 티켓 재판매 게시글을 발견했습니다.`,
      evidence_url: random() > 0.3 ? `https://example.com/evidence/${i + 1}` : null,
      status,
      assigned_to: null,
      admin_note: status === 'RESOLVED' ? '조사 완료, 블랙리스트 등록 조치' : null,
      created_at: createdAt.toISOString(),
      resolved_at: status === 'RESOLVED' ? new Date(createdAt.getTime() + randomInt(1, 7) * 86400000).toISOString() : null,
      transaction: tx || undefined,
    });
  }
  return reports;
}

// ===== Generate Blacklist =====
function generateBlacklist(transactions: Transaction[]): BlacklistEntry[] {
  const scalperTxs = transactions.filter(t => t.risk_score > 70);
  const uniqueAccounts = [...new Set(scalperTxs.map(t => t.account_id))].slice(0, 10);
  const levels: BlacklistLevel[] = ['WATCH', 'SUSPENDED', 'BANNED'];

  return uniqueAccounts.map((accountId, i) => {
    const relatedTxs = scalperTxs.filter(t => t.account_id === accountId);
    const level = relatedTxs.length > 5 ? 'BANNED' : relatedTxs.length > 2 ? 'SUSPENDED' : pick(levels);

    return {
      id: `bl-${String(i + 1).padStart(3, '0')}`,
      account_id: accountId,
      reason: `다수 이상 거래 탐지 (${relatedTxs.length}건), 최고 위험도: ${Math.max(...relatedTxs.map(t => t.risk_score))}`,
      level,
      related_transactions: relatedTxs.map(t => t.id),
      registered_by: 'system',
      created_at: new Date('2026-04-15T09:00:00').toISOString(),
      expires_at: level === 'WATCH' ? new Date('2026-07-15T09:00:00').toISOString() : null,
    };
  });
}

// ===== Generate Detection Rules =====
function generateDetectionRules(): DetectionRule[] {
  return [
    {
      id: 'rule-001',
      name: '고가 재판매',
      type: 'HIGH_PRICE_RESALE',
      description: '정가 대비 일정 비율 이상의 가격으로 재판매되는 거래를 탐지합니다.',
      threshold: { multiplier: 1.5 },
      weight: 25,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'rule-002',
      name: '대량 구매',
      type: 'BULK_PURCHASE',
      description: '동일 계정이 하루에 일정 매수 이상 구매하는 경우를 탐지합니다.',
      threshold: { max_daily_quantity: 10 },
      weight: 20,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'rule-003',
      name: '반복 재판매',
      type: 'FREQUENT_RESALE',
      description: '동일 계정의 월간 재판매 횟수가 일정 횟수를 초과하는 경우를 탐지합니다.',
      threshold: { max_monthly_resales: 5 },
      weight: 15,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'rule-004',
      name: '빠른 재판매',
      type: 'QUICK_RESALE',
      description: '구매 후 일정 시간 이내에 재판매하는 거래를 탐지합니다.',
      threshold: { max_hours: 24 },
      weight: 15,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'rule-005',
      name: 'IP 이상 탐지',
      type: 'SUSPICIOUS_IP',
      description: '동일 IP에서 다수의 계정이 활동하는 경우를 탐지합니다.',
      threshold: { max_accounts_per_ip: 3 },
      weight: 10,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    },
  ];
}

// ===== Dashboard Stats =====
function generateDashboardStats(transactions: Transaction[]): DashboardStats {
  const total = transactions.length;
  const anomaly = transactions.filter(t => t.risk_level !== 'NORMAL').length;
  return {
    totalTransactions: total,
    anomalyTransactions: anomaly,
    anomalyRate: Math.round((anomaly / total) * 1000) / 10,
    activeBlacklist: 8,
    totalTransactionsDelta: 12,
    anomalyTransactionsDelta: 8,
  };
}

// ===== Trend Data =====
function generateTrendData(transactions: Transaction[]): TrendDataPoint[] {
  const dateMap = new Map<string, TrendDataPoint>();

  transactions.forEach(tx => {
    const date = tx.created_at.split('T')[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, total: 0, normal: 0, caution: 0, warning: 0, danger: 0 });
    }
    const d = dateMap.get(date)!;
    d.total++;
    d[tx.risk_level.toLowerCase() as 'normal' | 'caution' | 'warning' | 'danger']++;
  });

  return Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
}

// ===== Team Anomaly Data =====
function generateTeamData(transactions: Transaction[]): TeamAnomalyData[] {
  const teamMap = new Map<KBOTeam, { total: number; anomaly: number }>();

  KBO_TEAMS.forEach(team => teamMap.set(team, { total: 0, anomaly: 0 }));

  transactions.forEach(tx => {
    const data = teamMap.get(tx.team);
    if (data) {
      data.total++;
      if (tx.risk_level !== 'NORMAL') data.anomaly++;
    }
  });

  return KBO_TEAMS.map(team => {
    const data = teamMap.get(team)!;
    return {
      team,
      count: data.anomaly,
      percentage: data.total > 0 ? (data.anomaly / data.total) * 100 : 0,
    };
  });
}

// ===== Master Export =====
export function generateAllSeedData() {
  seed = 42; // reset
  const games = generateGames();
  const transactions = generateTransactions(games);
  const reports = generateReports(transactions);
  const blacklist = generateBlacklist(transactions);
  const detectionRules = generateDetectionRules();
  const dashboardStats = generateDashboardStats(transactions);
  const trendData = generateTrendData(transactions);
  const teamData = generateTeamData(transactions);

  return {
    games,
    transactions,
    reports,
    blacklist,
    detectionRules,
    dashboardStats,
    trendData,
    teamData,
  };
}
