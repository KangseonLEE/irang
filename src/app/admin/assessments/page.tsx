/**
 * 어드민 — 진단 결과 분석 (2026-10-20 개편)
 *
 * 요약 · 퍼널(GA 스냅샷 링크) · 유입·기기 · 연령×유형 · 준비 단계 · 문항별 응답 · 주별 추이 · 목록.
 * DB 에는 진단을 끝낸 사람만 있다 — 도달·이탈은 GA, 결과 뒤 동선은 계측 보강 뒤 채운다.
 */

import Link from "next/link";
import { fetchAssessmentRows } from "@/lib/admin/queries";
import {
  AGE_GROUPS,
  ASSESS_MODES,
  FARM_TYPES,
  REFERRER_GROUPS,
  TIER_IDS,
  buildAssessmentStats,
  buildWeeklyTrend,
  deviceOf,
  filterAssessmentRows,
  modeOf,
  referrerGroupOf,
  type AssessMode,
  type AssessmentListFilter,
  type DeviceKind,
  type ReferrerGroup,
} from "@/lib/admin/assessment-stats";
import { QUESTIONS } from "@/lib/data/assessment";
import { QUICK_QUESTIONS } from "@/lib/data/quick-check";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { migrateFarmTypeId } from "@/lib/data/match-questions";
import s from "./page.module.css";
import { requireAdminPage } from "@/lib/admin/session";

/** admin은 매 요청 fresh fetch가 의도. searchParams 의존이라 revalidate 추가 시 dynamic SSR 충돌 (2026-05-11 lessons). */

// farm_type_id별 컬러 + 라벨 매핑 (src/lib/data/match-questions.ts FARM_TYPES 동기화)
const TYPE_COLORS: Record<string, string> = {
  guinong: "#1B6B5A",
  guichon: "#2563eb",
  guisanchon: "#7c3aed",
  smartfarm: "#d97706",
  cheongnyeon: "#059669",
};

const TYPE_LABEL: Record<string, string> = {
  guinong: "귀농형",
  guichon: "귀촌형",
  guisanchon: "귀산촌형",
  smartfarm: "스마트팜형",
  cheongnyeon: "청년농형",
};

const MODE_LABEL: Record<AssessMode, string> = {
  assess: "준비도 진단",
  match: "지역·작물 매칭",
  quick: "빠른 점검",
};

const MODE_COLOR: Record<AssessMode, string> = {
  assess: "var(--primary)",
  match: "var(--primary-light)",
  quick: "color-mix(in srgb, var(--primary) 35%, white)",
};

const REFERRER_LABEL: Record<ReferrerGroup, string> = {
  direct: "직접·알 수 없음",
  naver: "네이버",
  google: "구글",
  internal: "사이트 안",
  other: "기타",
};

const DEVICE_LABEL: Record<DeviceKind, string> = { mobile: "모바일", desktop: "데스크탑" };

// data-assess-entry 라벨(PersonaCta from) — 모르는 라벨은 그대로 보인다
const ENTRY_FROM_LABEL: Record<string, string> = {
  crop_detail_top: "작물 상세 위쪽",
  crop_detail: "작물 상세 아래",
  crops_list: "작물 목록",
  program_detail_top: "지원사업 상세 위쪽",
  program_detail: "지원사업 상세 아래",
  programs_list: "지원사업 목록",
  region_detail: "시·도 상세",
  sigungu_detail: "시·군·구 상세",
  regions_list: "지역 목록",
  guide_beginner_crops: "초보 작물 가이드",
  start_hub: "시작 허브",
  start_compare: "시작 · 비교",
};

// RESULT_TIERS 순서(starter → ready)와 같은 짧은 이름
const TIER_LABEL: Record<string, string> = {
  starter: "씨앗",
  sprout: "새싹",
  seedling: "모종",
  ready: "준비 완료",
};

const AGE_LABEL: Record<string, string> = Object.fromEntries(
  (QUICK_QUESTIONS.find((q) => q.id === "ageGroup")?.options ?? []).map((o) => [o.id, o.label]),
);

/** 이 건수 미만이면 비율이 흔들려 흐리게 보인다 */
const LOW_SAMPLE = 20;
const PER_PAGE = 20;
const GA_SNAPSHOT_URL =
  "https://github.com/KangseonLEE/irang/issues?q=label%3Aga4-snapshot+sort%3Acreated-desc";

