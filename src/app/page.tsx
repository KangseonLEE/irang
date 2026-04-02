import Link from "next/link";
import { ArrowRight, MapPin, FileText, Sprout } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "지역 비교",
    description: "기후, 인프라, 인구 데이터로 나에게 맞는 귀농 지역을 비교하세요.",
    href: "/regions",
    color: "text-brand-500",
    bg: "bg-brand-50",
  },
  {
    icon: FileText,
    title: "지원사업 검색",
    description: "나이, 지역, 희망 작물 조건으로 받을 수 있는 지원사업을 찾아보세요.",
    href: "/programs",
    color: "text-info",
    bg: "bg-blue-50",
  },
  {
    icon: Sprout,
    title: "작물 정보",
    description: "주요 작물의 재배 환경, 수익성, 난이도를 한눈에 확인하세요.",
    href: "/crops",
    color: "text-success",
    bg: "bg-green-50",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                귀농 정보 큐레이션
              </span>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                귀농, 이제
                <br />
                <span className="text-primary">어디서 시작할지</span>
                <br />
                알 수 있어요.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                흩어진 지원사업, 지역 정보, 작물 데이터를 한 곳에서.
                <br />
                5분이면 내 귀농 로드맵이 보입니다.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/programs" size="lg" className="gap-2">
                  지원사업 찾기
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/regions" variant="outline" size="lg">
                  지역 비교하기
                </LinkButton>
              </div>
            </div>
            {/* Hero Illustration Placeholder */}
            <div className="hidden aspect-square max-w-md items-center justify-center rounded-3xl bg-accent/50 md:flex">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Sprout className="h-16 w-16 text-primary/40" />
                <span className="text-sm">일러스트 영역</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              귀농에 필요한 모든 정보, 한곳에서
            </h2>
            <p className="mt-3 text-muted-foreground">
              조건에 맞는 지역과 지원사업을 빠르게 찾아보세요.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href} className="group">
                  <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
                    <CardHeader className="gap-4">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        자세히 보기
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "228", label: "시/군/구", suffix: "개" },
              { value: "50+", label: "주요 작물", suffix: "종" },
              { value: "100+", label: "지원사업", suffix: "건" },
              { value: "10+", label: "데이터 소스", suffix: "개" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">
                  {stat.value}
                  <span className="text-lg font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
