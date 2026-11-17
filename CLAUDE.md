# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project context

- PRD 문서 : @docs/PRD.md
- 개발 로드맵 : @docs/ROADMAP.md

## 명령어

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint (eslint.config.mjs)
```

테스트 프레임워크는 설정되어 있지 않다.

## 아키텍처

Next.js 15 App Router + React 19 + TypeScript(strict) + Tailwind CSS v4 스타터킷 기반의 Notion 연동 견적서 웹 뷰어(PRD: `docs/PRD.md`). 루트에 `src/` 없이 `app/`, `components/`, `lib/`, `config/`가 위치하며, 경로 별칭 `@/*`는 프로젝트 루트(`./*`)를 가리킨다.

- `app/layout.tsx`: 전체 페이지 골격. `ThemeProvider`(next-themes, `class` 속성 방식, 기본값 system) 안에 `SiteHeader` → `<main>` → `SiteFooter` 순으로 배치한다. 새 페이지는 `app/<route>/page.tsx`만 추가하면 헤더/푸터가 자동 적용된다.
- `config/site.ts`: 사이트 이름, 설명, 내비게이션의 단일 출처. 레이아웃 메타데이터(title template 포함)와 헤더/푸터가 이를 참조한다.
- `components/ui/`: shadcn/ui 컴포넌트. **Base UI(`@base-ui/react`) 기반의 `base-nova` 스타일**이며 Radix 기반이 아니므로 Radix 전용 API(`asChild` 등)를 가정하지 말 것.
- `components/layout/`: 사이트 헤더/푸터. `components/theme-provider.tsx`, `theme-toggle.tsx`: 다크모드 처리.
- `app/invoice/[token]`, `components/invoice`, `lib/notion`, `lib/invoice`, `lib/pdf`: PRD 9.1 배치안의 빈 골격(`.gitkeep`). 기능은 아직 미구현.
- `.env.example`: 필요한 환경 변수 목록(NOTION_TOKEN 등).
- `lib/utils.ts`: `cn()` 클래스 병합 유틸(clsx + tailwind-merge).
- 스타일은 `app/globals.css`의 CSS 변수(`cssVariables: true`, baseColor `neutral`)와 `tw-animate-css`로 구성되며, `tailwind.config` 파일은 없다(Tailwind v4).

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add <component>
```

주의: 추가 후 생성된 파일에 `import { cn } from "cn"`이 들어가면반드시 `import { cn } from "@/lib/utils"`로 바꿔야 한다.

## 컨벤션

- 응답, 코드 주석, 문서, 커밋 메시지는 한국어로 작성하고, 변수/함수명은 영어를 사용한다.
- 들여쓰기 2칸, Tailwind CSS 사용, TypeScript 사용.
- `.mcp.json`에 Playwright MCP 서버가 설정되어 있다.
