# Next.js 스타터킷

Next.js 15, TypeScript, Tailwind CSS, shadcn/ui로 빠르게 웹 개발을 시작하기 위한 스타터킷입니다.

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI 기반, `base-nova` 스타일)
- lucide-react (아이콘)
- next-themes (다크 모드)

## 시작하기

```bash
npm install
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
components/
  layout/         헤더, 푸터
  ui/             shadcn/ui 컴포넌트
config/site.ts    사이트 이름, 설명, 내비게이션 설정
lib/utils.ts      cn() 클래스 병합 유틸
```

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add dialog
```

> 주의: 컴포넌트 추가 후 `import { cn } from "cn"`이 생성되면 `"@/lib/utils"`로 바꿔 주세요.
