"use client";

import { useEffect, useState } from "react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import s from "./global-loading.module.css";

// 친근한 로딩 메시지 — 랜덤 회전
const MESSAGES = [
  "농촌 데이터를 모으고 있어요",
  "오늘의 작물 정보를 불러오는 중",
  "전국 지원사업을 확인하고 있어요",
  "귀농 선배들의 이야기를 준비 중",
  "최적의 귀농지를 탐색 중이에요",
  "날씨와 토양 정보를 분석 중",
  "새로운 교육 과정을 찾고 있어요",
];

function getRandomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function GlobalLoading() {
  const [message, setMessage] = useState(getRandomMessage);

  // 3초마다 메시지 회전
  useEffect(() => {
    const id = setInterval(() => {
      setMessage(getRandomMessage());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={s.overlay} role="status" aria-label="페이지 로딩 중">
      <div className={s.logo}>
        <IrangSymbol size={48} />
      </div>
      <div className={s.messageWrap}>
        <p className={s.message} key={message}>
          {message}
        </p>
        <p className={s.sub}>잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
