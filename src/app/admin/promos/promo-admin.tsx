"use client";

/**
 * 홍보 팝업 관리 (2026-09-29 회장: 노출 기간 설정·내용 수정을 admin 에서).
 *
 * 목록 ↔ 편집 폼 한 화면. 목록은 API 응답을 그대로 들고 있다가 저장 결과로 갈아 끼운다
 * (`router.refresh()` 대신) — 서버 컴포넌트 재조회 없이 방금 고친 행이 즉시 반영된다.
 *
 * 상태 칩은 공용 `StatusBadge` 를 쓰지 않는다 — 그쪽은 공고 상태(모집중·마감) 라벨 전용이고
 * 여기 4종(노출 중·예정·종료·비활성)과 의미가 겹치지 않는다.
 */

import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useDialog } from "@/components/ui/confirm-dialog";
import { PromoPopup } from "@/components/landing/promo-popup";
import type { PromoRecord } from "@/lib/promos/types";
import { PromoForm } from "./promo-form";
import { PROMO_STATUS_LABELS, parsePromoApiError, promoPeriodLabel, promoStatus, type PromoStatus } from "./promo-rules";
import s from "./page.module.css";

const STATUS_CLASS: Record<PromoStatus, string> = {
  live: s.chipLive,
  scheduled: s.chipScheduled,
  ended: s.chipEnded,
  inactive: s.chipInactive,
};

type Editing = { mode: "new" } | { mode: "edit"; record: PromoRecord } | null;

export function PromoAdmin() {
  const { confirm, alert } = useDialog();
  const [items, setItems] = useState<PromoRecord[] | null>(null);
  const [loadError, setLoadError] = useState<{ message: string; setup: boolean } | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [previewing, setPreviewing] = useState<PromoRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // 목록 조회는 "외부 시스템 구독" — 응답 콜백에서만 상태를 바꾼다(effect 본문 setState 금지 규칙)
  const load = useCallback(() => {
    fetch("/admin/api/promos", { cache: "no-store" })
      .then(async (res) => {
        const data: unknown = await res.json().catch(() => ({}));
        const items = (data as { items?: PromoRecord[] }).items;
        if (!res.ok || !items) {
          const { message, setup } = parsePromoApiError(res.status, data);
          return { items: [] as PromoRecord[], error: { message, setup } };
        }
        return { items, error: null };
      })
      .then(({ items: list, error }) => {
        setItems(list);
        setLoadError(error);
      })
      .catch(() => {
        setItems([]);
        setLoadError({ message: "목록을 불러오지 못했어요. 잠시 뒤 다시 해주세요.", setup: false });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = (record: PromoRecord) => {
    setItems((prev) => {
      const rest = (prev ?? []).filter((it) => it.id !== record.id);
      return [...rest, record].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    });
    setEditing(null);
  };

  const handleDelete = async (record: PromoRecord) => {
    const ok = await confirm({
      title: `‘${record.title}’ 을 지울까요?`,
      description: "지우면 되돌릴 수 없어요. 잠시 내리려면 활성 스위치만 꺼도 돼요.",
      confirmLabel: "지우기",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(record.id);
    try {
      const res = await fetch(`/admin/api/promos/${encodeURIComponent(record.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        throw new Error(parsePromoApiError(res.status, data).message);
      }
      setItems((prev) => (prev ?? []).filter((it) => it.id !== record.id));
    } catch (err) {
      await alert({
        title: "지우지 못했어요",
        description: err instanceof Error ? err.message : "잠시 뒤 다시 해주세요.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (editing) {
    return (
      <PromoForm
        initial={editing.mode === "edit" ? editing.record : null}
        onCancel={() => setEditing(null)}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className={s.page}>
      <header className={s.pageHead}>
        <div>
          <h1 className={s.heading}>홍보</h1>
          <p className={s.lede}>랜딩에 뜨는 소식 팝업이에요. 노출 기간과 내용을 여기서 고쳐요.</p>
        </div>
        <button type="button" className={s.primaryBtn} onClick={() => setEditing({ mode: "new" })}>
          <Plus size={15} aria-hidden="true" />새 소식
        </button>
      </header>

      {loadError && (
        <p className={loadError.setup ? s.setupNotice : s.formError} role="alert">
          {loadError.message}
        </p>
      )}

      {items === null ? (
        <p className={s.empty}>불러오는 중이에요…</p>
      ) : items.length === 0 ? (
        <p className={s.empty}>아직 등록한 소식이 없어요</p>
      ) : (
        <ul className={s.list}>
          {items.map((item) => {
            const status = promoStatus(item);
            return (
              <li key={item.id} className={s.card}>
                <div className={s.cardMain}>
                  <div className={s.cardTop}>
                    <span className={`${s.chip} ${STATUS_CLASS[status]}`}>{PROMO_STATUS_LABELS[status]}</span>
                    <span className={s.org}>{item.org}</span>
                    <span className={s.order}>정렬 {item.sortOrder}</span>
                  </div>
                  <h2 className={s.cardTitle}>{item.title}</h2>
                  <p className={s.cardMeta}>
                    <span className={s.period}>{promoPeriodLabel(item)}</span>
                    <span className={s.idText}>{item.id}</span>
                  </p>
                </div>
                <div className={s.cardActions}>
                  <button type="button" className={s.ghostBtn} onClick={() => setPreviewing(item)}>
                    <Eye size={15} aria-hidden="true" />
                    미리보기
                  </button>
                  <button
                    type="button"
                    className={s.ghostBtn}
                    onClick={() => setEditing({ mode: "edit", record: item })}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    수정
                  </button>
                  <button
                    type="button"
                    className={`${s.ghostBtn} ${s.dangerBtn}`}
                    onClick={() => handleDelete(item)}
                    disabled={busyId === item.id}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {busyId === item.id ? "지우는 중…" : "삭제"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {previewing && <PromoPopup items={[previewing]} preview onClose={() => setPreviewing(null)} />}
    </div>
  );
}
