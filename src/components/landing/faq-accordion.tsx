"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { FaqItem } from "@/lib/data/landing";
import s from "../../app/page.module.css";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className={s.faqList}>
      {items.map((item, i) => (
        <div key={i} className={s.faqItem}>
          <button
            className={s.faqQuestion}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            aria-expanded={openIdx === i}
          >
            <Plus
              size={16}
              className={openIdx === i ? s.faqIconOpen : s.faqIcon}
            />
            {item.q}
          </button>
          {openIdx === i && (
            <p className={s.faqAnswer}>{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
