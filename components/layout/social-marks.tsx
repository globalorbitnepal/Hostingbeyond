import type { ReactNode } from "react";

import type { CmsFooterSocial } from "@/lib/orbit/defaults";

type Network = CmsFooterSocial["network"];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" aria-hidden>
      {children}
    </svg>
  );
}

const ICONS: Record<Network, () => ReactNode> = {
  facebook: () => (
    <Icon>
      <path
        fill="currentColor"
        d="M14.5 8.5h2.2V5.4h-2.2C12.1 5.4 11 7 11 9.2v1.3H8.8v3.1H11V22h3.3v-8.4h2.3l.5-3.1H14.3V9.5c0-.6.3-1 1.2-1z"
      />
    </Icon>
  ),
  instagram: () => (
    <Icon>
      <path
        fill="currentColor"
        d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 1.8H8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8A3.2 3.2 0 0 0 19.2 16V8A3.2 3.2 0 0 0 16 4.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zm4.6-3.5a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z"
      />
    </Icon>
  ),
  x: () => (
    <Icon>
      <path
        fill="currentColor"
        d="M17.6 3.5h2.7l-5.9 6.8 7 9.2h-5.5l-4.3-5.6-4.9 5.6H4l6.3-7.2L3.6 3.5h5.6l3.9 5.1 4.5-5.1zm-1 14.3h1.5L7.5 5h-1.6l10.7 12.8z"
      />
    </Icon>
  ),
  linkedin: () => (
    <Icon>
      <path
        fill="currentColor"
        d="M6.5 9.2H3.7V20h2.8V9.2zM5.1 4C4.1 4 3.3 4.8 3.3 5.8S4.1 7.6 5.1 7.6s1.8-.8 1.8-1.8S6.1 4 5.1 4zM20.3 13.1c0-3.2-1.7-4.7-4-4.7-1.8 0-2.7.9-3.2 1.6V9.2H10.3c0 1.2 0 10.8 0 10.8h2.8v-6c0-.3 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.6V20h2.8v-6.9z"
      />
    </Icon>
  ),
  youtube: () => (
    <Icon>
      <path
        fill="currentColor"
        d="M22 8.2a3 3 0 0 0-2.1-2.1C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.9.4A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12a31 31 0 0 0 .4 3.8 3 3 0 0 0 2.1 2.1c1.7.4 7.9.4 7.9.4s6.2 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2zM10 15.2V8.8l5.2 3.2z"
      />
    </Icon>
  ),
};

export function SocialMark({ network }: { network: Network }) {
  return ICONS[network]();
}
