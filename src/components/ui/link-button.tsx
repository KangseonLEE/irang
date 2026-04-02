"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type LinkButtonProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>;

/**
 * Next.js Link styled as a shadcn Button.
 * 서버 컴포넌트에서도 사용 가능 (이 파일이 client boundary).
 */
export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
