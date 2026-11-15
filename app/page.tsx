import { Database, Download, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

// 사용 방법 안내 단계
const steps = [
  {
    icon: Database,
    title: "1. Notion에서 견적서 작성",
    description:
      "안내된 Notion 템플릿(견적서/견적 항목 데이터베이스)에 맞춰 견적서를 작성합니다.",
  },
  {
    icon: Link2,
    title: "2. 공유 링크 전달",
    description: "견적서별 고유 링크를 클라이언트에게 전달합니다.",
  },
  {
    icon: Download,
    title: "3. 확인 및 PDF 다운로드",
    description: "클라이언트가 웹에서 견적서를 확인하고 PDF로 보관합니다.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="secondary">Notion 연동</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-xl font-semibold">사용 방법</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <step.icon className="mb-2 size-6 text-primary" />
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
