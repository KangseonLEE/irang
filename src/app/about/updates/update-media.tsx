"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { UpdateItem } from "@/lib/data/updates";
import u from "./page.module.css";

interface Props {
  title: string;
  media: NonNullable<UpdateItem["media"]>;
}

const DIM = {
  mobile: { width: 780, height: 1280 },
  desktop: { width: 1920, height: 1200 },
} as const;

/**
 * 업데이트 항목의 이전/이후 화면. 썸네일을 누르면 공용 Modal(wide)에 두 화면을 나란히 띄워 비교 (회장 9/2).
 * 이미지 파일·치수는 src/lib/data/updates.ts 의 media 주석 참조.
 */
export function UpdateMedia({ title, media }: Props) {
  const [open, setOpen] = useState(false);
  const dim = DIM[media.frame];
  const sizes = media.frame === "desktop" ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 30vw, 45vw";
  const shots = [
    ...(media.before ? [{ label: "이전", src: media.before, alt: `${title} — 이전 화면`, after: false }] : []),
    { label: media.before ? "이후" : "지금", src: media.after, alt: `${title} — ${media.before ? "이후" : "현재"} 화면`, after: true },
  ];

  return (
    <>
      <figure className={`${u.media} ${media.frame === "desktop" ? u.mediaDesktop : u.mediaMobile}`}>
        <div className={u.mediaGrid}>
          {shots.map((shot) => (
            <button
              key={shot.src}
              type="button"
              className={u.shot}
              onClick={() => setOpen(true)}
              aria-label={`${shot.alt} 크게 비교해 보기`}
            >
              <span className={`${u.shotLabel} ${shot.after ? u.shotLabelAfter : ""}`}>{shot.label}</span>
              <span className={u.shotFrame}>
                <Image src={shot.src} alt={shot.alt} width={dim.width} height={dim.height} sizes={sizes} className={u.shotImg} />
                <span className={u.shotZoom} aria-hidden="true">
                  <Maximize2 size={14} />
                </span>
              </span>
            </button>
          ))}
        </div>
        <figcaption className={u.mediaCaption}>{media.caption}</figcaption>
      </figure>

      <Modal open={open} onClose={() => setOpen(false)} title={title} size="wide">
        <div className={`${u.compare} ${media.frame === "desktop" ? u.compareDesktop : u.compareMobile}`}>
          {shots.map((shot) => (
            <div key={shot.src} className={u.compareCol}>
              <span className={`${u.shotLabel} ${shot.after ? u.shotLabelAfter : ""}`}>{shot.label}</span>
              <Image src={shot.src} alt={shot.alt} width={dim.width} height={dim.height} sizes="(min-width: 1040px) 500px, 96vw" className={u.compareImg} />
            </div>
          ))}
        </div>
        <p className={u.mediaCaption}>{media.caption}</p>
      </Modal>
    </>
  );
}
