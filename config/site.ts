// 사이트 전역 설정: 이름/설명/내비게이션을 한 곳에서 관리
export const siteConfig = {
  name: "Next.js Starter",
  description:
    "Next.js 15, TypeScript, Tailwind CSS, shadcn/ui로 빠르게 시작하는 웹 스타터킷",
  githubUrl: "https://github.com/chiefcodingkim/claude-nextjs-starters",
  navItems: [
    { title: "홈", href: "/" },
    { title: "소개", href: "/about" },
  ],
} as const;
