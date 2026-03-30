import type { SVGProps } from "react";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  decorative?: boolean;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function BaseIcon({
  children,
  className,
  decorative,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 1.8,
  viewBox = "0 0 24 24",
}: SVGProps<SVGSVGElement> & {
  decorative: boolean;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative}
      className={joinClasses("inline-block size-[1em] shrink-0 align-middle", className)}
    >
      {children}
    </svg>
  );
}

function renderIcon(name: string, filled: boolean) {
  switch (name) {
    case "add":
      return <path d="M12 5v14M5 12h14" />;
    case "add_circle":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8.5v7M8.5 12h7" />
        </>
      );
    case "arrow_back":
      return <path d="M19 12H5m0 0 5-5m-5 5 5 5" />;
    case "arrow_forward":
      return <path d="M5 12h14m0 0-5-5m5 5-5 5" />;
    case "article":
      return (
        <>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      );
    case "autorenew":
      return (
        <>
          <path d="M20 6v5h-5" />
          <path d="M19 11a7 7 0 0 0-12-3" />
          <path d="M4 18v-5h5" />
          <path d="M5 13a7 7 0 0 0 12 3" />
        </>
      );
    case "account_circle":
      return (
        <>
          <circle cx="12" cy="8.5" r="3" />
          <path d="M6 18c1.5-2.7 4-4 6-4s4.5 1.3 6 4" />
          <circle cx="12" cy="12" r="9" />
        </>
      );
    case "admin_panel_settings":
      return (
        <>
          <path d="M12 3 6 5.5V11c0 4 2.4 7.6 6 9 3.6-1.4 6-5 6-9V5.5L12 3Z" />
          <path d="M9.5 11.5 11 13l3.5-3.5" />
        </>
      );
    case "alternate_email":
      return (
        <>
          <path d="M17.5 8.5a5.5 5.5 0 1 0-1.5 10.8c1.5 0 2.6-.7 3.3-1.8" />
          <path d="M17.5 8.5v5a1.5 1.5 0 0 0 3 0v-3a7.5 7.5 0 1 0-2.4 5.5" />
        </>
      );
    case "auto_awesome":
      return (
        <>
          <path d="m12 4 1.4 3.6L17 9l-3.6 1.4L12 14l-1.4-3.6L7 9l3.6-1.4L12 4Z" />
          <path d="m18.5 3 .6 1.6L20.7 5l-1.6.6-.6 1.6-.6-1.6L16.3 5l1.6-.4.6-1.6Z" />
          <path d="m5.5 14 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
        </>
      );
    case "block":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 8.5 7 7" />
        </>
      );
    case "cancel":
    case "close":
      return (
        <>
          {name === "cancel" ? <circle cx="12" cy="12" r="8.5" /> : null}
          <path d="m8 8 8 8M16 8l-8 8" />
        </>
      );
    case "check_circle":
    case "verified":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" fill={filled || name === "verified" ? "currentColor" : "none"} />
          <path d="m8.7 12.3 2.2 2.2 4.5-4.8" stroke={filled || name === "verified" ? "white" : "currentColor"} />
        </>
      );
    case "code":
      return <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12" />;
    case "credit_card":
      return (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
          <path d="M3.5 10h17M7 15h4" />
        </>
      );
    case "dashboard":
    case "dashboard_customize":
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="4.5" rx="1.5" />
          <rect x="13" y="10.5" width="7" height="9.5" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" />
          <path d="M5.5 6.5v7c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-7" />
          <path d="M5.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" />
        </>
      );
    case "delete":
      return (
        <>
          <path d="M5 7h14M9 7V5.5h6V7M8 7l.7 11h6.6L16 7" />
          <path d="M10 10.5v5M14 10.5v5" />
        </>
      );
    case "design_services":
      return (
        <>
          <path d="M6 18h12M8 18l1.5-9h5L16 18M10 9V6.5A2.5 2.5 0 0 1 12.5 4H14" />
          <path d="M8 9H6.5A2.5 2.5 0 0 1 4 6.5V5" />
        </>
      );
    case "desktop_mac":
      return (
        <>
          <rect x="4" y="5" width="16" height="10" rx="2" />
          <path d="M9 19h6M12 15v4" />
        </>
      );
    case "diamond":
      return <path d="m12 4 7 8-7 8-7-8 7-8Z" />;
    case "edit":
    case "edit_note":
    case "edit_document":
      return (
        <>
          <path d="M4 20h4l9.5-9.5-4-4L4 16v4Z" />
          <path d="m12.5 6.5 4 4M14 4l4 4" />
          {name !== "edit" ? <path d="M13 19h6M13 15h6" /> : null}
        </>
      );
    case "expand_more":
      return <path d="m7 10 5 5 5-5" />;
    case "folder":
      return <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />;
    case "folder_open":
      return (
        <>
          <path d="M3.5 9.5A2.5 2.5 0 0 1 6 7h4l2 2h6a2 2 0 0 1 1.9 2.6l-1.2 4A2.5 2.5 0 0 1 16.3 18H6.5A2.5 2.5 0 0 1 4 15.5v-6Z" />
        </>
      );
    case "gavel":
      return (
        <>
          <path d="m14 5 5 5M12 7l5 5M7 12l5 5M5 14l5 5M4 20h8" />
          <rect x="10" y="4" width="5" height="2.5" rx="1" transform="rotate(45 12.5 5.25)" />
          <rect x="5" y="12" width="5" height="2.5" rx="1" transform="rotate(45 7.5 13.25)" />
        </>
      );
    case "group":
    case "groups":
      return (
        <>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="16" cy="10" r="2" />
          <path d="M4.5 18c1.2-2.4 3.1-3.5 5.2-3.5 2 0 4 1.1 5.2 3.5" />
          <path d="M13.5 17.5c.7-1.5 2-2.3 3.5-2.3 1.1 0 2.2.4 3 1.3" />
        </>
      );
    case "headset_mic":
      return (
        <>
          <path d="M5 12a7 7 0 0 1 14 0" />
          <rect x="4" y="11.5" width="2.5" height="5" rx="1" />
          <rect x="17.5" y="11.5" width="2.5" height="5" rx="1" />
          <path d="M20 16.5v1a2 2 0 0 1-2 2h-2" />
          <path d="M14 19h2" />
        </>
      );
    case "image":
    case "add_photo_alternate":
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m7 17 4-4 3 3 3-2 2 3" />
          {name === "add_photo_alternate" ? <path d="M18 7V3m-2 2h4" /> : null}
        </>
      );
    case "insights":
    case "trending_up":
      return <path d="M5 16l4-4 3 3 6-7M15 8h3v3" />;
    case "landscape":
      return (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="m6.5 16 4.5-5 3 3 2.5-2.5L19 16" />
        </>
      );
    case "language":
    case "public":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.5 2.3 4 5.4 4 8.5s-1.5 6.2-4 8.5c-2.5-2.3-4-5.4-4-8.5s1.5-6.2 4-8.5Z" />
        </>
      );
    case "lock":
      return (
        <>
          <rect x="6" y="11" width="12" height="9" rx="2" />
          <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" />
        </>
      );
    case "logout":
      return (
        <>
          <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
          <path d="M13 8l4 4-4 4M8 12h9" />
        </>
      );
    case "menu":
      return <path d="M4 7h16M4 12h16M4 17h16" />;
    case "monitoring":
      return (
        <>
          <path d="M4 19h16" />
          <path d="M7 16V9M12 16V5M17 16v-7" />
        </>
      );
    case "notifications":
      return (
        <>
          <path d="M6.5 16.5V11a5.5 5.5 0 1 1 11 0v5.5l1.5 1.5H5l1.5-1.5Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </>
      );
    case "palette":
      return (
        <>
          <path d="M12 4a8 8 0 1 0 0 16h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h1a4 4 0 0 0 0-8h-1Z" />
          <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
        </>
      );
    case "person":
    case "person_outline":
      return (
        <>
          <circle cx="12" cy="8.5" r="3" />
          <path d="M6 18c1.5-2.7 4-4 6-4s4.5 1.3 6 4" />
        </>
      );
    case "person_add":
      return (
        <>
          <circle cx="10" cy="8.5" r="3" />
          <path d="M4.5 18c1.3-2.6 3.4-4 5.5-4 1.3 0 2.6.4 3.7 1.3" />
          <path d="M18 8v6M15 11h6" />
        </>
      );
    case "person_search":
      return (
        <>
          <circle cx="10" cy="8.5" r="3" />
          <path d="M4.5 18c1.2-2.5 3.3-4 5.5-4 1.4 0 2.8.5 4 1.5" />
          <circle cx="17" cy="16.5" r="2.5" />
          <path d="m18.8 18.3 2.2 2.2" />
        </>
      );
    case "report":
    case "warning":
      return (
        <>
          <path d="M12 4 20 19H4L12 4Z" />
          <path d="M12 9v4M12 16h.01" />
        </>
      );
    case "school":
      return (
        <>
          <path d="m3 10 9-5 9 5-9 5-9-5Z" />
          <path d="M7 12.2V16c0 1.8 2.2 3 5 3s5-1.2 5-3v-3.8" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="5.5" />
          <path d="m16 16 4 4" />
        </>
      );
    case "search_off":
      return (
        <>
          <circle cx="11" cy="11" r="5.5" />
          <path d="m16 16 4 4M5 5l14 14" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4.5v2M12 17.5v2M19.5 12h-2M6.5 12h-2M17 7l-1.5 1.5M8.5 15.5 7 17M17 17l-1.5-1.5M8.5 8.5 7 7" />
        </>
      );
    case "smartphone":
      return (
        <>
          <rect x="8" y="3.5" width="8" height="17" rx="2" />
          <path d="M11 6h2M11.5 17.5h1" />
        </>
      );
    case "star":
      return (
        <path
          d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.3L12 16l-4.6 2.5.9-5.3-3.8-3.7 5.2-.8L12 4Z"
          fill={filled ? "currentColor" : "none"}
        />
      );
    case "tablet_mac":
      return <rect x="6.5" y="4" width="11" height="16" rx="2" />;
    case "tune":
      return <path d="M5 7h8M15 7h4M10 7v10M5 17h3M12 17h7M15 17V7" />;
    case "visibility":
      return (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      );
    case "visibility_off":
      return (
        <>
          <path d="M3 3l18 18M2.5 12s3.5-6 9.5-6c2.2 0 4.1.8 5.7 1.8M21.5 12s-3.5 6-9.5 6c-2.2 0-4.1-.8-5.7-1.8" />
          <path d="M10.6 10.6A2 2 0 0 0 10 12a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
        </>
      );
    case "vpn_key":
      return (
        <>
          <circle cx="8" cy="12" r="3" />
          <path d="M11 12h9M17 12v3M14 12v2" />
        </>
      );
    case "web":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <path d="M3.5 9h17M8 5v14M16 5v14" />
        </>
      );
    default:
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v4M12 16h.01" />
        </>
      );
  }
}

export default function Icon({ name, className, filled = false, decorative = true }: IconProps) {
  return (
    <BaseIcon className={className} decorative={decorative}>
      {renderIcon(name, filled)}
    </BaseIcon>
  );
}
