# ROADMAP

> 기준 문서: `docs/PRD.md` (v0.2, 2026-11-17 Q1~Q9 확정 반영) / 최종 갱신: 2026-11-17
> 공수 표기: S(≤0.5일) / M(1~2일) / L(3일+) · 상태: `[ ]` 미착수, `[x]` 완료 · `[가정]`은 해당 Task 안에서 확정 후 PRD에 반영
> **완료 규칙**: 모든 구현 Task는 "구현 → 테스트 수행 → 통과 확인" 순서로 진행하며, 해당 Task의 테스트가 모두 통과해야 `[x]`로 바꾼다. 테스트가 실패하면 원인을 수정한 뒤 **같은 테스트를 처음부터 다시 수행**하고, 실패 상태로 다음 Task로 넘어가지 않는다.

## 1. 개요

- **목표**: Notion 데이터베이스의 견적서를 고유 링크(`/invoice/[token]`)로 웹에서 열람하고 PDF로 내려받는 읽기 전용 서비스. 웹과 PDF의 금액·품목은 100% 일치해야 한다.
- **MVP 범위**: FR-001~FR-013 (P0: FR-001~010, P1: FR-011~013). 대상 규모 개발자 1~2명, 3주.
- **범위 밖(부록 A)**: 견적서 작성/편집 UI, 계정/로그인/결제/전자서명, 이메일 발송·승인 워크플로, 다국어·다중 통화·세금 자동화, 자체 DB.
- **기술 스택**: Next.js 15.5 App Router, React 19.3, TypeScript(strict), Tailwind v4, shadcn/ui(Base UI `base-nova`, `asChild` 사용 금지), `@notionhq/client`(API `2025-09-03`, `dataSources.query`), `@react-pdf/renderer`(Node 런타임), `server-only`, (선택) `zod`, Vitest(Q5). 경로 별칭 `@/*`는 프로젝트 루트, 들여쓰기 2칸.
- **비기능 요구(6장) 요약**: LCP ≤ 2.0s(캐시 히트) / TTFB ≤ 2.5s p95(미스) / PDF ≤ 5s p95(20행) · 품목 상한 50행 · 토큰 128비트 · 404 동일 응답 · noindex/no-referrer · WCAG 2.1 AA · 최신 Chrome/Edge/Firefox, iOS Safari 16+ · 60초 캐시.

## 2. 현재 상태

| 구분 | 항목 |
|------|------|
| 구현 완료 | 스타터킷 골격: `app/layout.tsx`(ThemeProvider/Header/Footer), `components/ui/{badge,button,card,separator}`(`buttonVariants` export 확인됨), 다크모드 토글, `lib/utils.ts`(`cn`), `.env.example`(PRD 9.3의 변수 작성됨), `.gitignore`의 `.env*`(`!.env.example`) 처리, Task 0-6(미결 사항 1차 확정) |
| 부분 구현 | `config/site.ts`(서비스명 "견적서 뷰어"·설명 갱신됨, 내비는 홈 1개), `app/page.tsx`(3단계 사용 안내 소개 페이지 있음, Notion 템플릿 상세 안내·브랜딩은 미확정) |
| 빈 골격(`.gitkeep`만 존재) | `app/invoice/[token]`, `components/invoice`, `lib/notion`, `lib/invoice`, `lib/pdf` |
| 미착수 | 신규 의존성(`@notionhq/client`, `@react-pdf/renderer`, `server-only`), shadcn `table`/`skeleton`, Notion 워크스페이스, 폰트, 테스트 프레임워크(Vitest)와 `test`/`typecheck` 스크립트(현재 `package.json`에는 `dev/build/start/lint`만 존재), 목 Notion 서버, 배포 |

## 3. 전체 일정 요약

| Phase | 목표 | 주요 산출물 | 예상 공수 | 의존 |
|-------|------|-------------|-----------|------|
| 0. 스파이크/준비 | Notion API, 한글 PDF, 서버리스 번들 3대 불확실성 선검증 | Notion 샘플 DB, 검증 결과 PRD 반영, 스파이크 PDF 프리뷰 배포 | 3~4일 | — |
| 1. 데이터 레이어 | 토큰으로 `Invoice` 반환 + 금액 계산 + 캐시/에러 변환 + 테스트 하네스 | `lib/notion/*`, `lib/invoice/*`, Vitest, 목 Notion 서버 | 5~6일 | 0 |
| 2. 웹 뷰어 | 링크로 견적서 열람 + 상태 화면 | `app/invoice/[token]/*`, `components/invoice/*` | 5~6일 | 1 |
| 3. PDF | 한글 PDF 다운로드 | `lib/pdf/*`, `pdf/route.ts` | 5~6일 | 1, 0-4/0-5 (2와 병렬 가능) |
| 4. 품질/보안/성능 | 일치·성능·보안·접근성 검증, P1 마감 | 검증 체크리스트, 만료 배지 | 3일 | 2, 3 |
| 5. 배포/문서 | 프로덕션 배포, 실기기 검수, README | Vercel 배포, `README.md` | 2~3일 | 4 |

테스트 기준 반영으로 Phase 1~4 공수가 각 +0.5~1일 늘었다. Phase 2·3을 병렬로 진행해야 3주 안에 들어가며 예비일은 거의 없다(6장 R12).

**크리티컬 패스**: 0-1 → 0-3 → 1-4 → 1-5 → 1-6 → 3-3 → 3-4 → 4-1 → 5-1 → 5-2. 1-7(목 서버)은 1-4/1-5와 병렬 진행하되 1-6 전에 끝나야 한다. Phase 2와 Phase 3의 3-1·3-2는 Phase 1 완료 후 병렬 진행 가능(Phase 3의 `route.ts`는 1-6 필요).

일정 압박 시 제외 순서: 4-3(만료 배지, FR-012) → 2-5(인쇄, FR-011) → FR-013 중 메타 태그. P0(FR-001~010)는 유지. **테스트는 제외 대상이 아니다.**

## 4. Phase별 상세

### 4.0 테스트 공통 규약 (모든 Task에 적용)

**도구 배정**

| 대상 | 수단 | 비고 |
|------|------|------|
| 순수 로직(계산, 포맷, 매퍼, UUID 검증, 에러 변환, 폰트 등록, 헤더 sanitize) | Vitest 단위 테스트: `npm run test`, 단일 파일 `npm run test -- <경로>` | Q5. 1-3에서 도입 |
| 화면·Route Handler·캐시 동작 | **Playwright MCP**(`mcp__playwright__browser_navigate`, `_snapshot`, `_click`, `_resize`, `_network_requests`, `_console_messages`, `_evaluate`, `_take_screenshot`, `_press_key`, `_wait_for`) | 목 서버 또는 실제 Notion 샘플 대상 |
| 헤더·바이너리 보조 확인 | `curl -sI`, `curl -s -o`, PDF는 `Read`(pages 지정)로 육안 확인 | Playwright가 닿지 않는 응답 헤더/파일 내용 보강 |
| 정적 검사 | `npm run lint`, `npm run typecheck`(`tsc --noEmit`, 1-3에서 스크립트 추가), `npm run build` | 각 Phase DoD |

**테스트 환경**
- 실제 Notion(0-1 샘플 3건)은 "정상 흐름" 확인용, 오류·경계 시나리오(429/5xx/타임아웃/속성 누락/100건 초과)는 **목 Notion 서버(1-7)** 로 재현한다. 목 서버 사용 시 `NOTION_API_BASE_URL=http://localhost:4010 npm run dev`(또는 `npm run dev:mock`)로 기동한다(A10, 프로덕션에서는 무시).
- 고정 테스트 토큰은 `tests/fixtures/tokens.ts`에 UUID v4 형식 상수로 정의한다(실제 공유 토큰 아님):

| 상수 | 시나리오 |
|------|----------|
| `T_OK3` | 발행, 품목 3건(기본 정상) |
| `T_EMPTY` | 발행, 품목 0건 |
| `T_30` / `T_50` / `T_120` | 발행, 품목 30/50/120건(120건은 100건 초과 페이지네이션) |
| `T_DRAFT` / `T_ARCHIVED` | Status 초안/보관 → 조회 결과 없음 |
| `T_EXPIRED` | 발행, 유효기간 경과 |
| `T_BROKEN` | 필수 속성 누락(예: IssueDate null) |
| `T_429` / `T_5XX` / `T_SLOW` / `T_FLAKY` | 429+`Retry-After` / 500 / 응답 지연 3초 / 첫 1회 500 후 성공 |
| `T_UNKNOWN` | 형식은 UUID이나 존재하지 않음 |

- 뷰포트: 360×800, 768×1024, 1280×800 (`mcp__playwright__browser_resize`). 가로 스크롤 판정: `browser_evaluate`로 `document.documentElement.scrollWidth <= window.innerWidth`.
- 다크모드: 헤더의 테마 토글을 `browser_click`으로 전환 후 `browser_take_screenshot`으로 확인, `browser_evaluate`로 `document.documentElement.classList.contains('dark')` 확인.
- 콘솔: 각 화면에서 `browser_console_messages`의 error 0건(404 문서 자체의 리소스 로드 로그는 예외로 기록).

**실패 시 순환**: 테스트 실패 → 원인 수정 → 실패한 케이스만이 아니라 해당 Task 전체 테스트 재수행 → 통과 확인 후 `[x]`.

---

### Phase 0: 스파이크 및 준비 (3~4일)

