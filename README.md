# 견적서 뷰어

Notion으로 작성한 견적서를 공유 링크로 확인하고 PDF로 다운로드하는 웹 서비스(MVP)입니다. 상세 요구사항은 `docs/PRD.md`를 참고하세요.

## 기술 스택

- Next.js 15 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI 기반, `base-nova` 스타일)
- lucide-react (아이콘), next-themes (다크 모드)

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |

## 폴더 구조

```
app/              라우트, 레이아웃, 전역 스타일
  invoice/[token] 견적서 뷰어 라우트 (예정)
components/
  invoice/        견적서 UI 컴포넌트 (예정)
  layout/         헤더, 푸터
  ui/             shadcn/ui 컴포넌트
config/site.ts    사이트 이름, 설명, 내비게이션 설정
lib/
  notion/         Notion API 연동 (예정)
  invoice/        견적서 도메인 로직 (예정)
  pdf/            PDF 생성 (예정)
  utils.ts        cn() 클래스 병합 유틸
```

## 환경 변수

`.env.example`을 참고하여 `.env.local`을 작성합니다. `.env*`는 gitignore되며 `.env.example`만 커밋됩니다.

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add table skeleton
```

> 주의: 컴포넌트 추가 후 `import { cn } from "cn"`이 생성되면 `"@/lib/utils"`로 바꿔 주세요.
