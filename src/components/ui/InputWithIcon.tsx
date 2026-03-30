"use client";

import type { InputHTMLAttributes } from "react";
import Icon from "@/components/ui/Icon";

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: string;
  wrapperClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function InputWithIcon({
  icon,
  wrapperClassName,
  inputClassName,
  iconClassName,
  ...inputProps
}: InputWithIconProps) {
  return (
    <div className={joinClasses("relative w-full", wrapperClassName)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon
          name={icon}
          className={joinClasses("text-xl text-on-surface-variant", iconClassName)}
        />
      </div>
      <input
        {...inputProps}
        className={joinClasses(
          "w-full rounded-2xl border border-outline-variant/30 bg-surface-container-lowest pl-14 pr-4 text-sm text-on-surface shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20",
          inputClassName
        )}
      />
    </div>
  );
}