- **목표**: 위험 항목(Notion 필터/`filter_properties`, 한글 PDF 폰트, 서버리스 번들 크기)을 본 개발 전에 검증한다(R2, R3, R4). PRD 12장의 1주차 스파이크(1-S)가 0-4·0-5에 해당한다.
- **완료 기준(DoD)**: 실제 Notion DB에서 data source 쿼리 성공 / 한글·특수문자 PDF 샘플에 □ 0건, 로컬 ≤ 5초 / Vercel 프리뷰에서 폰트 포함 PDF 생성 성공 / PRD 9.4 "구현 시 검증할 항목" 결과를 PRD에 `[확인]`으로 반영 / **Phase 0 모든 테스트 통과 + `npm run lint`, `npx tsc --noEmit`, `npm run build` 통과**.
- **Task 목록**
  - [ ] `0-1` Notion 워크스페이스 준비 — Read content 권한 internal Integration 생성, Invoices/InvoiceItems DB를 PRD 7.1 스키마대로 생성(Relation 양방향), 두 DB에 Integration 연결, 샘플 데이터(견적서 3건: 발행/초안/만료, 품목 3·0·30건; 토큰은 UUID v4 수동 입력, Q4), `GET /v1/databases/{id}`로 data source ID 확인 후 `.env.local` 작성. 산출물: `.env.local`(커밋 금지). 요구사항: FR-001, 6.2. 공수 S. 선행 없음.
    - 테스트 케이스(curl, 임시 스크립트):
      - 정상: data source 쿼리 `ShareToken` 필터 → 200, 발행 샘플 1건 반환. 품목 DB를 `Invoice` relation 필터로 조회 → 3건/0건/30건.
      - 경계: 품목 30건 견적서의 `Items` relation이 응답에서 25개로 잘리고 `has_more: true`인지 확인(R10 근거 실측).
      - 오류: 잘못된 `NOTION_TOKEN` → 401 `unauthorized`. Integration 미공유 DB → `object_not_found`. 잘못된 data source ID → 4xx. 이 오류 코드를 0-3 결과표에 기록.
      - 보안: `.env.local`이 `git status`에 나타나지 않음, 스크립트 출력·로그에 토큰 미포함.
    - 검증 방법: 위 curl 결과 기록(Playwright 대상 UI 없음 — 사유: 화면/라우트 미구현). `git check-ignore .env.local` 확인.
    - 완료 조건: 위 케이스가 모두 기대대로 응답하고 결과가 기록됨(실패 시 권한·공유 설정 수정 후 재수행).
  - [ ] `0-2` 의존성 설치 — `npm i @notionhq/client @react-pdf/renderer server-only`, 설치 버전과 기본 API 버전(`2025-09-03`) 확인(R4). 산출물: `package.json`. 공수 S. 선행 없음.
    - 테스트 케이스:
      - 정상: `npm run lint`, `npx tsc --noEmit`, `npm run build` 통과. `npm ls @notionhq/client @react-pdf/renderer` 버전 기록.
      - 오류/보안: 임시 클라이언트 컴포넌트(`"use client"`)에서 `import "server-only"` 모듈을 import하면 **빌드가 실패**하는지 확인 후 임시 파일 삭제(서버 전용 격리 동작 증명).
      - 호환: React 19.3와 `@react-pdf/renderer` peer 의존성 경고 여부 기록.
    - 검증 방법: Bash로 위 명령 수행. 임시 파일은 커밋하지 않는다.
    - 완료 조건: lint/typecheck/build 통과 + server-only 격리 확인.
  - [ ] `0-3` Notion API 미확인 항목 검증 — `select.equals`/`relation.contains` 연산자명, `filter_properties`의 이름/ID 허용 여부와 필터 속성 포함 필요 여부, `page_size` 최대값, 전체 페이지 타입 가드 헬퍼명, `databases.retrieve`의 `data_sources` 반환 여부, 레이트리밋 에러 코드(`APIErrorCode.RateLimited`), `Client` 생성자의 `baseUrl` 옵션(1-7 목 서버 전제), `timeoutMs`·`retry` 옵션 확인. 산출물: 검증 스크립트(임시), PRD 9.4 `[확인]` 갱신. 요구사항: FR-001, 6.6, R4·R10·R11. 공수 M. 선행 `0-1`, `0-2`.
    - 테스트 케이스(스크립트 실호출, 결과표를 PRD에 기록):
      - 정상: `select.equals`+`rich_text.equals` 조합, `relation.contains` 조회 성공, `sorts: [{ property: "Order", direction: "ascending" }]` 정렬 확인.
      - 경계: `page_size: 100`(최대) / `101`(거부 또는 clamp 여부), 품목 30건·120건(임시 추가) `collectPaginatedAPI` 전체 수집 개수와 순서, `filter_properties`에 속성 **이름** vs **ID** 각각 사용·필터 속성 제외 시 동작.
      - 오류: 존재하지 않는 속성명 필터 → `validation_error` 코드/메시지 형태, 레이트리밋 의도적 유발(짧은 루프 10 req/s) 시 `APIErrorCode.RateLimited`+`Retry-After` 확인(실패해도 SDK 타입·문서로 대체 확인), `baseUrl`을 닫힌 포트로 지정 시 발생하는 에러 클래스(네트워크 차단 케이스의 실제 형태).
      - 보안: 에러 객체에서 `body`/`headers`에 토큰이 포함되는지 확인(로그 직렬화 시 제외 대상 결정 근거).
    - 검증 방법: 각 항목 결과가 PRD 9.4에 `[확인]`으로 기록되고 1-1·1-4·1-5·1-6·1-7이 그 결과를 참조한다. 필요 시 Context7로 SDK 문서 재확인.
    - 완료 조건: 9.4의 "구현 시 검증할 항목" 4개 불릿이 전부 `[확인]` 또는 대체 결정으로 닫힘.
  - [ ] `0-4` 한글 PDF 폰트 스파이크 — Noto Sans KR(Q9, 문제 시 Pretendard) TTF 정적 Regular/Bold 배치, OFL 라이선스 고지 파일 추가, `lib/pdf/fonts/` 배치, 임시 Route Handler에서 `Font.register`(절대 경로, `process.cwd()` 기준)+`renderToBuffer`로 샘플 생성, TTF 동작·폰트 용량·서브셋 필요 여부·응답 시간 측정. PDF 텍스트 추출 검증용 devDependency 필요 여부 결정(A11). 산출물: `lib/pdf/fonts/*.ttf`, 임시 `app/spike/pdf/route.ts`(Phase 0 종료 시 삭제). 요구사항: FR-004, 6.5, R2. 공수 M. 선행 `0-2`.
    - 테스트 케이스:
      - 정상: 한글/영문/숫자/특수문자(㈜, ₩, 중점 ·, ①, ~, &, %) 샘플 문장·표 → 모든 글자 정상.
      - 경계: Regular/Bold 두 굵기, 긴 한 줄(200자, 공백 없는 한글) 줄바꿈, 1페이지 초과(품목 60행) 분할.
      - 오류: 폰트 경로를 틀리게 지정했을 때 에러가 명확한지, TTF가 아닌 woff2 지정 시 실패 여부(6.5 `[가정]` 검증).
      - 데이터 이상: 이모지(😀)·제어문자·빈 문자열이 포함돼도 렌더가 throw하지 않는지, 폰트 미지원 글리프의 표시 결과 기록.
      - 성능: 20행 렌더 10회 측정 평균/최대, 메모리(`process.memoryUsage`).
    - 검증 방법: Playwright MCP — `mcp__playwright__browser_navigate`로 `http://localhost:3000/spike/pdf` 접근(다운로드 이벤트 확인), `browser_network_requests`로 상태 200·`Content-Type: application/pdf`·소요 시간 확인. 저장된 PDF를 `Read`(pages 지정)로 열어 □ 0건 육안 체크리스트 작성.
    - 완료 조건: 체크리스트 □ 0건, 로컬 응답 ≤ 5초. 실패 시 폰트 교체/서브셋 후 재측정, 그래도 실패 시 PRD 10장 B안 재검토 후 Phase 3 범위 조정.
  - [ ] `0-5` 서버리스 번들/배포 스파이크 — `0-4`의 임시 라우트를 Vercel 프리뷰에 배포하여 폰트 파일 포함 여부(`outputFileTracingIncludes` 필요 여부), 함수 크기, 콜드스타트 응답 시간, `maxDuration` 필요 여부 확인. Q2(Vercel) 실측 검증. 산출물: `next.config.ts` 설정(필요 시), 측정 결과를 PRD R3에 기록. 요구사항: R3, 6.1, Q2. 공수 S. 선행 `0-4`.
    - 테스트 케이스:
      - 정상: 프리뷰 URL에서 샘플 PDF 200, 한글 정상.
      - 경계: 콜드스타트 첫 요청과 이후 요청 시간 각각 3회 이상 기록(첫 요청 ≤ 5초 목표), 함수 크기가 플랫폼 한도 이내.
      - 오류: `outputFileTracingIncludes` 미설정 상태에서 폰트 파일 누락으로 실패하는지 먼저 확인한 뒤 설정 후 성공(설정 필요성 증명).
      - 보안: 프리뷰 응답 헤더·본문에 환경변수 값이 노출되지 않음.
    - 검증 방법: Playwright MCP — 프리뷰 URL `/spike/pdf`를 `browser_navigate`, `browser_network_requests`로 상태/시간 확인, 다운로드 PDF를 `Read`로 확인. `curl -o`로 응답 시간(`-w '%{time_total}'`) 측정.
    - 완료 조건: 프리뷰에서 한글 PDF 성공 + 측정값 PRD R3 기록. 실패 시 설정/서브셋 수정 후 재배포·재측정.
  - [x] `0-6` 미결 사항 1차 확정(2026-11-17 완료: Q1~Q9 확정, PRD 7.1·7.2·9.3·14장 반영) — Q1(링크 방식), Q3(공급자 정보 위치), Q4(토큰 생성), Q5(테스트 전략), Q6(부가세/통화), Q7(60초 지연) 결정을 사용자에게 확인하고 PRD 반영. 산출물: PRD 갱신. 공수 S. 선행 없음.
    - 검증 방법: 7장 미결 사항 표의 "Phase 0 확정" 항목이 모두 "확정"으로 변경된다. (문서 Task이므로 코드 테스트 대상 아님)
- **리스크**: 한글 폰트 용량이 크거나 TTF가 동작하지 않을 수 있음(→ 서브셋/대체 폰트). 서버리스 번들 한도 초과 시 폰트 서브셋 또는 B안 재평가(일정 +2~3일, 예비일 사용).

### Phase 1: 데이터 레이어 (5~6일)