const PERIOD_OPTIONS: Array<{ value: string; days: number; label: string }> = [
  { value: "7", days: 7, label: "7일" },
  { value: "30", days: 30, label: "30일" },
  { value: "90", days: 90, label: "3개월" },
  { value: "all", days: 0, label: "전체" },
];

const DEFAULT_PERIOD = "30";
const DAY = 86_400_000;

function typeColor(id: string | null | undefined): string {
  if (!id) return "#6b7280";
  return TYPE_COLORS[migrateFarmTypeId(id)] ?? "#6b7280";
}

function typeLabel(id: string | null | undefined): string {
  if (!id) return "(미상)";
  return TYPE_LABEL[migrateFarmTypeId(id)] ?? id;
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function pickOne<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((v) => v === value);
}

interface Props {
  searchParams: Promise<{ page?: string; days?: string; mode?: string; device?: string; ref?: string }>;
}

export default async function AdminAssessmentsPage({ searchParams }: Props) {
  await requireAdminPage(); // 미들웨어와 별개의 2차 인가 — 데이터 조회보다 먼저 (보안 QA 🟡5)
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const selectedPeriod =
    PERIOD_OPTIONS.find((p) => p.value === params.days) ??
    PERIOD_OPTIONS.find((p) => p.value === DEFAULT_PERIOD)!;
  const filter: AssessmentListFilter = {
    mode: pickOne(params.mode, ASSESS_MODES),
    device: pickOne(params.device, ["mobile", "desktop"] as const),
    referrer: pickOne(params.ref, REFERRER_GROUPS),
  };

  const { rows, limited } = await fetchAssessmentRows();
  const now = new Date();
  const nowMs = now.getTime();
  const days = selectedPeriod.days;
  const inRange = (r: { created_at: string }, from: number, to: number) => {
    const t = Date.parse(r.created_at);
    return t >= from && t < to;
  };
  const current = days > 0 ? rows.filter((r) => inRange(r, nowMs - days * DAY, Infinity)) : rows;
  const previousTotal =
    days > 0 ? rows.filter((r) => inRange(r, nowMs - 2 * days * DAY, nowMs - days * DAY)).length : null;

  const stats = buildAssessmentStats(current, previousTotal ?? 0, QUESTIONS.map((q) => q.id));
  const weekly = buildWeeklyTrend(rows, now);
  const weeklyMax = Math.max(4, ...weekly.map((w) => ASSESS_MODES.reduce((a, m) => a + w.counts[m], 0)));

  const filtered = filterAssessmentRows(current, filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const list = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const lowClass = (n: number) => (n < LOW_SAMPLE ? s.low : "");
  const delta = previousTotal === null ? null : stats.total - previousTotal;

  function urlWithParams(overrides: {
    page?: number;
    days?: string;
    mode?: string | null;
    device?: string | null;
    ref?: string | null;
  }): string {
    const sp = new URLSearchParams();
    const nextDays = overrides.days ?? selectedPeriod.value;
    if (nextDays !== DEFAULT_PERIOD) sp.set("days", nextDays);
    const mode = overrides.mode === undefined ? filter.mode : overrides.mode;
    const device = overrides.device === undefined ? filter.device : overrides.device;
    const ref = overrides.ref === undefined ? filter.referrer : overrides.ref;
    if (mode) sp.set("mode", mode);
    if (device) sp.set("device", device);
    if (ref) sp.set("ref", ref);
    const nextPage = overrides.page ?? page;
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `/admin/assessments?${qs}` : "/admin/assessments";
  }

  const ageRows = [...AGE_GROUPS.filter((a) => stats.ageByType[a]), ...Object.keys(stats.ageByType).filter((a) => !(AGE_GROUPS as readonly string[]).includes(a))];
  const crossMax = Math.max(1, ...ageRows.flatMap((a) => FARM_TYPES.map((t) => stats.ageByType[a]?.[t] ?? 0)));

  return (
    <div className={s.page}>
      <div className={s.top}>
        <h1 className={s.heading}>진단 결과</h1>
        <div className={s.filters}>
          {PERIOD_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={urlWithParams({ days: opt.value, page: 1 })}
              className={`${s.filterPill} ${selectedPeriod.value === opt.value ? s.filterActive : ""}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <p className={s.note}>
        진단을 끝낸 사람만 DB 에 남아요. 20건 미만 칸은 비율이 흔들려 흐리게 보여요.
        {limited && " 행이 많아 최근 5,000건만 집계했어요."}
      </p>

      {/* ── 요약 ── */}
      <div className={s.kpis}>
        <div className={s.kpi}>
          <span className={s.kpiLabel}>진단 완료</span>
          <strong className={s.kpiValue}>{stats.total}건</strong>
          <span className={s.kpiSub}>
            {delta === null
              ? "전체 기간"
              : `직전 ${selectedPeriod.label} ${previousTotal}건 · ${delta >= 0 ? "+" : ""}${delta}`}
          </span>
        </div>
        <div className={s.kpi}>
          <span className={s.kpiLabel}>모바일 완료</span>
          <strong className={s.kpiValue}>{pct(stats.byDevice.mobile, stats.total)}%</strong>
          <span className={s.kpiSub}>
            {stats.byDevice.mobile} / {stats.total}건
          </span>
        </div>
        <div className={s.kpi}>
          <span className={s.kpiLabel}>추천 결과 저장</span>
          <strong className={s.kpiValue}>{stats.withRecommendations}건</strong>
          <span className={s.kpiSub}>지역·작물 매칭만 저장해요</span>
        </div>
        <div className={`${s.kpi} ${s.kpiPending}`}>
          <span className={s.kpiLabel}>결과 다시 열기</span>
          <strong className={s.kpiValue}>GA</strong>
          <span className={s.kpiSub}>assess_result_reopen · GA 스냅샷에서</span>
        </div>
      </div>

      <div className={s.grid2}>
        {/* ── 퍼널 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            진단 퍼널 <span className={`${s.tag} ${s.tagGa}`}>GA</span>
          </h2>
          <p className={s.sectionDesc}>
            도달 → 시작 → 문항별 이탈 → 완료는 GA 에만 있어요. M7 판정용 숫자는 GA 스냅샷 이슈에서 봐요.
          </p>
          <a href={GA_SNAPSHOT_URL} target="_blank" rel="noopener" referrerPolicy="origin" className={s.outLink}>
            GA 스냅샷 이슈 보기
          </a>
          <p className={s.subNote}>
            진단 완료 수의 기준은 이 화면(DB)이에요 — GA 는 광고 차단·동의 거부로 덜 세요.
          </p>
        </section>

        {/* ── 유입·기기 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            어디서 왔나 <span className={`${s.tag} ${s.tagDb}`}>DB</span>
          </h2>
          <p className={s.sectionDesc}>
            빠른 점검·매칭은 10/20 전까지 유입 주소를 저장하지 않아 ‘직접’으로 몰려 있어요.
          </p>
          <h3 className={s.groupTitle}>사이트 안 진입 ({stats.entryRecorded}건 기록)</h3>
          {stats.entryRecorded === 0 ? (
            <p className={s.subNote}>10/20 계측 이후 저장분부터 쌓여요.</p>
          ) : (
            <>
              {Object.entries(stats.byEntryFrom)
                .sort((a, b) => b[1] - a[1])
                .map(([from, n]) => (
                  <div key={from} className={`${s.hrow} ${lowClass(stats.entryRecorded)}`}>
                    <span>{ENTRY_FROM_LABEL[from] ?? from}</span>
                    <span className={s.hbar}>
                      <i style={{ width: `${pct(n, stats.entryRecorded)}%` }} />
                    </span>
                    <span className={s.hnum}>{n}건</span>
                  </div>
                ))}
              <p className={s.subNote}>진단 직전 화면</p>
              {Object.entries(stats.byEntryPath)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([path, n]) => (
                  <div key={path} className={`${s.hrow} ${lowClass(stats.entryRecorded)}`}>
                    <span className={s.mono}>{path}</span>
                    <span className={s.hbar}>
                      <i style={{ width: `${pct(n, stats.entryRecorded)}%` }} />
                    </span>
                    <span className={s.hnum}>{n}건</span>
                  </div>
                ))}
            </>
          )}
          <h3 className={s.groupTitle}>바깥 유입</h3>
          {REFERRER_GROUPS.filter((g) => stats.byReferrer[g] > 0).map((g) => (
            <div key={g} className={`${s.hrow} ${lowClass(stats.total)}`}>
              <span>{REFERRER_LABEL[g]}</span>
              <span className={s.hbar}>
                <i style={{ width: `${pct(stats.byReferrer[g], stats.total)}%` }} />
              </span>
              <span className={s.hnum}>
                {stats.byReferrer[g]}건 {pct(stats.byReferrer[g], stats.total)}%
              </span>
            </div>
          ))}
          <h3 className={s.groupTitle}>기기</h3>
          {(["desktop", "mobile"] as const).map((d) => (
            <div key={d} className={`${s.hrow} ${lowClass(stats.total)}`}>
              <span>{DEVICE_LABEL[d]}</span>
              <span className={s.hbar}>
                <i style={{ width: `${pct(stats.byDevice[d], stats.total)}%` }} />
              </span>
              <span className={s.hnum}>
                {stats.byDevice[d]}건 {pct(stats.byDevice[d], stats.total)}%
              </span>
            </div>
          ))}
          {stats.total === 0 && <p className={s.empty}>진단 데이터가 없어요</p>}
        </section>
      </div>

      <div className={s.grid2}>
        {/* ── 연령 × 유형 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            연령대 × 결과 유형 <span className={`${s.tag} ${s.tagDb}`}>DB</span>
          </h2>
          <p className={s.sectionDesc}>
            연령과 유형이 둘 다 있는 {stats.ageByTypeTotal}건 · 연령 미응답 {stats.ageByTypeExcluded}건 제외
          </p>
          {stats.ageByTypeTotal === 0 ? (
            <p className={s.empty}>연령을 답한 진단이 없어요</p>
          ) : (
            <div className={s.tableScroll}>
              <table className={s.crossTable}>
                <thead>
                  <tr>
                    <th scope="col">연령</th>
                    {FARM_TYPES.map((t) => (
                      <th key={t} scope="col">
                        {TYPE_LABEL[t]}
                      </th>
                    ))}
                    <th scope="col">합계</th>
                  </tr>
                </thead>
                <tbody>
                  {ageRows.map((a) => {
                    const cells = FARM_TYPES.map((t) => stats.ageByType[a]?.[t] ?? 0);
                    return (
                      <tr key={a}>
                        <th scope="row">{AGE_LABEL[a] ?? a}</th>
                        {cells.map((n, i) => (
                          <td key={FARM_TYPES[i]}>
                            <span
                              className={`${s.heat} ${n / crossMax > 0.6 ? s.heatStrong : ""}`}
                              style={{ "--heat": `${n ? 8 + (n / crossMax) * 60 : 0}%` } as React.CSSProperties}
                            >
                              {n || "·"}
                            </span>
                          </td>
                        ))}
                        <td className={s.crossSum}>{cells.reduce((x, y) => x + y, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 준비 단계 · 진단 종류 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            준비 단계 <span className={`${s.tag} ${s.tagDb}`}>DB</span>
          </h2>
          <p className={s.sectionDesc}>준비도 진단 {stats.tierTotal}건 · 점수 구간별</p>
          {TIER_IDS.map((t) => (
            <div key={t} className={`${s.hrow} ${lowClass(stats.tierTotal)}`}>
              <span>{TIER_LABEL[t]}</span>
              <span className={s.hbar}>
                <i style={{ width: `${pct(stats.byTier[t] ?? 0, stats.tierTotal)}%` }} />
              </span>
              <span className={s.hnum}>
                {stats.byTier[t] ?? 0}건 {pct(stats.byTier[t] ?? 0, stats.tierTotal)}%
              </span>
            </div>
          ))}
          <h3 className={s.groupTitle}>진단 종류</h3>
          {ASSESS_MODES.map((m) => (
            <div key={m} className={`${s.hrow} ${lowClass(stats.total)}`}>
              <span>{MODE_LABEL[m]}</span>
              <span className={s.hbar}>
                <i style={{ width: `${pct(stats.byMode[m], stats.total)}%`, background: MODE_COLOR[m] }} />
              </span>
              <span className={s.hnum}>{stats.byMode[m]}건</span>
            </div>
          ))}
          <h3 className={s.groupTitle}>결과 유형</h3>
          {FARM_TYPES.filter((t) => stats.byType[t]).map((t) => (
            <div key={t} className={`${s.hrow} ${lowClass(stats.total)}`}>
              <span>{TYPE_LABEL[t]}</span>
              <span className={s.hbar}>
                <i style={{ width: `${pct(stats.byType[t], stats.total)}%`, background: TYPE_COLORS[t] }} />
              </span>
              <span className={s.hnum}>{stats.byType[t]}건</span>
            </div>
          ))}
        </section>
      </div>

      {/* ── 문항별 응답 ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          문항별 응답 분포 <span className={`${s.tag} ${s.tagDb}`}>DB</span>
        </h2>
        <p className={s.sectionDesc}>준비도 진단 {QUESTIONS.length}문항 · 연할수록 준비가 덜 된 답이에요</p>
        {stats.tierTotal === 0 ? (
          <p className={s.empty}>준비도 진단 데이터가 없어요</p>
        ) : (
          QUESTIONS.map((q, qi) => {
            const dist = stats.questions[qi];
            return (
              <div key={q.id} className={`${s.question} ${lowClass(dist.answered)}`}>
                <p className={s.questionTitle}>
                  <span className={s.questionMeta}>
                    {q.id.toUpperCase()} · {q.dimensionLabel}
                  </span>
                  {q.question} <span className={s.questionMeta}>({dist.answered}명)</span>
                </p>
                <div className={s.stack}>
                  {q.options.map((o, oi) => {
                    const n = dist.byScore[o.score] ?? 0;
                    return n > 0 ? (
                      <i
                        key={o.score}
                        title={`${o.label} — ${n}명`}
                        style={{
                          width: `${(n / dist.answered) * 100}%`,
                          background: `color-mix(in srgb, var(--primary) ${25 + oi * 25}%, white)`,
                        }}
                      >
                        {n}
                      </i>
                    ) : null;
                  })}
                </div>
                <ul className={s.optionLegend}>
                  {q.options.map((o, oi) => (
                    <li key={o.score}>
                      <b
                        aria-hidden="true"
                        style={{ background: `color-mix(in srgb, var(--primary) ${25 + oi * 25}%, white)` }}
                      />
                      {o.label}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>

      <div className={s.grid2}>
        {/* ── 주별 추이 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            주별 추이 <span className={`${s.tag} ${s.tagDb}`}>DB</span>
          </h2>
          <p className={s.sectionDesc}>최근 12주 완료 건수 · 기간 필터와 무관</p>
          <div className={s.weeks} role="img" aria-label="최근 12주 진단 완료 건수">
            {weekly.map((w) => {
              const total = ASSESS_MODES.reduce((a, m) => a + w.counts[m], 0);
              return (
                <div key={w.weekStart} className={s.week} title={`${w.weekStart} 주 ${total}건`}>
                  <span className={s.weekTotal}>{total || ""}</span>
                  {ASSESS_MODES.map((m) =>
                    w.counts[m] ? (
                      <i key={m} style={{ height: `${(w.counts[m] / weeklyMax) * 100}%`, background: MODE_COLOR[m] }} />
                    ) : null,
                  )}
                </div>
              );
            })}
          </div>
          <div className={s.weekLabels} aria-hidden="true">
            {weekly.map((w) => (
              <span key={w.weekStart}>{`${Number(w.weekStart.slice(5, 7))}/${Number(w.weekStart.slice(8, 10))}`}</span>
            ))}
          </div>
          <div className={s.legend}>
            {ASSESS_MODES.map((m) => (
              <span key={m} className={s.legendItem}>
                <span className={s.legendDot} style={{ background: MODE_COLOR[m] }} />
                {MODE_LABEL[m]}
              </span>
            ))}
          </div>
        </section>

        {/* ── 결과 뒤 동선 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            결과 뒤 동선 <span className={`${s.tag} ${s.tagGa}`}>GA</span>
          </h2>
          <p className={s.sectionDesc}>결과를 본 사람이 다음에 어디로 가는지</p>
          <div className={s.placeholder}>
            <p>10/20부터 GA 로 모아요. 숫자는 GA 스냅샷 이슈의 아래 두 줄에서 봐요.</p>
            <ul>
              <li>assess_result_click — 진단 종류:이동한 곳(지역·작물·지원사업·비용·다음 진단·외부)</li>
              <li>assess_result_reopen — 이전 진단 목록에서 결과 다시 열기</li>
            </ul>
          </div>
        </section>
      </div>

      {/* ── 목록 ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          진단 목록 ({filtered.length}건) <span className={`${s.tag} ${s.tagDb}`}>DB</span>
        </h2>
        <p className={s.sectionDesc}>행을 누르면 답변과 추천이 펼쳐져요</p>
        <div className={s.chips}>
          <Link href={urlWithParams({ mode: null, page: 1 })} className={`${s.chip} ${!filter.mode ? s.chipActive : ""}`}>
            전체 종류
          </Link>
          {ASSESS_MODES.map((m) => (
            <Link
              key={m}
              href={urlWithParams({ mode: m, page: 1 })}
              className={`${s.chip} ${filter.mode === m ? s.chipActive : ""}`}
            >
              {MODE_LABEL[m]}
            </Link>
          ))}
          <span className={s.chipDivider} aria-hidden="true" />
          {(["mobile", "desktop"] as const).map((d) => (
            <Link
              key={d}
              href={urlWithParams({ device: filter.device === d ? null : d, page: 1 })}
              className={`${s.chip} ${filter.device === d ? s.chipActive : ""}`}
            >
              {DEVICE_LABEL[d]}
            </Link>
          ))}
          <span className={s.chipDivider} aria-hidden="true" />
          {(["naver", "google", "direct"] as const).map((g) => (
            <Link
              key={g}
              href={urlWithParams({ ref: filter.referrer === g ? null : g, page: 1 })}
              className={`${s.chip} ${filter.referrer === g ? s.chipActive : ""}`}
            >
              {REFERRER_LABEL[g]}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className={s.empty}>조건에 맞는 진단이 없어요</p>
        ) : (
          <div className={s.list}>
            <div className={`${s.listRow} ${s.listHead}`} aria-hidden="true">
              <span>일시</span>
              <span>종류</span>
              <span>결과</span>
              <span>연령</span>
              <span>유입 · 기기</span>
            </div>
            {list.map((a) => {
              const mode = modeOf(a);
              const tier = typeof a.answers.__assess_tier === "string" ? a.answers.__assess_tier : null;
              const score = a.answers.__assess_total_score;
              const answered = (mode === "assess" ? QUESTIONS : []).map((q) => ({
                q,
                option: q.options.find((o) => o.score === a.answers[q.id]),
              }));
              return (
                <details key={a.id} className={s.listItem}>
                  <summary className={s.listRow}>
                    <span>
                      {new Date(a.created_at).toLocaleString("ko-KR", {
                        timeZone: "Asia/Seoul",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{MODE_LABEL[mode]}</span>
                    <span>
                      {a.farm_type_id ? (
                        <span
                          className={s.typeBadge}
                          style={{
                            background: `color-mix(in srgb, ${typeColor(a.farm_type_id)} 12%, transparent)`,
                            color: typeColor(a.farm_type_id),
                          }}
                        >
                          {typeLabel(a.farm_type_id)}
                        </span>
                      ) : (
                        (a.persona && PERSONA_INDEX.get(a.persona as PersonaId)?.label) ?? "—"
                      )}
                    </span>
                    <span>{a.age_group ? AGE_LABEL[a.age_group] ?? a.age_group : "—"}</span>
                    <span>
                      {REFERRER_LABEL[referrerGroupOf(a.referrer)]} · {DEVICE_LABEL[deviceOf(a.user_agent)]}
                    </span>
                  </summary>
                  <dl className={s.detail}>
                    {answered.map(({ q, option }) => (
                      <div key={q.id}>
                        <dt>{q.id.toUpperCase()}</dt>
                        <dd>{option?.label ?? "—"}</dd>
                      </div>
                    ))}
                    {tier && (
                      <div>
                        <dt>준비 단계</dt>
                        <dd>
                          {TIER_LABEL[tier] ?? tier}
                          {typeof score === "number" ? ` (${score}점)` : ""}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt>추천 지역·작물</dt>
                      <dd>
                        {a.top_regions?.length || a.top_crops?.length
                          ? `${(a.top_regions ?? []).join(", ") || "—"} / ${(a.top_crops ?? []).join(", ") || "—"}`
                          : "저장 안 됨"}
                      </dd>
                    </div>
                    <div>
                      <dt>결과 id</dt>
                      <dd>{a.id}</dd>
                    </div>
                  </dl>
                </details>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className={s.pagination}>
            {page > 1 && (
              <Link href={urlWithParams({ page: page - 1 })} className={s.pageLink}>
                이전
              </Link>
            )}
            <span className={s.pageInfo}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link href={urlWithParams({ page: page + 1 })} className={s.pageLink}>
                다음
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
