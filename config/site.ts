// 사이트 전역 설정: 이름/설명/내비게이션을 한 곳에서 관리
export const siteConfig = {
  name: "견적서 뷰어",
  description:
    "Notion으로 작성한 견적서를 공유 링크로 확인하고 PDF로 다운로드하는 웹 서비스",
  navItems: [{ title: "홈", href: "/" }],
} as const;
