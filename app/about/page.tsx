import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "소개",
};

const stack = [
  "Next.js 15 (App Router)",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui (Base UI)",
  "lucide-react",
  "next-themes",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">소개</h1>
      <p className="mt-3 text-muted-foreground">
        이 프로젝트는 새 웹 프로젝트를 바로 시작할 수 있도록 구성한 스타터킷입니다.
      </p>
      <Separator className="my-8" />
      <h2 className="text-xl font-semibold">기술 스택</h2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        {stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
