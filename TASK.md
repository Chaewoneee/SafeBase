# SafeBase — 구현 태스크 목록

> PRD 기반 구현 절차를 마일스톤별로 정리한 문서입니다.
> 각 태스크는 `[ ]` (미완료), `[/]` (진행중), `[x]` (완료) 로 상태를 관리합니다.

---

## M1: 기반 구축

### 1.1 프로젝트 초기화
- [x] Next.js 14+ (App Router) 프로젝트 생성 (`npx -y create-next-app@latest ./`)
- [x] 프로젝트 디렉토리 구조 설계 및 생성
  ```
  src/
  ├── app/                    # App Router 페이지
  │   ├── (auth)/             # 인증 관련 (로그인)
  │   ├── (dashboard)/        # 인증 후 레이아웃
  │   │   ├── dashboard/
  │   │   ├── transactions/
  │   │   ├── reports/
  │   │   ├── blacklist/
  │   │   └── settings/
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/             # 공용 컴포넌트
  │   ├── ui/                 # 기본 UI (Button, Card, Badge 등)
  │   ├── charts/             # 차트 컴포넌트
  │   └── layout/             # 레이아웃 (Sidebar, Header 등)
  ├── lib/                    # 유틸리티, 헬퍼
  │   ├── supabase/           # Supabase 클라이언트
  │   ├── detection/          # 탐지 엔진 로직
  │   └── utils.ts
  ├── types/                  # TypeScript 타입 정의
  └── styles/                 # 글로벌 CSS, CSS Modules
  ```
- [x] 필수 패키지 설치
  - `@supabase/supabase-js`, `@supabase/ssr` — Supabase 클라이언트
  - `recharts` — 차트 라이브러리
