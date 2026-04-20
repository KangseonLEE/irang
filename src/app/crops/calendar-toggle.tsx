"use client";

import { useState, type ReactNode } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./calendar-toggle.module.css";

interface CalendarToggleProps {
  children: ReactNode;
}

export function CalendarToggle({ children }: CalendarToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={s.section}>
      <button
        type="button"
        className={s.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="farming-calendar"
      >
        <Icon icon={Calendar} size="sm" />
        <span>{open ? "재배 캘린더 접기" : "재배 캘린더 보기"}</span>
        <ChevronDown
          size={16}
          className={`${s.chevron} ${open ? s.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id="farming-calendar" className={s.content}>
          {children}
        </div>
      )}
    </div>
  );
}
