"use client";

/**
 * WeightCustomizerModal — /regions/ranking 모바일 가중치 조정 모달 래퍼.
 *
 * 5/22 회장 결재 (백로그 Top 2):
 *   - 모바일 페르소나 모드에서 슬라이더 5개가 인라인 노출되어 결과까지 700px+ 스크롤 필요
 *   - 가중치 조정은 advanced UX → 모달로 분리
 *   - 메인 흐름: 페르소나 chip → 결과 ranking (단순화)
 *
 * 디자인 결정:
 *   - 트리거: 페르소나 chip 줄 아래 텍스트 link 스타일 (조정 중일 때 강조)
 *   - 모달: Modal 컴포넌트 재사용, mobileHeight="tall" (슬라이더 5개 가독성)
 *   - 데스크탑(min-width: 1024px): 인라인 노출 그대로 유지 (페이지 호출부에서 CSS 분기)
 *
 * Server↔Client 경계 (체크리스트 H):
 *   - 자체 완결 Client Component
 *   - 부모(Server)가 basePersona/currentWeights/isCustom props 전달
 */

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { WeightCustomizer } from "./weight-customizer";
import type { Persona, PersonaWeights } from "@/lib/data/personas";
import s from "./weight-customizer-modal.module.css";

interface WeightCustomizerModalProps {
  basePersona: Persona;
  currentWeights: PersonaWeights;
  isCustom: boolean;
}

export function WeightCustomizerModal({
  basePersona,
  currentWeights,
  isCustom,
}: WeightCustomizerModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${s.trigger} ${isCustom ? s.triggerActive : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon icon={SlidersHorizontal} size="sm" />
        <span className={s.triggerLabel}>
          {isCustom ? "가중치 조정 중" : "가중치 직접 조정"}
        </span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="가중치 직접 조정"
        mobileHeight="tall"
      >
        <WeightCustomizer
          basePersona={basePersona}
          currentWeights={currentWeights}
          isCustom={isCustom}
        />
      </Modal>
    </>
  );
}