- **목표**: 유효한 토큰으로 `Invoice`를 반환하고, 잘못된/미발행 토큰은 구분 없이 `null`을 반환하며, 금액 계산을 웹/PDF가 공용으로 사용한다. 오류·경계 시나리오를 재현할 테스트 하네스(Vitest, 목 Notion 서버)를 갖춘다.
- **완료 기준(DoD)**: 샘플 토큰 → `Invoice`(품목 정렬·100건 초과 페이지네이션 전체 수집) / 비UUID·미발행·불일치 → 동일한 `null` / 429·5xx·네트워크 차단·타임아웃 → `UpstreamError`(본문 비노출) / 60초 캐시 동작 실측 / **Phase 1 모든 단위·Playwright 테스트 통과 + lint·typecheck·test·build 통과** / 임시 JSON 출력 페이지로 확인 후 삭제(2-3에서 대체).
- **Task 목록**
  - [ ] `1-1` 도메인 타입·스키마 상수 — `lib/notion/types.ts`(PRD 7.2 기준, 단 Q3 확정에 따라 `supplier`는 행 값이 없으면 `config`/환경변수 기본값으로 채워 항상 존재하도록 매핑), `lib/notion/schema.ts`(속성명 또는 `0-3`에서 결정한 속성 ID 상수). 요구사항: FR-001, R4·R7. 공수 S. 선행 `0-3`, `0-6`.
    - 테스트 케이스:
      - 정상: `npx tsc --noEmit` 통과. 상수 속성명 13개(Invoices)/6개(InvoiceItems)가 PRD 7.1과 1:1.
      - 오류: 실 Notion DB를 `databases.retrieve`/`dataSources.retrieve`로 읽어 상수 이름(또는 ID)이 모두 존재하는지 확인하는 검증 스크립트(`scripts/check-notion-schema.ts`, `[가정]`)에서 하나를 의도적으로 틀리게 하면 실패하는지 확인.
      - 타입: `Invoice.supplier`가 optional이 아님을 컴파일 단계에서 보장(타입 테스트 `expectTypeOf`, Vitest).
    - 검증 방법: `npm run typecheck`, `npm run test -- lib/notion/types`, 스키마 검증 스크립트 실행.
    - 완료 조건: 위 검증 통과(실패 시 상수/타입 수정 후 재수행).
  - [ ] `1-2` 금액 계산·포맷 — `lib/invoice/calculate.ts`의 `calculateTotals(items, taxRate)`(품목금액=수량×단가, 부가세=`Math.floor(공급가액×taxRate/100)`, 총액), `lib/invoice/format.ts`(원화 `220,000원`, 날짜, KST 만료 판정 헬퍼 `isExpired`). 입력 방어: 수량·단가는 0 이상 유한 정수, 위반 시 `RangeError`(`[가정]`: 소수 단가·음수는 매퍼 단계에서 거부하지만 이중 방어). 요구사항: FR-007, FR-008, FR-012(판정부). 공수 S. 선행 `0-6`(Q6), `1-3`.
    - 테스트 케이스 — **수기 계산 기대값 표**(`lib/invoice/calculate.test.ts`):

      | # | 입력(품목: 수량×단가, 세율) | 공급가액 | 부가세 | 총액 | 비고 |
      |---|-----------------------------|----------|--------|------|------|
      | 1 | 2×100,000, 10% | 200,000 | 20,000 | 220,000 | PRD FR-007 예시 |
      | 2 | 1×33,333 + 2×15,500 + 3×1,000, 10% | 67,333 | 6,733 | 74,066 | 6,733.3 절사 |
      | 3 | 1×1,000,000, 0% | 1,000,000 | 0 | 1,000,000 | 세율 0 |
      | 4 | 1×15, 10% | 15 | 1 | 16 | 1.5 → 1 (0.5 경계 절사) |
      | 5 | 1×9, 10% | 9 | 0 | 9 | 0.9 → 0 |
      | 6 | 품목 0건, 10% | 0 | 0 | 0 | 빈 배열 |
      | 7 | 1×100,000, 5.8% | 100,000 | 5,800 | 105,800 | 소수 세율, 부동소수 오차 방어 |
      | 8 | 1×1,001, 8.5% | 1,001 | 85 | 1,086 | 85.085 → 85 |
      | 9 | 50×(1×99,999,999), 10% | 4,999,999,950 | 499,999,995 | 5,499,999,945 | 큰 금액, 50행 상한 |
      | 10 | 수량 0 × 50,000 + 1×1,000, 10% | 1,000 | 100 | 1,100 | 수량 0 품목 |

      - 오류/데이터 이상: 단가 1000.5, 수량 -1, `NaN`, `Infinity`, `null` 주입 → `RangeError`(또는 정의된 에러), 결과를 임의 보정하지 않음. 세율 음수/NaN → 에러.
      - `format` 표: `formatKRW(220000)`→`"220,000원"`, `0`→`"0원"`, `1234567`→`"1,234,567원"`, `5499999945`→`"5,499,999,945원"`. `formatDate("2026-11-14")`→`"2026-11-14"`, `"2026-11-14T00:00:00.000+09:00"`→`"2026-11-14"`(KST 기준), 잘못된 문자열 → 에러.
      - `isExpired(validUntil, now)`: `("2026-11-17", 2026-11-17T23:59:59+09:00)`→false(당일 포함), `("2026-11-17", 2026-11-18T00:00:00+09:00)`→true, `("2026-11-17", 2026-11-17T14:59:59Z)`→false, `("2026-11-17", 2026-11-17T15:00:00Z)`→true(UTC/KST 경계).
    - 검증 방법: `npm run test -- lib/invoice` (순수 로직이므로 Playwright 불필요 — 화면 반영은 2-2·4-1에서 검증).
    - 완료 조건: 표의 10개 + 오류·format·만료 케이스 전부 통과(기대값은 구현에서 복사하지 말고 표의 수기 값 사용). 실패 시 수정 후 재수행.
  - [ ] `1-3` 테스트 환경 도입(Q5 확정: Vitest) — Vitest 설치, `package.json`에 `test`(`vitest run`), `typecheck`(`tsc --noEmit`) 스크립트 추가, `vitest.config.ts`(`@/*` 별칭, `server-only` 모듈 stub), `tests/fixtures/` 디렉터리. 산출물: `vitest.config.ts`, `package.json`, `tests/fixtures/tokens.ts`. 요구사항: R8, FR-007. 공수 S. 선행 `0-6`.
    - 테스트 케이스:
      - 정상: 샘플 테스트(`1 + 1`)와 `@/lib/utils` `cn` import 테스트 통과(별칭 해석 확인).
      - 오류: 의도적으로 실패하는 테스트가 `npm run test`의 종료 코드를 0이 아니게 만드는지 확인 후 제거.
      - 보안/격리: `import "server-only"`가 포함된 모듈이 Vitest에서 import 가능(stub)하되 빌드 설정은 변경하지 않음.
    - 검증 방법: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`.
    - 완료 조건: 네 명령 모두 통과.
  - [ ] `1-4` 매퍼·도메인 에러 — `lib/notion/mapper.ts`(title/rich_text/number/select/date/relation 추출, 필수값 누락·타입 불일치 시 throw, 전체 페이지 타입 가드, Q3 공급자 기본값 병합, 필요 시 `zod`), `lib/notion/errors.ts`(`NotFoundError`, `UpstreamError`, `ConfigError`; Notion 오류 본문 비노출). 요구사항: FR-001, FR-006, R7. 공수 M. 선행 `1-1`, `1-3`.
    - 테스트 케이스(`lib/notion/mapper.test.ts`, 입력은 `0-3`에서 캡처해 토큰·ID를 마스킹한 실제 응답 JSON `tests/fixtures/notion/*.json`):
      - 정상: 견적서+품목 3건 → `Invoice` 필드 전부 매핑(번호, 날짜, `client`, `taxRate`, `items`). title/rich_text가 여러 조각이면 이어 붙임. `Order` 오름차순 보장.
      - 경계: `Description`/`Note`/`ClientContact` 비어 있음 → `undefined`. `TaxRate` 0. 텍스트 2,000자. `Quantity` 0. 품목 0건 → `items: []`. `Order` 중복 시 안정 정렬.
      - Q3 공급자: (a) `Supplier*` 모두 있음 → 행 값, (b) 모두 비어 있음 → 환경변수 기본값, (c) `SupplierName`만 있음 → 이름은 행 값·나머지는 기본값, (d) 행·기본값 모두 이름 없음 → `ConfigError`.
      - 데이터 이상(각각 에러, 사용자 메시지는 일반화): `Number` title 빈 값, `ShareToken` 누락, `Status` null/알 수 없는 값(`"기타"`), `IssueDate`/`ValidUntil` null, `ClientName` 누락, `Quantity`/`UnitPrice` null·문자열 타입, 속성 자체가 없는(이름 변경된) 응답, partial page object(`properties` 없음), `ValidUntil < IssueDate`(정책 `[가정]`: 에러가 아닌 경고만).
      - 보안: 던져진 에러의 `message`/`toString()`에 속성 값·페이지 ID·토큰이 포함되지 않음(속성명만 포함). 서버 로그용 상세 필드와 사용자용 메시지가 분리됨.
    - 검증 방법: `npm run test -- lib/notion/mapper`. 화면 연동은 1-6의 임시 JSON 페이지에서 Playwright로 확인.
    - 완료 조건: 모든 케이스 통과(실패 시 수정 후 재수행).
  - [ ] `1-5` Notion 조회 함수 — `lib/notion/client.ts`(`import "server-only"`, `Client` 싱글턴, `retry.maxRetries`, `timeoutMs`, 테스트 전용 `NOTION_API_BASE_URL` 지원: production에서는 무시, A10), `lib/notion/invoices.ts`의 비캐시 코어 `fetchInvoiceByToken(token)`: (0) UUID 형식 검증 실패 시 Notion 호출 없이 `null` (1) 견적서 data source를 `ShareToken`+`Status=발행`, `page_size: 1`, `Items` 제외로 쿼리 (2) 품목 data source를 `Invoice` relation 필터+`Order` 오름차순+`collectPaginatedAPI`로 조회(견적서의 `Items` 값 미사용, R10) (3) 매핑. 요구사항: FR-001, FR-005, 6.6, R10. 공수 M. 선행 `0-3`, `1-1`, `1-4`.
    - 테스트 케이스(`lib/notion/invoices.test.ts`, `@notionhq/client`를 `vi.mock`으로 대체해 호출 인자·횟수 검증):
      - 정상: `T_OK3` → 견적서 1건+품목 3건, 호출 정확히 2회(견적서 1+품목 1). 견적서 쿼리의 filter가 `ShareToken equals` AND `Status select equals 발행`, `page_size: 1`, `filter_properties`에 `Items` 미포함. 품목 쿼리의 filter가 `Invoice relation contains <페이지ID>`, sorts가 `Order ascending`.
      - 경계: 품목 0건 → `items: []`(에러 아님). 품목 정확히 100건(`has_more:false`) → 품목 쿼리 1회. 품목 120건(`has_more:true` → 2회째 `start_cursor`) → 120건 전부, 순서 유지, 호출 총 3회. 품목 30·50건. 품목 25개 초과(견적서 `Items` 25개 잘림 데이터에서도 전부 반환 = relation 값 미사용 증명).
      - 정상 null: UUID 아님 → **Notion 호출 0회**로 `null`. UUID 형식이나 결과 0건 → `null`이고 품목 쿼리 호출 0회. `Status=초안/보관` 건은 필터가 걸러 결과 0건 → 동일 `null`(초안·불일치·삭제가 호출 인자 외에는 구분 불가).
      - UUID 입력 표(`isValidToken`): 소문자 정상 → true, 대문자 정상 → true(소문자 정규화 `[가정]`), 빈 문자열·공백 포함·35자·37자·`../etc`·`' OR 1=1`·`%00`·10KB 문자열 → false(예외 없이).
      - 오류 전파: 견적서 쿼리 `APIResponseError(object_not_found)` → `UpstreamError`(`null` 아님, 설정 오류를 404로 숨기지 않음), 품목 쿼리 단계 실패도 `UpstreamError`.
      - 데이터 이상: 견적서 응답에 필수 속성 누락 → 매퍼 에러가 `UpstreamError`(스키마 불일치)로 변환, 부분 응답(`has_more:true`이나 `next_cursor` null)에서 무한 루프 없음.
      - 보안: 에러·로그에 `NOTION_TOKEN` 값, 전체 공유 토큰, Notion 응답 본문 미포함.
    - 검증 방법: `npm run test -- lib/notion/invoices`. 실제 Notion 샘플(`T_OK3`와 동일 데이터)로 임시 스크립트 1회 실행해 모킹과 실응답의 차이가 없는지 확인.
    - 완료 조건: 단위 테스트 전부 통과 + 실 Notion 1회 실행 성공(실패 시 수정 후 재수행).
  - [ ] `1-6` 캐시·에러 변환·재시도·로그 — `getInvoiceByToken(token)`: `fetchInvoiceByToken`을 `unstable_cache`(60초, 태그 `invoice:{token}`)로 래핑해 웹/PDF가 공유, `null` 결과 캐시 정책 결정(A3), `RateLimited` 시 stale 우선 제공 검토(R1), POST 500/503 앱 레벨 재시도 1회 여부 결정(R11), Notion 오류(429/5xx/401/타임아웃/네트워크 차단/validation_error)를 `UpstreamError`로 변환(오류는 캐시하지 않음), 동일 토큰 동시 요청 병합, 로그는 토큰 해시 앞 8자+시각+결과코드만(A4 확정 전 `[가정]`). 임시 JSON 출력 페이지(`app/invoice/[token]/page.tsx`, 2-3에서 대체). 요구사항: FR-001, FR-005, FR-006, 6.2, 6.6, 11장, R1·R10·R11. 공수 M~L. 선행 `1-5`, `1-7`.
    - 테스트 케이스:
      - 에러 변환 단위 테스트(`lib/notion/errors.test.ts`, 입력 → 기대 결과):

        | 입력 | 기대 |
        |------|------|
        | `APIResponseError` rate_limited(429, `Retry-After: 2`) | `UpstreamError`(retryable) |
        | 500 internal_server_error / 503 service_unavailable | `UpstreamError`(재시도 정책에 따름) |
        | 401 unauthorized(잘못된 `NOTION_TOKEN`) | `UpstreamError`(로그에 설정 오류 표기, 사용자 메시지는 일반) |
        | 404 object_not_found(DB 미공유) | `UpstreamError`(NotFound 아님) |
        | 400 validation_error(속성명 불일치) | `UpstreamError` |
        | 네트워크 차단(ECONNREFUSED/fetch failed), 타임아웃 | `UpstreamError` |
        | 정상 응답 결과 0건 | `null` |

      - 앱 재시도(채택 시): 500 → 200이면 성공(호출 수 +1), 500 → 500이면 `UpstreamError`(총 2회), 429는 SDK 재시도 설정 내에서만.
      - 보안 단위: 로그 캡처 결과가 `^[0-9a-f]{8} ` 형식이고 전체 토큰·`NOTION_TOKEN`·견적서 본문 문자열을 포함하지 않음. `UpstreamError.message`에 Notion 응답 본문·스택 없음.
      - 캐시(Playwright MCP + 목 서버 `GET http://localhost:4010/__stats`의 호출 카운터, 개발 서버는 `npm run build && npm run start`에서도 1회 재확인): `T_OK3` 첫 요청 → Notion 호출 2회. 60초 내 재요청 → 카운터 불변(캐시 히트). 61초 이후 재요청 → 카운터 +2. 에러 응답(`T_5XX`)은 캐시되지 않아 `T_FLAKY`에서 첫 요청 오류 후 즉시 재요청이 성공. `null` 결과 캐시 동작(A3 결정대로) 확인. 서로 다른 토큰은 캐시 공유 없음.
      - 동시성: `T_OK3`로 10개 동시 요청(`curl` 병렬) → Notion 호출 수가 병합되어 견적서 1+품목 1 수준(결정한 정책대로).
    - 검증 방법: `npm run test -- lib/notion`. Playwright MCP — `NOTION_API_BASE_URL=http://localhost:4010` 개발 서버에서 `browser_navigate`로 `http://localhost:3000/invoice/<T_OK3>`(임시 JSON) → `browser_snapshot`에서 품목 3건, `T_120`에서 품목 120건·순서, `T_DRAFT`/`T_UNKNOWN`/`abc`(비UUID)에서 동일한 임시 not-found 응답(`browser_network_requests`로 Notion 호출 0회 확인은 `/__stats`), `T_429`/`T_5XX`에서 오류 응답과 `browser_console_messages`·응답 본문에 스택·토큰 없음.
    - 완료 조건: 단위 + Playwright 시나리오 전부 통과, A3·R11 결정이 코드 주석과 PRD에 기록됨(실패 시 수정 후 재수행).
  - [ ] `1-7` 목 Notion 서버(테스트 하네스, 신규) — `scripts/mock-notion-server.ts`(Node `http`, 포트 4010): `POST /v1/data_sources/{id}/query`를 `ShareToken` 필터값(`T_*` 토큰)에 따라 4.0장 시나리오로 응답(정상·품목 100건 초과 페이지네이션·필수 속성 누락·429+`Retry-After`·500·지연 3초·첫 1회만 500), `GET /__stats`(호출 카운터), `POST /__reset`. `npm run mock:notion`, `npm run dev:mock` 스크립트. 산출물: `scripts/mock-notion-server.ts`, `tests/fixtures/*`. 요구사항: FR-006, 6.6, R1·R11(테스트 지원). 공수 M. 선행 `0-3`(응답 형태·`baseUrl` 확인), `1-3`.
    - 테스트 케이스(`curl`로 목 서버 자체 스모크):
      - 정상: `T_OK3` 쿼리 → 200, 견적서 1건/품목 3건. `T_120` 품목 쿼리 → 첫 응답 100건+`has_more:true`+`next_cursor`, 2회째 20건+`has_more:false`.
      - 경계: `T_EMPTY` → 품목 `results: []`. `page_size` 존중.
      - 오류: `T_429` → 429+`Retry-After`, `T_5XX` → 500, `T_SLOW` → 약 3초 후 200, `T_FLAKY` → 1회째 500, 2회째 200, `T_BROKEN` → 필수 속성 null 응답.
      - 보안: 서버가 `127.0.0.1`에만 바인딩, 실제 토큰·실데이터 미포함.
      - 호환: 실제 SDK(`Client({ baseUrl })`)로 1-5 단위 테스트와 다른 방식인 실 HTTP 호출이 성공하는지 확인.
    - 검증 방법: `curl` 위 케이스 + `/__stats` 카운터 확인. 이후 1-6 Playwright 시나리오의 전제 조건이 된다.
    - 완료 조건: 모든 시나리오가 기대 응답(실패 시 수정 후 재수행).
- **리스크**: Next 15에서 `unstable_cache`와 태그 동작(PRD 9.4-5 `[가정]`) 불일치 가능, 속성 ID/이름 상충으로 인한 쿼리 실패, 목 서버와 실제 Notion 응답 형태 차이(→ `0-3`에서 캡처한 실응답으로 fixture 작성, 1-5에서 실 Notion 1회 대조).

### Phase 2: 웹 뷰어 (5~6일)

- **목표**: 클라이언트가 링크 하나로 반응형·다크모드 견적서를 열람하고, 오류/로딩/빈 상태가 PRD대로 표시된다.
- **완료 기준(DoD)**: 샘플 3건(발행/초안/만료)과 목 시나리오의 기대 화면 확인 / 360·768·1280px 가로 스크롤 없음, 라이트·다크 모두 정상 / 404가 미발행·불일치·삭제·비UUID에서 동일 / Notion 오류 시 error 화면(스택·토큰 비노출) / noindex 헤더·메타 / **Phase 2 모든 Playwright MCP 시나리오 통과 + lint·typecheck·test·build 통과** / 임시 JSON 페이지 삭제.
- **Task 목록**
  - [ ] `2-1` UI 기반 준비 — `npx shadcn@latest add table skeleton`(생성 파일의 `import { cn } from "cn"`을 `@/lib/utils`로 수정, CLAUDE.md 주의사항), `config/site.ts` 내비게이션/브랜딩 갱신(Q8, 단일 출처 유지), 홈 `app/page.tsx`에 Notion 템플릿 사용 안내 보강(목록 기능은 만들지 않음). 산출물: `components/ui/table.tsx`, `components/ui/skeleton.tsx`, `config/site.ts`, `app/page.tsx`. 요구사항: 8.1, 8.4. 공수 S. 선행 `0-6`(Q8은 임시 값으로 진행 가능).
    - 테스트 케이스:
      - 정상: `grep 'from "cn"' components/ui` 0건, `npm run lint`/`typecheck`/`build` 통과. 홈에 서비스명·3단계 안내·Notion 템플릿 안내 표시.
      - 경계(뷰포트·테마): 홈을 360/768/1280px에서 가로 스크롤 없음, 다크모드 전환 후 텍스트·배경 대비 정상.
      - 오류: 존재하지 않는 경로 `/nope` → Next 기본 404 정상 표시(헤더/푸터 유지).
    - 검증 방법: Playwright MCP — `browser_navigate` `http://localhost:3000/`, `browser_snapshot`(내비·안내 문구), `browser_resize` 360/768/1280 후 `browser_evaluate`로 가로 스크롤 판정, 테마 토글 `browser_click` 후 `browser_take_screenshot`, `browser_console_messages` error 0건.
    - 완료 조건: 위 검증 통과.
  - [ ] `2-2` 견적서 뷰 컴포넌트 — `components/invoice/invoice-view.tsx`(번호·상태 배지·발행일/유효기간, 공급자/클라이언트 카드, 합계 블록, 비고), `invoice-items-table.tsx`(데스크톱 `<table>`+`<th scope>`, <640px 행 카드 전환, 품목 0건 시 "등록된 품목이 없습니다."), `download-button.tsx`(`<a href="…/pdf" download>`+`buttonVariants()`, `asChild` 금지). 계산·포맷은 `lib/invoice` 사용. **클라이언트로 넘기는 props에 Notion 페이지 ID(`Invoice.id`)·공유 토큰을 불필요하게 포함하지 않는다.** 요구사항: FR-002, FR-006(빈 상태), FR-007, FR-010, 6.3. 공수 M. 선행 `1-2`, `2-1`.
    - 테스트 케이스(임시 JSON 페이지를 뷰로 교체하기 전이므로 2-3과 함께, 목 서버 `T_*` 사용):
      - 정상(`T_OK3`): 번호·발행일·유효기간·공급자/클라이언트·품목 3행·공급가액/부가세/합계가 **1-2의 수기값**과 일치. 수량×단가=금액 각 행 표시.
      - 경계: `T_EMPTY` → "등록된 품목이 없습니다." 표시, 합계 0원. `T_50`(50행) 렌더 정상·성능 저하 없음. 긴 품목명(100자)·긴 비고 줄바꿈으로 레이아웃 깨짐 없음. `Description`/`ClientContact`/`Note` 없음 → 해당 영역 생략(빈 라벨 없음).
      - 뷰포트: 360px — 공급자/클라이언트 세로 배치, 품목은 행 카드, 가로 스크롤 없음. 768px/1280px — `<table>`과 `th scope` 존재.
      - 다크모드: 모든 텍스트 대비 4.5:1 이상(`browser_evaluate`로 주요 텍스트 색 대비 계산), 배지·카드 경계 식별 가능.
      - 접근성: `browser_snapshot`에서 table/columnheader 롤 확인, `browser_press_key` Tab으로 다운로드 버튼에 포커스 도달·포커스 링 표시, 모바일 카드와 표가 스크린리더에서 중복 읽히지 않음(`hidden` 분기 확인).
      - 보안: 렌더된 HTML/RSC 페이로드(`browser_evaluate`로 `document.documentElement.outerHTML` 및 `fetch`한 본문 검색)에 Notion 페이지 ID·`NOTION_TOKEN` 미포함.
    - 검증 방법: Playwright MCP — `http://localhost:3000/invoice/<T_OK3|T_EMPTY|T_50>`을 3뷰포트×라이트/다크로 `browser_navigate`·`browser_snapshot`·`browser_take_screenshot`, 위 `browser_evaluate` 검사, `browser_console_messages` error 0건. 순수 포맷 로직은 `npm run test -- lib/invoice`.
    - 완료 조건: 위 시나리오 전부 통과(실패 시 수정 후 재수행).
  - [ ] `2-3` 견적서 페이지 — `app/invoice/[token]/page.tsx`(Server Component: `getInvoiceByToken` → 없으면 `notFound()` → `InvoiceView`), `generateMetadata`(제목에 견적번호, `robots: { index: false, follow: false }`; 404/오류에서는 견적번호 비노출). 1-6의 임시 JSON 페이지를 대체. 요구사항: FR-001, FR-002, FR-005, FR-013. 공수 M. 선행 `1-6`, `2-2`.
    - 테스트 케이스:
      - 정상: 실제 Notion 샘플 `발행` 토큰과 `T_OK3`에서 FR-002 필드 전부 표시, `<title>`에 견적번호, `<meta name="robots" content="noindex, nofollow">`.
      - 경계: `T_EXPIRED` → 열람 가능(만료 배지는 4-3). `T_120`(100건 초과) → 품목 120건 모두 표시(50행 상한 초과 처리 정책 A1 확인).
      - 오류: `T_BROKEN` → error 경계(2-4)로 분기, 사용자에게 속성명·스택 미노출.
      - 데이터 일치: 실 Notion 샘플의 값과 화면 값이 동일(수기 대조).
      - 보안: 응답 메타·본문에 Notion 페이지 ID 없음, `T_DRAFT`와 `T_UNKNOWN`의 문서 응답이 구분 불가(2-4에서 상세).
    - 검증 방법: Playwright MCP — `browser_navigate` `http://localhost:3000/invoice/<token>`, `browser_snapshot`, `browser_evaluate`로 `document.title`/robots 메타 확인, `browser_network_requests`로 문서 요청 상태 확인.
    - 완료 조건: 위 시나리오 통과, 임시 JSON 페이지 제거 확인.
  - [ ] `2-4` 상태 화면 — `loading.tsx`(스켈레톤), `not-found.tsx`("견적서를 찾을 수 없습니다. 링크를 다시 확인해 주세요."), `error.tsx`(Client Component, "다시 시도" 버튼, 스택/토큰 비노출). `UpstreamError`는 error 경계로, `null`은 404로 분기. `loading.tsx` 스트리밍 시 404 HTTP 상태가 200이 되는지 확인(A9). 요구사항: FR-005, FR-006, FR-009. 공수 S. 선행 `2-3`.
    - 테스트 케이스:
      - 404 동일성: `T_DRAFT`, `T_ARCHIVED`, `T_UNKNOWN`, 비UUID(`abc`), 빈 토큰 유사 경로, `../` 포함 경로 → 모두 **동일 문구·동일 DOM 구조·동일 상태 코드**(A9 결과 기록). 응답 본문에 "초안/발행/보관" 등 상태 문구 없음. 비UUID는 `/__stats`로 Notion 호출 0회 확인.
      - 오류: `T_429`/`T_5XX` → error 화면 "일시적으로 불러올 수 없습니다. 잠시 후 다시 시도해 주세요." + [다시 시도]. `NOTION_TOKEN`을 비우거나 틀리게 하여 401 재현 시에도 같은 화면(설정 오류 구분 없음). 본문·콘솔·`browser_snapshot`에 스택, 토큰, Notion 오류 메시지 없음.
      - 복구: `T_FLAKY`에서 오류 화면 → [다시 시도] `browser_click` → 정상 본문으로 교체.
      - 로딩: `T_SLOW`(3초) — 홈에서 링크 클릭 또는 `browser_navigate` 직후 `browser_snapshot`에 스켈레톤 노출 → `browser_wait_for`로 본문 텍스트 등장 후 스켈레톤 사라짐(FR-009). 로딩 화면도 360/1280px에서 레이아웃 정상·다크모드 정상.
      - 뷰포트/테마: 404·오류 화면을 360/768/1280px, 라이트/다크에서 확인(가로 스크롤 없음, 대비 AA).
    - 검증 방법: Playwright MCP — 위 URL에 `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_wait_for`, `browser_resize`, `browser_console_messages`, `browser_network_requests`.
    - 완료 조건: 위 시나리오 통과. A9(404가 200으로 나갈 경우) 결과를 PRD/7장에 기록하고 사용자 확인.
  - [ ] `2-5` 인쇄 스타일·보안 헤더 (P1) — 인쇄 시 헤더/푸터/다운로드 버튼 숨김(`print:hidden`, `components/layout/*` 수정 포함), `next.config.ts`의 `/invoice/:path*` 헤더(`X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, `Cache-Control: private` `[가정]`). 요구사항: FR-011, FR-013, 6.2. 공수 S. 선행 `2-3`.
    - 테스트 케이스:
      - 정상: `/invoice/<T_OK3>`와 `/pdf`(3-3 이후) 응답에 3개 헤더 존재. 인쇄 미리보기에서 헤더·푸터·다운로드 버튼 미표시, 본문 표시.
      - 경계: 404/오류 응답에도 `X-Robots-Tag`, `Referrer-Policy` 적용. 홈(`/`)에는 `noindex` 미적용(견적서 경로에만).
      - 보안: `Cache-Control`에 `public`/`s-maxage`가 없음(A2).
      - 인쇄 상태에서 다크모드여도 흰 배경/검은 글씨로 출력.
    - 검증 방법: `curl -sI http://localhost:3000/invoice/<T_OK3>` 헤더 확인. Playwright MCP — `browser_run_code`로 `page.emulateMedia({ media: "print" })` 후 `browser_snapshot`/`browser_take_screenshot`에서 3요소 비노출 확인(`[가정]`: MCP 버전에 `emulateMedia`·`browser_pdf_save` 지원 여부 확인, 미지원 시 `@media print` 규칙을 `browser_evaluate`로 CSSOM 검사), `browser_network_requests`에서 헤더 확인.
    - 완료 조건: 위 검증 통과.
- **리스크**: 모바일 카드 전환 시 접근성(표 시맨틱) 저하 → 데스크톱 table + 모바일 별도 마크업을 `hidden` 클래스로 분기하되 중복 읽기 확인. 헤더/푸터 인쇄 숨김이 전역 레이아웃을 건드림. `loading.tsx` 스트리밍과 404 상태 코드(A9).

### Phase 3: PDF (5~6일, Phase 2와 병렬 가능)

- **목표**: 한글이 깨지지 않는 PDF를 링크 한 번으로 다운로드하고, 웹과 금액·품목이 일치한다.
- **완료 기준(DoD)**: FR-003 헤더 충족 / 한글·특수문자 □ 0건 / 품목 20행 ≤ 5초(p95), 50행 분할 정상 / 웹과 총액·품목 수·날짜 불일치 0건 / 잘못된 토큰은 404 / **Phase 3 모든 단위·Playwright MCP 테스트 통과 + lint·typecheck·test·build 통과** / Phase 0 임시 스파이크 라우트 삭제.
- **Task 목록**
  - [ ] `3-1` 폰트 등록 모듈 — `lib/pdf/fonts.ts`(`Font.register`, `process.cwd()` 기준 절대 경로, 중복 등록 방지), `0-4` 결과의 폰트/서브셋 확정본 사용, OFL 고지. 요구사항: FR-004, 6.5, R2. 공수 S. 선행 `0-4`, `0-5`.
    - 테스트 케이스(Vitest, `Font.register` 모킹):
      - 정상: `registerFonts()` 호출 → Regular/Bold 두 굵기 등록, 등록 경로가 절대 경로이고 `fs.existsSync` true.
      - 경계: 연속 3회 호출해도 `Font.register`는 1회분만 호출(중복 방지). 동시 호출에서도 1회.
      - 오류: 폰트 파일이 없을 때 경로가 포함되지 않은 일반 메시지 + 서버 로그에 경로(로그 전용)로 실패, 요청 단위에서 `UpstreamError`가 아닌 PDF 오류로 취급.
      - 라이선스: OFL 고지 파일이 존재.
    - 검증 방법: `npm run test -- lib/pdf/fonts`. 로컬·Vercel 프리뷰 로드 성공은 3-3에서 Playwright로 재확인.
    - 완료 조건: 단위 테스트 통과(실패 시 수정 후 재수행).
  - [ ] `3-2` PDF 문서 컴포넌트 — `lib/pdf/invoice-document.tsx`(A4, 헤더/당사자/품목표/합계/비고, 긴 품목명 줄바꿈, 페이지 분할 시 표 헤더 반복, 만료 견적서는 헤더에 "만료" 문구 표시 — A6 확정). 합계는 웹과 동일한 `calculateTotals()`, 포맷은 `lib/invoice/format.ts` 재사용(로직 복사 금지). 요구사항: FR-004, FR-007, FR-008, R5. 공수 L. 선행 `1-2`, `3-1`.
    - 테스트 케이스(Vitest에서 `renderToBuffer` 스모크 + PDF 텍스트 추출 `[가정]`: A11 devDependency, 미도입 시 `Read` 육안 체크리스트로 대체):
      - 정상: `T_OK3` 데이터 → Buffer가 `%PDF-`로 시작, 크기 > 0, 1페이지. 추출 텍스트에 `Q-…` 번호, `220,000원` 등 수기 기대값 포함(1-2 표 #1·#2·#9 입력으로 총액 일치).
      - 경계: 품목 0건("등록된 품목이 없습니다." 표시), 1건, 20건(렌더 ≤ 5초), 50건(2페이지 이상, 표 헤더 반복), 51건(상한 초과 시 거부하지 않고 정상 렌더+서버 경고 로그, A1 `[가정]`), 수량 0 품목.
      - 데이터 이상: 품목명 200자 한 줄, 공백 없는 긴 한글, `Description`/`Note`/`ClientContact` 없음, 줄바꿈 포함 텍스트, `<`·`&`·`"` 포함, 이모지 포함(렌더가 throw하지 않음, 0-4 결과대로 처리).
      - 한글/특수문자: `㈜한빛`, `₩1,000`, `①`, 중점, `~` 가 □ 없이 출력(`Read`로 PDF 페이지 이미지 육안, 체크리스트 기록).
      - 일치: 같은 입력으로 `calculateTotals`를 직접 호출한 값 == PDF 텍스트의 공급가액/부가세/총액(FR-008 자동 검증 1차).
      - 보안: PDF 메타데이터(Title/Author/Producer)에 Notion 페이지 ID·토큰·내부 경로 미포함.
    - 검증 방법: `npm run test -- lib/pdf`; 20/50건 문서를 임시 스크립트로 파일 저장 후 `Read`(pages 지정)로 육안 확인(Playwright 화면은 3-3에서).
    - 완료 조건: 자동 테스트 통과 + 육안 체크리스트 □ 0건(실패 시 수정 후 재수행).
  - [ ] `3-3` PDF Route Handler — `app/invoice/[token]/pdf/route.ts`(`runtime = "nodejs"`, `maxDuration` `[가정]`, `getInvoiceByToken` 공용 → `null`이면 404, `UpstreamError`면 503+`Retry-After`, 성공 시 `renderToBuffer`). 헤더: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="…"; filename*=UTF-8''…`(A7, RFC 5987, 견적번호는 헤더용으로 sanitize), `X-Robots-Tag: noindex`, `Cache-Control: private`. 요구사항: FR-003, FR-005, FR-006, 6.2. 공수 M. 선행 `1-6`, `3-2`.
    - 테스트 케이스:
      - 정상(`T_OK3`, 실제 Notion 발행 샘플): 200, `Content-Type: application/pdf`, `Content-Disposition`에 `attachment`와 `filename*=UTF-8''%EA%B2%AC%EC%A0%81%EC%84%9C-Q-…pdf`, `X-Robots-Tag: noindex`, `Cache-Control: private`, 본문 `%PDF-`.
      - 파일명 sanitize 단위 표(`buildContentDisposition`, Vitest): 번호 `Q-2026-0042` → 정상 / `Q-2026-0042\r\nX-Evil: 1` → 개행 제거(헤더 인젝션 없음) / `a"b` → 따옴표 이스케이프·제거 / `../x` → 경로 구분자 제거 / 200자 번호 → 길이 제한 / 한글+공백 → `filename*` 퍼센트 인코딩 / 빈 번호 → 기본값 `견적서.pdf`.
      - 경계: `T_EMPTY`(품목 0건) 200+PDF, `T_50` 응답 ≤ 5초, `T_120`(상한 초과 정책 A1), 같은 토큰 연속 요청 시 Notion 호출이 캐시로 줄어듦(`/__stats`, 웹 뷰와 캐시 공유).
      - 오류: `T_DRAFT`/`T_UNKNOWN`/비UUID → **동일한 404**(본문·헤더 동일, `Content-Type`이 `application/pdf` 아님, `Content-Disposition` 없음). `T_429`/`T_5XX` → 503 + 일반 메시지, `Retry-After`. `T_BROKEN` → 503 또는 일반 오류. `POST /pdf` → 405. 쿼리스트링(`?a=1`) 무시.
      - 보안: 오류 본문에 스택·`NOTION_TOKEN`·Notion 본문·폰트 경로 없음, 404가 토큰 존재 여부를 노출하지 않음(응답 시간 차이 과도하지 않음 `[가정]`).
      - 성능: 20행 PDF 10회 측정 p95 ≤ 5초(로컬 기준, 최종 측정은 4-2).
    - 검증 방법: Playwright MCP — `browser_navigate` `http://localhost:3000/invoice/<T_OK3>/pdf`(다운로드 이벤트와 파일명 확인), `browser_network_requests`로 상태·헤더·소요 시간, 오류 URL들에서 상태·본문 확인, `browser_console_messages`. 헤더 원문은 `curl -sI`로 보강, 저장 PDF는 `Read`로 열어 한글 확인. 파일명 sanitize·헤더 빌더는 `npm run test -- app/invoice`(또는 `lib/pdf/headers`).
    - 완료 조건: 위 케이스 전부 통과. 실패 시 수정 후 재수행.
  - [ ] `3-4` 다운로드 연결 — `download-button.tsx`를 `/invoice/[token]/pdf`에 연결, 스파이크 라우트(`app/spike/pdf`) 삭제. 요구사항: FR-003. 공수 S. 선행 `2-2`, `3-3`.
    - 테스트 케이스:
      - 정상: 웹에서 버튼 클릭 → PDF 저장, 파일명 `견적서-{번호}.pdf`.
      - 경계: 360px 모바일 뷰포트에서 버튼이 보이고 탭 영역(≥ 44px) 확보, 키보드 Enter로 다운로드, 다크모드에서 버튼 대비 AA.
      - 오류: PDF 요청이 503일 때 사용자가 무반응 상태로 방치되지 않음(브라우저의 다운로드 실패 표시 허용 `[가정]`, 결정 기록).
      - 정리: `/spike/pdf` → 404, 저장소에 스파이크 파일 없음(`git ls-files`).
    - 검증 방법: Playwright MCP — `http://localhost:3000/invoice/<T_OK3>`에서 `browser_snapshot`으로 버튼 ref 획득 → `browser_click` → 다운로드 이벤트, `browser_press_key` Enter, 3뷰포트·다크모드, `browser_network_requests`에서 `/pdf` 요청 200.
    - 완료 조건: 위 검증 통과.
- **리스크**: react-pdf 렌더링 시간·메모리(512MB `[가정]`) 한도, 웹/PDF 레이아웃 이원화(R5), PDF 텍스트 추출 도구 도입 여부(A11). 완화: 품목 상한 50행, 공용 계산 함수, 4-1 대조 검증.

### Phase 4: 품질·보안·성능 및 P1 마감 (3일)

- **목표**: 비기능 요구사항과 성공 지표를 실측으로 확인하고 P1 기능을 마감한다.
- **완료 기준(DoD)**: 2.2 지표 충족(또는 사유 기록) / 클라이언트 번들에 `NOTION_TOKEN`·Notion SDK 미포함 / 로그에 전체 토큰·본문 미기록 / FR-008 불일치 0건 / **Phase 4 모든 테스트 통과 + lint·typecheck·test·build 통과**.
- **Task 목록**
  - [ ] `4-1` 웹/PDF 일치 검증 — 샘플 3건(0건·30건 포함)의 총액·품목 수·날짜를 대조하는 자동 테스트와 체크리스트. 산출물: `lib/invoice/*.test.ts` 또는 `tests/consistency.test.ts`, `docs/` 체크리스트(작성 시). 요구사항: FR-008, R5. 공수 S. 선행 `3-4`.
    - 테스트 케이스(대조 표 — 각 행마다 웹 값 = PDF 값 = `calculateTotals` 기대값):

      | 샘플 | 품목 수 | 확인 항목 |
      |------|---------|-----------|
      | `T_OK3`(실 Notion 발행) | 3 | 총액, 공급가액, 부가세, 발행일, 유효기간, 번호 |
      | `T_EMPTY` | 0 | 0원 합계, 빈 상태 문구 |
      | `T_30`(실 Notion 30건) | 30 | 총액, 품목 수, 마지막 품목 |
      | `T_50` | 50 | 총액, 2페이지 이상, 품목 수 |
      | `T_EXPIRED` | 3 | 금액 동일(만료는 A6 따름) |

      - 자동: 동일 fixture로 `InvoiceView`(`renderToStaticMarkup`)의 합계 문자열과 PDF 추출 텍스트의 합계 문자열이 일치.
      - 화면: 같은 토큰을 웹 `browser_snapshot`으로 읽은 총액과 다운로드 PDF(`Read`)의 총액을 수기 대조.
      - 이상: 품목명에 특수문자·긴 텍스트가 있어도 웹과 PDF 품목 수가 같음.
    - 검증 방법: `npm run test -- consistency` + Playwright MCP로 5개 URL의 웹/PDF 대조.
    - 완료 조건: 불일치 0건(실패 시 원인 수정 후 전체 재대조).
  - [ ] `4-2` 성능 측정 — Lighthouse(모바일 4G) LCP 캐시 히트 ≤ 2.0s, 캐시 미스 TTFB p95 ≤ 2.5s, PDF 20행 p95 ≤ 5s. 초과 시 캐시/폰트 서브셋 조정. `npm run build && npm run start`(프로덕션 모드)와 프리뷰 배포에서 측정. 요구사항: 2.2, 6.1, R1·R3. 공수 M. 선행 `2-4`, `3-4`.
    - 테스트 케이스:
      - 정상: 캐시 히트 LCP(Lighthouse CLI `npx lighthouse --form-factor=mobile` 3회 중앙값), PDF 20행 20회 응답 p95.
      - 경계: 품목 50행 견적서 LCP·PDF 시간, 콜드스타트 첫 PDF 요청.
      - 오류: Notion 지연(`T_SLOW` 3초) 시 TTFB 영향과 스켈레톤 표시 시점 기록(캐시 미스 TTFB 판정은 실제 Notion 대상으로 별도 측정).
      - 캐시 효과: 연속 요청 시 Notion 호출 0회(`/__stats`).
    - 검증 방법: Playwright MCP `browser_evaluate`(PerformanceObserver로 LCP 근사, `performance.getEntriesByType('navigation')`로 TTFB), `curl -w '%{time_starttransfer} %{time_total}\n'` 반복 측정, Lighthouse CLI 공식 수치. 측정값 표를 PRD/PR에 기록.
    - 완료 조건: 지표 충족 또는 사유·대책 기록(미달 시 조정 후 재측정).
  - [ ] `4-3` 만료 배지 (P1) — `ValidUntil < 오늘`이면 웹 헤더에 "만료" 배지(열람/다운로드 허용), KST 기준 판정. `components/invoice/invoice-view.tsx`, `lib/invoice/format.ts`. PDF 만료 표시는 3-2에서 처리(A6 확정). 요구사항: FR-012. 공수 S. 선행 `2-2`.
    - 테스트 케이스:
      - 정상: `T_EXPIRED` → "만료" 배지 표시, PDF 다운로드 링크 정상. 유효 샘플 → 배지 없음.
      - 경계(1-2 `isExpired` 표 재사용): 유효기간 당일 → 미표시, 다음 날 00:00 KST → 표시. 서버 시간대가 UTC인 Vercel에서도 동일(프리뷰 배포에서 재확인).
      - 오류/데이터 이상: `ValidUntil` null(`T_BROKEN`) → 배지 로직이 아닌 매퍼 오류 경로.
      - 화면: 360/1280px·다크모드에서 배지가 상태 배지와 겹치지 않음, 색 대비 AA.
      - 캐시: 60초 캐시 때문에 자정 직후 배지 상태가 최대 60초 지연될 수 있음을 문서화(웹 `isExpired`는 렌더 시점 기준).
    - 검증 방법: `npm run test -- lib/invoice`, Playwright MCP — `http://localhost:3000/invoice/<T_EXPIRED|T_OK3>` `browser_snapshot`/`browser_take_screenshot`(3뷰포트, 라이트/다크).
    - 완료 조건: 위 케이스 통과.
  - [ ] `4-4` 보안·접근성 점검 — 빌드 산출물(`.next/static`)에서 `NOTION_TOKEN`·`@notionhq` 검색, `NEXT_PUBLIC_` 접두사 오남용 점검, 로그 포맷 확인, `npm audit`, 품목표 시맨틱·키보드 접근·색 대비 확인, 브라우저 매트릭스(Chrome/Edge/Firefox/iOS Safari 16+) 점검. 요구사항: 6.2, 6.3, 6.4, 11장. 공수 M. 선행 `2-5`, `3-4`.
    - 테스트 케이스:
      - 보안: `npm run build` 후 `grep -r "NOTION_TOKEN\|@notionhq\|secret_\|ntn_" .next/static` 0건. `grep -r "NEXT_PUBLIC_" .` 결과가 `NEXT_PUBLIC_SITE_URL`만. 견적서 HTML/RSC 응답에 Notion 페이지 ID·내부 필드 없음(`browser_evaluate`로 `fetch` 본문 검사). 오류 화면 6종(404, 429, 5xx, 401, 타임아웃, 속성 누락)에서 스택·토큰·Notion 본문 없음. 서버 로그에 전체 토큰·본문 없음(A4 결정대로). `npm audit` high 이상 0건 또는 사유 기록.
      - 접근성: 품목표 `columnheader`/`th scope="col"`, 키보드 Tab 순서(헤더 → 다운로드 버튼 → …), 포커스 표시, 라이트/다크 모든 텍스트 대비 AA, 확대 200% 시 가로 스크롤 없음.
      - 브라우저: Chrome·Edge(Playwright MCP), Firefox(Playwright MCP 지원 시, 아니면 수동), iOS Safari 16+는 5-2 실기기. 결과를 체크리스트에 기록.
      - 경계: 쿠키·로컬스토리지에 견적서 데이터 저장 없음(`browser_evaluate`).
    - 검증 방법: Bash grep/audit + Playwright MCP 위 시나리오, 체크리스트 전 항목 통과, 발견 이슈는 Task로 등록.
    - 완료 조건: 체크리스트 전 항목 통과(발견 이슈 수정 후 해당 항목 재점검).
- **리스크**: 성능 지표 미달 시 재작업(예비일 사용). Playwright MCP로 Firefox/Safari 확인이 어려울 수 있음(→ 5-2 실기기).

### Phase 5: 배포 및 문서 (2~3일)

- **목표**: 프로덕션에서 MVP 완료 기준(PRD 2.3)을 모두 충족한다.
- **완료 기준(DoD)**: PRD 2.3 체크리스트 전부 통과 / README로 신규 공급자가 Notion 설정부터 링크 발행까지 수행 가능 / **Phase 5 모든 테스트 통과 + lint·typecheck·test·build 통과**.
- **Task 목록**
  - [ ] `5-1` 프로덕션 배포 — Vercel 프로젝트 연결, 환경변수(`NOTION_TOKEN`, 두 data source ID, `SUPPLIER_*`, `NEXT_PUBLIC_SITE_URL`; `NOTION_API_BASE_URL`은 **등록 금지**) 등록(Production/Preview), `maxDuration`/`outputFileTracingIncludes` 최종 확인. 요구사항: PRD 2.3, R3, Q2. 공수 S. 선행 `4-2`, `4-4`.
    - 테스트 케이스:
      - 정상: 프로덕션 URL에서 실제 견적서 열람, PDF 다운로드 성공, 한글 정상.
      - 오류: 프로덕션에서 잘못된 토큰/초안 → 404 화면, 보안 헤더 3종 확인.
      - 보안: 프로덕션 응답·클라이언트 번들에 `NOTION_TOKEN` 값 미포함, 프로덕션에서 `NOTION_API_BASE_URL`이 설정돼 있어도 무시되는지(설정하지 않는 것이 원칙) 확인.
      - 경계: 환경변수 하나(`SUPPLIER_NAME`) 누락 시 `ConfigError` → 일반 오류 화면(Preview에서만 확인).
    - 검증 방법: Playwright MCP — 프로덕션 URL `browser_navigate`, `browser_snapshot`, 다운로드, `browser_network_requests`(헤더), `browser_console_messages`; `curl -sI`.
    - 완료 조건: 위 검증 통과(실패 시 설정 수정 후 재배포·재검증).
  - [ ] `5-2` 실환경 검수 — 실제 Notion 데이터로 완료 기준 전부 확인, iOS Safari·Android Chrome 실기기 열람/PDF, 404/미발행/Notion 장애(토큰 무효화) 화면, Notion 수정 후 60초 내 반영 확인, 한글 깨짐 0건 체크리스트. 요구사항: FR-001~010 종합, Q7. 공수 M. 선행 `5-1`.
    - 테스트 케이스:
      - 정상: 실제 견적서 1건 이상 링크 열람 + PDF(PRD 2.3 항목 1·2).
      - 경계: Notion에서 품목 금액 수정 → 60초 이내 웹/PDF 반영(Q7), Status를 초안으로 변경 → 최대 60초 후 404, `ShareToken` 변경 → 기존 링크 404.
      - 오류: Integration 연결 해제/토큰 무효화 → error 화면, 복구 후 정상(PRD 2.3 항목 3).
      - 보안: 모바일에서 링크 접근 시 `noindex`·`no-referrer` 유지, 오류 화면에 내부 정보 없음.
      - 실기기: iOS Safari 16+(다운로드 동작, 한글 PDF 뷰), Android Chrome, 다크모드.
    - 검증 방법: Playwright MCP로 데스크톱 시나리오(`browser_navigate`, `browser_snapshot`, `browser_network_requests`) + 실기기 수동 체크리스트. PRD 2.3 체크박스 5개를 모두 체크.
    - 완료 조건: 체크리스트 전 항목 통과(실패 시 수정·재배포 후 재검수).
  - [ ] `5-3` 문서화 — `README.md`(서비스 소개, Notion DB 스키마·Integration 공유·data source ID 확인 절차, 환경변수, UUID 토큰 생성 가이드(Q4), 링크 발행/폐기, 알려진 제한: 반영 지연 60초·품목 50행·링크 유출 주의, 테스트 실행법: `npm run test`, `npm run dev:mock`), `CLAUDE.md` 아키텍처 섹션에 `lib/notion`·`lib/pdf`·`app/invoice` 구현과 "테스트 프레임워크 없음" 문구 갱신 반영, PRD 열린 질문 결정 기록. 요구사항: 4.1, 6.6, R6·R7, 11장. 공수 S. 선행 `5-2`(초안은 병행 가능).
    - 테스트 케이스:
      - 정상: 문서만 보고 제3자(또는 문서 전용 점검 시나리오)가 샘플 견적서를 발행해 링크로 열람.
      - 경계: README의 명령(`npm i`, `npm run dev`, `npm run test`, `npm run build`)이 새 클론에서 그대로 동작.
      - 오류: 문서 내 상대 링크·경로가 유효(링크 점검), `.env.example`과 README의 환경변수 목록 일치.
      - 보안: README·`.env.example`에 실제 토큰·ID 없음(`grep`).
    - 검증 방법: Bash로 명령 재현·링크 점검, Playwright MCP로 README에 적힌 Notion 설정 후 발행 링크를 열어 확인.
    - 완료 조건: 위 검증 통과.
- **리스크**: 프로덕션과 프리뷰의 환경변수 불일치, Notion 권한/공유 누락.

## 5. 요구사항 추적 매트릭스

| 요구사항 ID | 설명 | 담당 Phase/Task |
|-------------|------|-----------------|
| FR-001 (P0) | Notion 견적서·품목 조회 | 0-1, 0-3, 1-1, 1-4, 1-5, 1-6, 1-7, 2-3 |
| FR-002 (P0) | 웹 뷰어 | 2-2, 2-3 |
| FR-003 (P0) | PDF 다운로드 | 3-3, 3-4, 2-2 |
| FR-004 (P0) | 한글 PDF 렌더링 | 0-4, 3-1, 3-2 |
| FR-005 (P0) | 접근 제어(토큰+발행 상태, 동일 404) | 1-5, 1-6, 2-3, 2-4, 3-3 |
| FR-006 (P0) | 오류/빈 상태 | 1-4, 1-6, 1-7, 2-2(빈 상태), 2-4, 3-3 |
| FR-007 (P0) | 금액 계산 | 1-2, 1-3, 2-2, 3-2 |
| FR-008 (P0) | 웹/PDF 일치 | 1-2, 3-2, 4-1 |
| FR-009 (P0) | 로딩 스켈레톤 | 2-1, 2-4 |
| FR-010 (P0) | 반응형 + 다크모드 | 2-2, 2-4, 4-4 |
| FR-011 (P1) | 인쇄 스타일 | 2-5 |
| FR-012 (P1) | 만료 배지 | 1-2(판정 헬퍼), 4-3 |
| FR-013 (P1) | noindex | 2-3, 2-5, 3-3 |
| 6.1 성능 | LCP/TTFB/PDF 시간, 50행 상한 | 0-5, 4-2 |
| 6.2 보안 | 토큰 서버 전용, 128비트, 헤더 | 0-1, 1-5, 1-6, 2-5, 3-3, 4-4 |
| 6.3 접근성 | WCAG AA, 표 시맨틱 | 2-2, 4-4 |
| 6.4 브라우저 | 지원 매트릭스 | 4-4, 5-2 |
| 6.5 PDF 품질 | TTF, OFL, 서브셋 | 0-4, 3-1 |
| 6.6 캐싱 | 60초 캐시, 레이트리밋, 재시도, UUID 검증 | 0-3, 1-5, 1-6, 1-7, 5-2 |
| 7.3 금액 규칙 | 앱 계산, 원 미만 절사 | 1-2 |
| 11장 보안·개인정보 | 로그 최소화, 토큰 폐기, 의존성 | 1-6, 4-4, 5-3 |
| 2.3 MVP DoD | 완료 기준 5항목 | 5-1, 5-2 |
| R8 테스트 인프라 | Vitest, 목 서버 | 1-3, 1-7 |

모든 FR-001~013이 최소 하나의 Task에 매핑되어 있다(대조 완료).

## 6. 리스크 관리

| 리스크 | 영향도 | 가능성 | 완화책(Task) |
|--------|--------|--------|--------------|
| R1 Notion 레이트리밋/지연 | 높음 | 중 | 60초 캐시, 조회 2회 제한, stale 우선 제공(1-6), 429 시나리오 테스트(1-7) |
| R2 PDF 한글 폰트 깨짐/형식 미지원 | 높음 | 중 | Phase 0 스파이크, TTF 사용(0-4, 3-1), 육안 체크리스트(3-2) |
| R3 서버리스 번들 크기/타임아웃 | 높음 | 중 | 프리뷰 배포 스파이크, 서브셋, `maxDuration`, 50행 상한(0-5, 5-1) |
| R4 Notion SDK/API 변경, 속성명/ID 변경 | 중 | 중 | 설치 시 Context7 재확인, `lib/notion` 격리, `schema.ts` 상수화·스키마 검증 스크립트(0-3, 1-1) |
| R5 웹/PDF 레이아웃 이원화로 불일치 | 중 | 중 | 공용 계산·포맷, 자동·수동 대조(3-2, 4-1) |
| R6 링크 유출 | 높음 | 낮음 | 128비트 토큰, 상태 전환 즉시 차단, noindex, 공급자 안내(2-5, 5-3) |
| R7 공급자의 Notion 스키마 임의 변경 | 중 | 중 | 매퍼 검증+서버 로그, 템플릿 안내(1-4, 5-3) |
| R8 테스트 프레임워크 부재 | 중 | 중 | Vitest 도입(1-3), 목 Notion 서버(1-7) |
| R9 범위 확대 | 중 | 중 | 부록 A 비목표 고수, Post-MVP로 분리 |
| R10 품목 relation 25개 한도 | 높음 | 낮음(회피 설계) | 품목 DB를 `Invoice` 필터로 조회, 25개·100건 초과 테스트(0-1, 1-5, 1-7) |
| R11 POST 쿼리 500/503 미재시도 | 중 | 낮음 | 앱 레벨 재시도 1회 검토, stale 캐시, `T_FLAKY` 테스트(1-6) |
| R12 테스트 반영으로 일정 여유 감소 | 중 | 중 | Phase 2·3 병렬, 제외 순서(4-3 → 2-5 → 메타 태그) 적용, 테스트는 제외하지 않음 |
| R13 목 서버와 실제 Notion 응답 차이로 인한 오탐/미탐 | 중 | 중 | 0-3 실응답으로 fixture 작성, 1-5·5-2에서 실 Notion 대조 |
| R14 Next 15 `loading.tsx` 스트리밍 시 404 상태 코드가 200이 됨 | 중 | 중 | 2-4에서 실측, 문구·noindex로 충족하는지 확인(A9) |

## 7. 미결 사항 / 가정

PRD 14장 열린 질문과 `[가정]` 항목. Q1~Q9는 2026-11-17 확정되었다(상태 열 참조). A 항목은 "확정 시점"에 확인한다.

| # | 항목 | 결정 | 상태 | 영향 Task |
|---|------|------|------|-----------|
| Q1 | 링크 방식 | 별도 `ShareToken`(UUID v4) | 확정 | 0-1, 1-5 |
| Q2 | 배포 플랫폼 | Vercel (0-5 프리뷰 배포로 실측 검증) | 확정 | 0-5, 5-1 |
| Q3 | 공급자 정보 위치 | `config`/환경변수 고정값을 기본으로 하고, 견적서 행의 Supplier* 속성은 선택 입력(있으면 우선). PRD 7.1의 `SupplierName` 필수 → 선택으로 변경 | 확정 | 1-1, 1-4 |
| Q4 | 토큰 생성 | Notion 수동 입력 + README 가이드 제공 | 확정 | 0-1, 5-3 |
| Q5 | 테스트 전략 | Vitest(`calculateTotals`, `mapper`, UUID 검증) + Playwright MCP E2E(수동 수행). 본 로드맵에서는 에러 변환·폰트·헤더 sanitize 등 순수 로직 테스트까지 Vitest 범위를 확장 | 확정 | 1-3 |
| Q6 | 부가세/통화 | 기본 10%, 원 미만 절사, KRW 단일 통화 (세무 기준은 운영 전 재확인) | 확정 | 1-2 |
| Q7 | 반영 지연 | 최대 60초 허용(웹훅/재검증 API는 Post-MVP) | 확정 | 1-6, 5-2 |
| Q8 | 브랜딩(서비스명/로고/PDF 푸터) | 임시값("견적서 뷰어")으로 진행, 추후 `config/site.ts`에서 교체 | 임시 확정 | 2-1, 3-2 |
| Q9 | 폰트 | Noto Sans KR TTF 정적 Regular/Bold. 0-4 스파이크에서 문제 시 Pretendard로 교체 | 확정 | 0-4, 3-1 |
| A1 | 품목 상한 50행, PDF 메모리 ≤ 512MB. 50행 초과 시 동작(거부 vs 정상 렌더+경고)은 정상 렌더+경고로 가정 | 가정 | Phase 4 (4-2) | 2-3, 3-2, 4-2 |
| A2 | `Cache-Control: private` 또는 서버 캐시만 사용 | 가정 | Phase 2 (2-5) | 2-5, 3-3 |
| A3 | `unstable_cache`의 Next 15 동작, `null` 결과 캐시 여부 | 가정 | Phase 1 (1-6) | 1-6 |
| A4 | 접근 로그: 토큰 해시 앞 8자+시각+결과코드만 | **확정**(2026-11-17, PRD 가정대로) | Phase 1 (1-6) | 1-6, 4-4 |
| A5 | 열람→다운로드 전환율 ≥ 40% | MVP 범위에서는 측정 안 함(분석 도구 미도입) | MVP 이후 | — |
| A6 | 만료 견적서의 PDF에도 만료 표시 여부 | **확정**(2026-11-17): 표시함. PDF 헤더에 "만료" 문구 표기(열람·다운로드는 허용) | Phase 3 (3-2) | 3-2, 4-3 |
| A7 | 한글 파일명 처리 | `filename`+`filename*` 병기, 견적번호 sanitize | Phase 3 (3-3) | 3-3 |
| A8 | 동일 `ShareToken` 중복 행 처리(PRD 9.4는 `page_size: 1`이라 중복을 감지하지 못하고 비결정적) | **확정**(2026-11-17): PRD대로 `page_size: 1`, 중복 감지 안 함. README 가이드(5-3)에 "토큰은 UUID v4를 새로 생성, 행 복사 시 토큰 교체" 명시 | 1-5, 5-3 |
| A9 | `loading.tsx` 사용 시 `notFound()`의 HTTP 상태가 200이 될 수 있음(FR-005는 화면 표시만 요구) | **확정**(2026-11-17): 2-4에서 실측하여 200이면 문구·noindex·동일 응답으로 FR-005 충족으로 정리(스켈레톤 유지) | 2-4 |
| A10 | 테스트 전용 `NOTION_API_BASE_URL`(목 서버용) 도입. production에서는 무시, `.env.example`에는 주석으로만 기재 | **확정**(2026-11-17): 도입. `NODE_ENV !== "production"`일 때만 읽음 | 1-5, 1-7, 5-1 |
| A11 | PDF 텍스트 추출 검증용 devDependency(예: `pdfjs-dist`) 도입 여부 | **확정**(2026-11-17): 미도입, `Read` 육안 체크리스트로 대체(총액 자동 대조가 꼭 필요해지면 재검토) | 0-4, 3-2, 4-1 |

PRD 자체의 모호함/주의점:
- ~~성공 지표 6.1이 "8장의 지표"를 참조하나 8장은 화면 설계다.~~ 해결(2026-11-17): PRD 6.1을 "2.2장의 지표"로 수정했다.
- FR-003 수락 기준의 `filename="견적서-{번호}.pdf"`는 비ASCII를 포함하므로 RFC 5987 `filename*` 인코딩 병기가 필요하다(A7).
- ~~12장 마일스톤은 한글 폰트 검증을 3주차에 두었으나 R2는 1주차 스파이크를 요구하여 모순이다.~~ 해결(2026-11-17): PRD 12장에 1주차 스파이크(1-S)를 추가하고 작업 9를 본 구현으로 한정했다. 본 로드맵은 R2에 따라 Phase 0에 배치했다.
- FR-006의 "재시도 안내" 화면과 R11의 앱 레벨 재시도(최대 1회)는 별개이며, 후자는 도입 여부만 미정이다.
- PRD 14장 Q5는 "E2E는 Playwright MCP 수동 확인"으로 확정했으므로, 본 로드맵의 Playwright 시나리오는 CI 자동화가 아니라 개발자가 Task 완료 시 수행하는 수동 테스트다. 자동화(CI)는 Post-MVP.

## 8. 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-11-17 | **테스트 기준 반영 갱신**: 모든 구현 Task에 `테스트 케이스`(정상/경계/오류/데이터 이상/보안), `검증 방법`(Vitest 명령 + Playwright MCP 시나리오), `완료 조건`(구현→테스트→통과, 실패 시 수정 후 재테스트) 추가. 4.0 테스트 공통 규약(도구 배정, 고정 테스트 토큰, 뷰포트·다크모드 규칙) 신설. 1-2에 수기 기대값 표(10건), 1-5·1-6·1-7에 429/5xx/네트워크 차단/필수 속성 누락/100건 초과 페이지네이션/토큰 비노출 케이스 추가. 각 Phase DoD에 "해당 Phase 모든 테스트 통과 + lint/typecheck/test/build 통과" 명시. PRD v0.2 기준으로 갱신. **Task 추가·분할**: (1) 기존 `1-5`를 조회 함수(`1-5`)와 캐시·에러 변환·재시도·로그(`1-6`)로 분할 — 구현·테스트 범위가 M~L로 커서 0.5~2일 단위를 맞추기 위함. (2) `1-7` 목 Notion 서버 신설 — 429/5xx/타임아웃/100건 초과/속성 누락을 Playwright MCP로 재현하려면 실 Notion으로는 불가능. 이에 따라 2-3·3-3의 선행이 `1-6`으로, 크리티컬 패스에 1-6 추가, 1-2의 선행에 1-3 추가, 총 Task 27개 → 29개. 미결 A8~A11, 리스크 R12~R14 추가. Phase 1~4 공수 상향. A4·A6은 미확정 유지. 기존 확정(Q1~Q9, 0-6 `[x]`, Q3, 1-S 반영, 6.1 오기 해결 표기)과 이전 변경 이력은 유지. |
| 2026-11-17 | Task 0-6 완료 처리. PRD 12장의 폰트 검증 시점 모순을 PRD 수정(1주차 스파이크 1-S 추가)으로 해소. |
| 2026-11-17 | A4·A6·A8·A9·A10·A11 권장안대로 확정(7장 갱신): 접근 로그 최소 기록, 만료 PDF에 "만료" 표시, 토큰 중복 미감지(README 가이드), 404 상태 코드는 2-4 실측 후 문구·noindex로 충족 처리, `NOTION_API_BASE_URL` 도입(production 무시), `pdfjs-dist` 미도입. |
| 2026-11-17 | Q1~Q9 권장안대로 확정(7장 갱신). Q3은 공급자 정보를 `config`/환경변수 기본값 + 행별 선택 입력으로 결정하여 스키마·타입 영향 반영, Q8은 임시 확정. A6(만료 PDF 표시)·A4(접근 로그)는 미확정 유지. |
| 2026-11-17 | 템플릿 형식으로 전면 재작성. 현재 코드 상태 반영(`.env.example`, 홈, `config/site.ts` 기구현 확인), 번들/배포 스파이크(0-5)와 테스트 환경(1-3) 추가, 추적 매트릭스·리스크·미결 사항 정리. 기존 체크 상태는 전부 미착수였으므로 변경 없음. |
| 2026-11-14 | 최초 작성(`b50d13b`). |
