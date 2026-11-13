import { siteConfig } from "@/config/site";

// 하단 푸터
export function SiteFooter() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js &
        shadcn/ui.
      </p>
    </footer>
  );
}
