// ===== ENUM Types =====

export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export type TransactionType = 'PURCHASE' | 'RESALE';

export type RiskLevel = 'NORMAL' | 'CAUTION' | 'WARNING' | 'DANGER';

export type TransactionStatus = 'PENDING' | 'REVIEWED' | 'REPORTED' | 'DISMISSED';

export type ReportStatus = 'RECEIVED' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';

export type BlacklistLevel = 'WATCH' | 'SUSPENDED' | 'BANNED';

// ===== KBO Teams =====

export const KBO_TEAMS = [
  'LG 트윈스',
  'KT 위즈',
  'SSG 랜더스',
  'NC 다이노스',
  '두산 베어스',
  'KIA 타이거즈',
  '롯데 자이언츠',
  '삼성 라이온즈',
  '한화 이글스',
  '키움 히어로즈',
] as const;

export type KBOTeam = (typeof KBO_TEAMS)[number];

export const KBO_STADIUMS: Record<KBOTeam, string> = {
  'LG 트윈스': '잠실야구장',
  'KT 위즈': '수원KT위즈파크',
  'SSG 랜더스': '인천SSG랜더스필드',
  'NC 다이노스': '창원NC파크',
  '두산 베어스': '잠실야구장',
  'KIA 타이거즈': '광주-기아챔피언스필드',
  '롯데 자이언츠': '사직야구장',
  '삼성 라이온즈': '대구삼성라이온즈파크',
  '한화 이글스': '한화생명이글스파크',
  '키움 히어로즈': '고척스카이돔',
};

// ===== Database Models =====

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team: KBOTeam | null;
  created_at: string;
}

export interface Game {
  id: string;
  home_team: KBOTeam;
  away_team: KBOTeam;
  stadium: string;
  game_date: string;
  is_soldout: boolean;
}

export interface Transaction {
  id: string;
  account_id: string;
  game_id: string;
  team: KBOTeam;
  seat_info: string;
  original_price: number;
  resale_price: number | null;
  transaction_type: TransactionType;
  quantity: number;
  source_platform: string;
  listing_url?: string;
  risk_score: number;
  risk_level: RiskLevel;
  flagged_rules: string[];
  status: TransactionStatus;
  admin_note: string | null;
  ip_address: string | null;
  created_at: string;
  // Joined
  game?: Game;
}

export interface Report {
  id: string;
  transaction_id: string | null;
  reporter_name: string;
  description: string;
  evidence_url: string | null;
  status: ReportStatus;
  assigned_to: string | null;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  // Joined
  transaction?: Transaction;
  assignee?: Profile;
}

export interface BlacklistEntry {
  id: string;
  account_id: string;
  reason: string;
  level: BlacklistLevel;
  related_transactions: string[];
  registered_by: string;
  created_at: string;
  expires_at: string | null;
  // Joined
  registerer?: Profile;
}

export interface DetectionRule {
  id: string;
  name: string;
  type: string;
  description: string;
  threshold: Record<string, number | string>;
  weight: number;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
}

// ===== Dashboard Stats =====

export interface DashboardStats {
  totalTransactions: number;
  anomalyTransactions: number;
  anomalyRate: number;
  activeBlacklist: number;
  totalTransactionsDelta: number;
  anomalyTransactionsDelta: number;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  normal: number;
  caution: number;
  warning: number;
  danger: number;
}

export interface TeamAnomalyData {
  team: KBOTeam;
  count: number;
  percentage: number;
}

// ===== Risk Score Colors =====

export const RISK_COLORS: Record<RiskLevel, string> = {
  NORMAL: '#10B981',
  CAUTION: '#F59E0B',
  WARNING: '#F97316',
  DANGER: '#DC2626',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  NORMAL: '정상',
  CAUTION: '주의',
  WARNING: '경고',
  DANGER: '위험',
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: '대기',
  REVIEWED: '검토완료',
  REPORTED: '신고됨',
  DISMISSED: '기각',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  RECEIVED: '접수',
  INVESTIGATING: '조사중',
  RESOLVED: '처리완료',
  REJECTED: '기각',
};

export const BLACKLIST_LEVEL_LABELS: Record<BlacklistLevel, string> = {
  WATCH: '주의',
  SUSPENDED: '거래정지',
  BANNED: '영구정지',
};
