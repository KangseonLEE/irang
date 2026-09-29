"use client";

/**
 * 홍보 팝업 편집 폼 (신규·수정 공용).
 *
 * - 저장 전에 **미리보기**로 실제 랜딩 팝업(`PromoPopup preview`)을 그대로 띄워 본다.
 *   관리자가 보는 것과 사용자가 볼 것이 같아야 오탈자·줄바꿈 사고를 여기서 잡는다.
 * - 저장·취소 확인은 공용 `useDialog()` — `window.confirm` 금지(eslint 차단).
 * - 셀렉트는 공용 `SelectCombobox`(native select 금지). 날짜는 브라우저 기본 date 입력.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Eye, Plus, Trash2, ArrowUp, ArrowDown, Upload, Save, X } from "lucide-react";
import { useDialog } from "@/components/ui/confirm-dialog";
import { PromoPopup } from "@/components/landing/promo-popup";
import type { PromoRecord } from "@/lib/promos/types";
import {
  kstDate,
  kstDatePlus,
  parsePromoApiError,
  toPromoPayload,
  validatePromo,
  type PromoFormErrors,
  type PromoFormValues,
} from "./promo-rules";
import s from "./page.module.css";

interface Props {
  /** 수정 대상. null 이면 신규 */
  initial: PromoRecord | null;
  onCancel: () => void;
  onSaved: (record: PromoRecord) => void;
}

function toValues(initial: PromoRecord | null): PromoFormValues {
  if (!initial) {
    return {
      id: "",
      org: "",
      title: "",
      tagline: "",
      image: "",
      imageWidth: 600,
      imageHeight: 851,
      alt: "",
      facts: [{ label: "모집 기간", value: "" }],
      recruitClosed: false,
      note: "",
      href: "",
      startsAt: kstDate(),
      until: kstDatePlus(30),
      active: true,
      sortOrder: 0,
    };
  }
  return {
    ...initial,
    startsAt: initial.startsAt ?? "",
    facts: initial.facts.map((f) => ({ ...f })),
  };
}

