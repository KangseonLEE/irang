"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import s from "./page.module.css";

interface VideoThumbProps {
  src: string;
}

/** 썸네일 로드 실패 시 영역 자체를 숨기는 클라이언트 컴포넌트 */
export function VideoThumb({ src }: VideoThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className={s.videoThumb}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="영상 썸네일"
        loading="lazy"
        decoding="async"
        className={s.videoThumbImg}
        onError={() => setFailed(true)}
      />
      <span className={s.videoPlayIcon} aria-hidden="true">
        <Play size={20} fill="white" stroke="white" />
      </span>
    </div>
  );
}
