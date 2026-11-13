import { Layers, Moon, Paintbrush, Zap } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Next.js 15 App Router",
    description: "서버 컴포넌트와 최신 라우팅 구조로 빠르게 개발합니다.",
  },
  {
    icon: Paintbrush,
    title: "Tailwind CSS v4",
    description: "유틸리티 클래스 기반으로 일관된 스타일을 작성합니다.",
  },
  {
    icon: Layers,
    title: "shadcn/ui",
    description: "복사해서 쓰는 접근성 좋은 컴포넌트를 자유롭게 수정합니다.",
  },
  {
    icon: Moon,
    title: "다크 모드",
    description: "next-themes로 시스템 설정과 수동 전환을 모두 지원합니다.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="secondary">Starter Kit</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          웹 개발을 빠르게 시작하세요
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
        <div className="flex gap-3">
          <Link href="/about" className={cn(buttonVariants({ size: "lg" }))}>
            시작하기
          </Link>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="mb-2 size-6 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