export function PromoForm({ initial, onCancel, onSaved }: Props) {
  const { confirm, alert } = useDialog();
  const isNew = initial === null;
  const [values, setValues] = useState<PromoFormValues>(() => toValues(initial));
  const [errors, setErrors] = useState<PromoFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; setup: boolean } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof PromoFormValues>(key: K, v: PromoFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const setFact = (i: number, key: "label" | "value" | "href", v: string) => {
    setValues((prev) => {
      const facts = prev.facts.map((f, idx) => (idx === i ? { ...f, [key]: v } : f));
      return { ...prev, facts };
    });
  };

  const moveFact = (i: number, d: -1 | 1) => {
    setValues((prev) => {
      const next = [...prev.facts];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...prev, facts: next };
    });
  };

  const draft = useMemo(() => toPromoPayload({ ...values, id: values.id || "preview" }), [values]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setServerError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      if (values.id.trim()) body.append("id", values.id.trim());
      const res = await fetch("/admin/api/promos/upload", { method: "POST", body });
      const data: unknown = await res.json().catch(() => ({}));
      const url = (data as { url?: string }).url;
      if (!res.ok || !url) {
        const { message, setup } = parsePromoApiError(res.status, data);
        setServerError({ message, setup });
        return;
      }
      const size = data as { width?: number; height?: number };
      setValues((prev) => ({
        ...prev,
        image: url,
        imageWidth: size.width ?? prev.imageWidth,
        imageHeight: size.height ?? prev.imageHeight,
      }));
    } catch {
      setServerError({ message: "포스터를 올리지 못했어요. 잠시 뒤 다시 해주세요.", setup: false });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const found = validatePromo(values, isNew);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      await alert({ title: "아직 못 채운 곳이 있어요", description: "빨간 안내가 붙은 칸을 확인해 주세요." });
      return;
    }
    const ok = await confirm({
      title: isNew ? "이 소식을 등록할까요?" : "수정한 내용을 저장할까요?",
      description: values.active
        ? "저장하면 노출 기간 안에서 랜딩 팝업으로 바로 보여요."
        : "비활성 상태라 저장해도 랜딩에는 보이지 않아요.",
      confirmLabel: "저장",
    });
    if (!ok) return;

    setSaving(true);
    setServerError(null);
    try {
      const payload = toPromoPayload(values);
      const res = await fetch(isNew ? "/admin/api/promos" : `/admin/api/promos/${encodeURIComponent(payload.id)}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => ({}));
      const item = (data as { item?: PromoRecord }).item;
      if (!res.ok || !item) {
        const { message, setup, fieldErrors } = parsePromoApiError(res.status, data);
        setServerError({ message, setup });
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
        return;
      }
      onSaved(item);
    } catch {
      setServerError({ message: "저장하지 못했어요. 잠시 뒤 다시 해주세요.", setup: false });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: "편집을 그만둘까요?",
      description: "저장하지 않은 내용은 사라져요.",
      confirmLabel: "그만두기",
      cancelLabel: "계속 쓰기",
      tone: "danger",
    });
    if (ok) onCancel();
  };

  return (
    <section className={s.form} aria-label={isNew ? "새 소식 등록" : "소식 수정"}>
      <header className={s.formHead}>
        <h2 className={s.formTitle}>{isNew ? "새 소식" : `수정 · ${initial?.title}`}</h2>
        <div className={s.formHeadActions}>
          <button
            type="button"
            className={s.ghostBtn}
            onClick={() => setPreviewOpen(true)}
            disabled={!values.image}
            title={values.image ? undefined : "포스터를 먼저 올려 주세요"}
          >
            <Eye size={15} aria-hidden="true" />
            미리보기
          </button>
          <button type="button" className={s.ghostBtn} onClick={handleCancel}>
            <X size={15} aria-hidden="true" />
            취소
          </button>
          <button type="button" className={s.primaryBtn} onClick={handleSave} disabled={saving || uploading}>
            <Save size={15} aria-hidden="true" />
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </header>

      {serverError && (
        <p className={serverError.setup ? s.setupNotice : s.formError} role="alert">
          {serverError.message}
        </p>
      )}

      <div className={s.fieldGrid}>
        <label className={s.field}>
          <span className={s.label}>id (주소·저장 키)</span>
          <input
            className={s.input}
            value={values.id}
            onChange={(e) => set("id", e.target.value)}
            disabled={!isNew}
            placeholder="gafi-masil-2026"
          />
          <span className={s.hint}>
            {isNew ? "영문 소문자·숫자·하이픈. 등록 뒤에는 못 바꿔요" : "등록 뒤에는 바꿀 수 없어요"}
          </span>
          {errors.id && <span className={s.fieldError}>{errors.id}</span>}
        </label>

        <label className={s.field}>
          <span className={s.label}>기관</span>
          <input
            className={s.input}
            value={values.org}
            onChange={(e) => set("org", e.target.value)}
            placeholder="경기도 귀농귀촌지원센터"
          />
          {errors.org && <span className={s.fieldError}>{errors.org}</span>}
        </label>

        <label className={`${s.field} ${s.fieldWide}`}>
          <span className={s.label}>제목</span>
          <input className={s.input} value={values.title} onChange={(e) => set("title", e.target.value)} />
          {errors.title && <span className={s.fieldError}>{errors.title}</span>}
        </label>

        <label className={`${s.field} ${s.fieldWide}`}>
          <span className={s.label}>부제 (한 줄)</span>
          <input className={s.input} value={values.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </label>
      </div>

      {/* ── 포스터 ── */}
      <div className={s.block}>
        <h3 className={s.blockTitle}>포스터</h3>
        <div className={s.posterRow}>
          <div className={s.posterPreview}>
            {values.image ? (
              <Image
                src={values.image}
                alt=""
                width={values.imageWidth || 600}
                height={values.imageHeight || 851}
                className={s.posterThumb}
                unoptimized
              />
            ) : (
              <span className={s.posterEmpty}>아직 없어요</span>
            )}
          </div>
          <div className={s.posterFields}>
            <div className={s.uploadRow}>
              <button
                type="button"
                className={s.ghostBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={15} aria-hidden="true" />
                {uploading ? "올리는 중…" : "파일 올리기"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className={s.fileInput}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
            </div>
            <label className={s.field}>
              <span className={s.label}>경로 (직접 입력해도 돼요)</span>
              <input className={s.input} value={values.image} onChange={(e) => set("image", e.target.value)} />
              {errors.image && <span className={s.fieldError}>{errors.image}</span>}
            </label>
            <div className={s.sizeRow}>
              <label className={s.field}>
                <span className={s.label}>가로(px)</span>
                <input
                  className={s.input}
                  type="number"
                  value={values.imageWidth}
                  onChange={(e) => set("imageWidth", Number(e.target.value) || 0)}
                />
              </label>
              <label className={s.field}>
                <span className={s.label}>세로(px)</span>
                <input
                  className={s.input}
                  type="number"
                  value={values.imageHeight}
                  onChange={(e) => set("imageHeight", Number(e.target.value) || 0)}
                />
              </label>
            </div>
            <label className={s.field}>
              <span className={s.label}>포스터 설명 (대체 텍스트)</span>
              <input className={s.input} value={values.alt} onChange={(e) => set("alt", e.target.value)} />
              {errors.alt && <span className={s.fieldError}>{errors.alt}</span>}
            </label>
          </div>
        </div>
      </div>

      {/* ── 정보 행 ── */}
      <div className={s.block}>
        <div className={s.blockHead}>
          <h3 className={s.blockTitle}>정보 행</h3>
          <button
            type="button"
            className={s.ghostBtn}
            onClick={() => setValues((prev) => ({ ...prev, facts: [...prev.facts, { label: "", value: "" }] }))}
          >
            <Plus size={15} aria-hidden="true" />행 추가
          </button>
        </div>
        {errors.facts && <p className={s.fieldError}>{errors.facts}</p>}
        <ul className={s.factList}>
          {values.facts.map((f, i) => (
            <li key={i} className={s.factRow}>
              <input
                className={`${s.input} ${s.factLabel}`}
                value={f.label}
                onChange={(e) => setFact(i, "label", e.target.value)}
                aria-label={`${i + 1}번째 행 라벨`}
                placeholder="모집 기간"
              />
              <input
                className={s.input}
                value={f.value}
                onChange={(e) => setFact(i, "value", e.target.value)}
                aria-label={`${i + 1}번째 행 내용`}
                placeholder="9. 28.(일) 18:00 마감"
              />
              <input
                className={`${s.input} ${s.factHref}`}
                value={f.href ?? ""}
                onChange={(e) => setFact(i, "href", e.target.value)}
                aria-label={`${i + 1}번째 행 링크`}
                placeholder="tel:18008114 (선택)"
              />
              <div className={s.factBtns}>
                <button type="button" className={s.iconBtn} onClick={() => moveFact(i, -1)} aria-label={`${i + 1}번째 행 위로`} disabled={i === 0}>
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => moveFact(i, 1)}
                  aria-label={`${i + 1}번째 행 아래로`}
                  disabled={i === values.facts.length - 1}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => setValues((prev) => ({ ...prev, facts: prev.facts.filter((_, idx) => idx !== i) }))}
                  aria-label={`${i + 1}번째 행 삭제`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 안내·링크 ── */}
      <div className={s.block}>
        <h3 className={s.blockTitle}>안내와 링크</h3>
        <label className={s.checkRow}>
          <input
            type="checkbox"
            checked={values.recruitClosed}
            onChange={(e) => set("recruitClosed", e.target.checked)}
          />
          <span>모집이 끝났어요 (앰버 안내 박스로 보여요)</span>
        </label>
        <label className={s.field}>
          <span className={s.label}>안내 문구</span>
          <textarea
            className={s.textarea}
            rows={3}
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder={"이번 모집은 9. 28.(일) 18:00에 끝났어요.\n다음 기수는 센터에 문의해 보세요."}
          />
          <span className={s.hint}>줄바꿈은 그대로 보여요</span>
          {errors.note && <span className={s.fieldError}>{errors.note}</span>}
        </label>
        <label className={s.field}>
          <span className={s.label}>상세 보기 링크</span>
          <input
            className={s.input}
            value={values.href}
            onChange={(e) => set("href", e.target.value)}
            placeholder="https://"
          />
          {errors.href && <span className={s.fieldError}>{errors.href}</span>}
        </label>
      </div>

      {/* ── 노출 ── */}
      <div className={s.block}>
        <h3 className={s.blockTitle}>노출</h3>
        <div className={s.fieldGrid}>
          <label className={s.field}>
            <span className={s.label}>노출 시작</span>
            <input
              className={s.input}
              type="date"
              value={values.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
            <span className={s.hint}>비워 두면 저장하자마자 시작해요</span>
            {errors.startsAt && <span className={s.fieldError}>{errors.startsAt}</span>}
          </label>
          <label className={s.field}>
            <span className={s.label}>노출 종료</span>
            <input className={s.input} type="date" value={values.until} onChange={(e) => set("until", e.target.value)} />
            <span className={s.hint}>이 날까지 보여요</span>
            {errors.until && <span className={s.fieldError}>{errors.until}</span>}
          </label>
          <label className={s.field}>
            <span className={s.label}>정렬</span>
            <input
              className={s.input}
              type="number"
              value={values.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
            />
            <span className={s.hint}>숫자가 작을수록 먼저 보여요</span>
          </label>
        </div>
        <label className={s.checkRow}>
          <input type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} />
          <span>활성 — 끄면 기간 안이어도 보이지 않아요</span>
        </label>
      </div>

      {previewOpen && (
        <PromoPopup items={[draft]} preview onClose={() => setPreviewOpen(false)} />
      )}
    </section>
  );
}