- [x] 환경변수 설정 (`.env.local`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.2 디자인 시스템 구축
- [x] 글로벌 CSS 변수 정의 (`globals.css`)
  - 컬러 팔레트 (PRD 9.1 기준)
  - 타이포그래피 (Google Fonts — Inter 또는 Pretendard)
  - 간격, 그림자, 모서리 둥글기 토큰
  - 다크 모드 기본 테마
- [x] 기본 UI 컴포넌트 생성
  - `Button` — 기본/아웃라인/위험/고스트 변형
  - `Card` — 글래스모피즘 효과 적용
  - `Badge` — 위험 등급별 색상 (정상/주의/경고/위험)
  - `Input`, `Select`, `Textarea` — 폼 요소
  - `Table` — 데이터 테이블
  - `Modal` — 모달 다이얼로그
  - `StatusBadge` — 상태 표시 뱃지

### 1.3 Supabase 설정
- [x] Supabase 프로젝트 생성 (supabase.com)
- [x] 데이터베이스 스키마 생성 (SQL 마이그레이션)
  - [ ] `profiles` 테이블 생성 + ENUM 타입 (`user_role`)
  - [ ] `games` 테이블 생성
  - [ ] `transactions` 테이블 생성 + ENUM 타입 (`transaction_type`, `risk_level`, `transaction_status`)
  - [ ] `reports` 테이블 생성 + ENUM 타입 (`report_status`)
  - [ ] `blacklist` 테이블 생성 + ENUM 타입 (`blacklist_level`)
  - [x] `detection_rules` 테이블 생성
  - [x] 외래키 제약 조건 설정
  - [x] 인덱스 생성 (risk_score, created_at, account_id 등)
- [x] RLS (Row Level Security) 정책 설정
  - [x] `profiles` — 본인 프로필만 읽기/수정, Admin은 전체 관리
  - [x] `transactions` — 인증 사용자 읽기, Admin/Manager 수정
  - [x] `reports` — 인증 사용자 읽기/생성, Admin/Manager 수정
  - [x] `blacklist` — 인증 사용자 읽기, Admin/Manager 등록/수정
  - [x] `detection_rules` — Admin만 수정 가능
- [x] Auth Trigger 설정 — 회원가입 시 `profiles` 자동 생성

### 1.4 인증 시스템
- [x] Supabase 클라이언트 유틸리티 구성
  - `createClient()` — 브라우저용 클라이언트
  - `createServerClient()` — 서버 컴포넌트/액션용 클라이언트
- [x] 미들웨어 (`middleware.ts`) 구현
  - 인증되지 않은 사용자 → 로그인 페이지 리다이렉트
  - 인증된 사용자 → `/dashboard` 리다이렉트
- [x] 로그인 페이지 구현 (`/`)
  - 이메일/비밀번호 로그인 폼
  - SafeBase 브랜딩 (로고, 서비스 소개)
  - 에러 핸들링 (잘못된 인증 정보 등)
- [x] RBAC 유틸리티 함수
  - `getUserRole()` — 현재 사용자 역할 조회
  - `hasPermission(role, action)` — 권한 체크 함수
  - `withRole(Component, requiredRole)` — 역할 기반 접근 제어 HOC

### 1.5 공통 레이아웃
- [x] 인증 후 레이아웃 (`(dashboard)/layout.tsx`)
  - **사이드바** — 네비게이션 메뉴 (대시보드, 거래, 신고, 블랙리스트, 설정)
  - **헤더** — 사용자 정보, 역할 표시, 로그아웃
  - 사이드바 접기/펼치기 토글
  - 활성 메뉴 하이라이트
  - 역할에 따른 메뉴 노출 제어

---

## M2: 대시보드 & 시드 데이터

### 2.1 시드 데이터 생성
- [x] 시드 데이터 생성 스크립트 (`scripts/seed.ts`)
  - [x] KBO 10개 구단 경기 데이터 (2026 시즌 기준, 50경기+)
  - [x] 시뮬레이션 거래 데이터 (500건+)
    - 정상 거래 패턴 (70%)
    - 고가 재판매 패턴 (10%)
    - 대량 구매 패턴 (5%)
    - 반복 재판매 패턴 (5%)
    - 빠른 재판매 패턴 (5%)
    - 복합 이상 패턴 (5%)
  - [x] 샘플 신고 데이터 (20건)
  - [x] 샘플 블랙리스트 데이터 (10건)
  - [x] 기본 탐지 규칙 데이터 (5개 규칙)
- [x] Supabase에 시드 데이터 적재 스크립트

### 2.2 대시보드 — 핵심 지표 카드
- [x] `StatCard` 컴포넌트 구현
  - 아이콘, 수치, 라벨, 변화율(전일 대비) 표시
  - 글래스모피즘 + 미묘한 그래디언트 배경
  - 카운트업 애니메이션
- [x] 핵심 지표 데이터 패칭 (Server Action)
  - 오늘의 총 거래 건수
  - 오늘의 이상 거래 건수
  - 이상 거래 비율 (%)
  - 활성 블랙리스트 수

### 2.3 대시보드 — 이상 거래 추이 차트
- [x] `TrendChart` 컴포넌트 구현 (Recharts)
  - 일별 이상 거래 건수 라인 차트
  - 등급별 색상 구분 (정상/주의/경고/위험)
  - 기간 선택 필터 (7일 / 14일 / 30일)
  - 반응형 리사이즈
  - 툴팁 (해당 일자 상세 수치)

### 2.4 대시보드 — 구단별 이상 거래 현황
- [x] `TeamHeatmap` 컴포넌트 구현
  - 10개 구단별 이상 거래 건수 바 차트 또는 히트맵
  - 구단 로고/이름 표시
  - 클릭 시 해당 구단 거래 목록으로 이동

### 2.5 대시보드 — 최근 탐지 알림 피드
- [x] `AlertFeed` 컴포넌트 구현
  - 최근 탐지된 이상 거래 10건 목록
  - 위험 등급 뱃지, 거래 요약, 시간 표시
  - 클릭 시 거래 상세로 이동
  - 실시간 느낌의 애니메이션 (새 항목 슬라이드-인)

### 2.6 대시보드 페이지 조립
- [x] `/dashboard/page.tsx` 구성
  - 그리드 레이아웃으로 카드, 차트, 히트맵, 피드 배치
  - 반응형 대응 (데스크톱 4열 → 태블릿 2열)
  - 로딩 스켈레톤 UI

---

## M3: 거래 관리 & 탐지 엔진

### 3.1 이상 거래 탐지 엔진
- [x] 탐지 규칙 엔진 구현 (`lib/detection/`)
  - [x] `rules.ts` — 5가지 규칙 정의 및 평가 함수
    - 고가 재판매 규칙 (`checkHighPriceResale`)
    - 대량 구매 규칙 (`checkBulkPurchase`)
    - 반복 재판매 규칙 (`checkFrequentResale`)
    - 빠른 재판매 규칙 (`checkQuickResale`)
    - IP 이상 규칙 (`checkSuspiciousIP`)
  - [x] `scorer.ts` — 위험도 점수 계산기
    - 각 규칙별 가중치 적용
    - 0-100 점수 산출
    - 등급 분류 (NORMAL / CAUTION / WARNING / DANGER)
  - [x] `engine.ts` — 통합 탐지 엔진
    - 거래 데이터 입력 → 규칙 평가 → 점수 계산 → 결과 반환
    - DB 탐지 규칙 설정 연동 (임계값, 가중치, 활성화 여부)

### 3.2 거래 목록 페이지
- [x] `/transactions/page.tsx` 구현
  - [x] 필터 패널
    - 날짜 범위 선택
    - 구단 선택 (멀티 셀렉트)
    - 위험 등급 필터 (정상/주의/경고/위험)
    - 거래 유형 (구매/재판매)
    - 가격 범위 슬라이더
    - 처리 상태 (대기/검토완료/신고/기각)
  - [x] 데이터 테이블
    - 컬럼: 거래일시, 구단, 계정ID, 좌석, 정가, 재판매가, 위험도, 상태
    - 정렬 (위험도순, 가격순, 최신순)
    - 페이지네이션 (20건/페이지)
    - 위험 등급별 행 색상 하이라이트
  - [x] Server Action — 거래 목록 조회 (필터/정렬/페이지네이션)

### 3.3 거래 상세 페이지
- [x] `/transactions/[id]/page.tsx` 구현
  - [x] 거래 기본 정보 카드
    - 경기 정보 (홈/원정, 경기장, 일시)
    - 좌석 정보, 정가, 재판매가
    - 거래 계정 식별자, 출처 플랫폼
  - [x] 위험도 분석 패널
    - 위험도 점수 게이지 차트 (0-100)
    - 해당 규칙 목록 + 각 규칙별 점수 기여도
    - 등급 뱃지 대형 표시
  - [x] 관련 거래 히스토리
    - 동일 계정의 다른 거래 목록
    - 동일 경기의 다른 이상 거래 목록
  - [x] 관리자 액션
    - 상태 변경 (대기 → 검토완료 / 신고 / 기각)
    - 관리자 메모 입력
    - 블랙리스트 등록 바로가기
    - 신고 등록 바로가기

---

## M4: 신고 관리 & 블랙리스트

### 4.1 신고 관리
- [x] `/reports/page.tsx` — 신고 목록
  - 필터: 상태(접수/조사중/처리완료/기각), 날짜, 담당자
  - 테이블: 신고일, 신고자, 내용 요약, 관련 거래, 상태, 담당자
  - 상태별 탭 또는 필터
- [x] `/reports/[id]/page.tsx` — 신고 상세 처리
  - 신고 원본 내용 및 증빙 자료 확인
  - 관련 의심 거래 매칭 (수동/자동)
  - 관리자 조사 메모 추가
  - 신고 상태 변경 (접수 → 조사중 → 처리완료/기각)
- [x] `/reports/new/page.tsx` — 신고 접수 (임시 기능)
  - 신고 접수용 폼 (실제로는 외부 채널에서 인입되는 것을 가정)

### 4.2 블랙리스트 관리
- [x] `/blacklist/page.tsx` — 블랙리스트 목록
  - 필터: 제재 등급(관찰/정지/영구정지)
  - 테이블: 계정 식별자, 등급, 등록 사유, 만료일, 관련 거래 수
  - 수동 등록/해제 기능

### 4.3 시스템 설정
- [x] `/settings/rules/page.tsx` — 탐지 규칙 관리
  - 5가지 탐지 규칙 활성화/비활성화 토글
  - 각 규칙별 가중치 및 임계값 설정 폼 (e.g. 고가 배율, 대량 기준 수량)
- [x] `/settings/users/page.tsx` — 사용자 관리 (Admin only)
  - 사용자 목록 (이메일, 이름, 역할, 소속 구단)
  - 역할 변경 (ADMIN / MANAGER / VIEWER)
  - 소속 구단 배정

---

## M5: 폴리싱 & 배포

### 5.1 UI/UX 개선
- [x] 마이크로 애니메이션 적용
  - 페이지 전환 애니메이션
  - 카드 호버 효과 (살짝 떠오르는 효과)
  - 데이터 로딩 스켈레톤 UI
  - 위험도 점수 게이지 애니메이션
  - 알림 피드 슬라이드-인
- [x] 반응형 레이아웃 최종 점검
  - 사이드바 모바일 대응 (오버레이 방식)
  - 데이터 테이블 가로 스크롤
  - 차트 리사이즈
- [x] 에러 바운더리 및 폴백 UI
  - 404 페이지 (`not-found.tsx`)
  - 에러 페이지 (`error.tsx`)
  - 빈 상태 UI (데이터 없을 때)
- [x] 토스트 알림 시스템
  - `ToastProvider` 및 훅 구현
  - 성공/실패/경고 토스트 메시지
  - 자동 사라짐 + 닫기 버튼

### 5.2 데이터 정합성 및 최종 점검
- [ ] 시드 데이터 최종 정비
  - 실제 KBO 구단명, 경기장명 반영
  - 현실적인 좌석 정보 및 가격대 설정
  - 다양한 이상 거래 시나리오 포함
- [ ] 탐지 엔진 검증
  - 시드 데이터 기반 탐지 결과 확인
  - 위험도 점수 분포 확인 (너무 편향되지 않는지)
  - 규칙 임계값 튜닝

### 5.3 배포
- [ ] Vercel 프로젝트 연결 (GitHub 연동)
- [ ] 환경변수 설정 (Vercel 대시보드)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] Vercel 배포 및 도메인 확인
- [ ] 배포 후 스모크 테스트
  - 로그인/로그아웃 정상 동작
  - 대시보드 데이터 로딩
  - 거래 목록/상세 정상 표시
  - 신고/블랙리스트 CRUD 동작
  - RBAC 권한 제어 확인

---

## 참고사항

### 구현 우선순위
1. **인증 + 레이아웃** — 서비스의 골격
2. **시드 데이터 + 대시보드** — 시각적 임팩트 확보
3. **거래 목록 + 탐지 엔진** — 핵심 가치 기능
4. **신고 + 블랙리스트** — 운영 기능 완성
5. **폴리싱 + 배포** — 프로덕션 품질 확보

### 기술적 주의사항
- Server Component를 기본으로 사용하고, 인터랙션이 필요한 경우에만 `'use client'` 적용
- Supabase RLS를 통해 서버 측 보안을 보장하되, 클라이언트에서도 역할 기반 UI 제어 적용
- CSS Modules로 컴포넌트별 스타일 격리, 글로벌 변수는 `globals.css`에서 관리
- 데이터 패칭은 Server Action 우선, 실시간 업데이트 필요 시 클라이언트 패칭 고려
