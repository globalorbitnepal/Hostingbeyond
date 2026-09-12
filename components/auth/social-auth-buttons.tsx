import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#181717"
        d="M12 .5C5.73.5.75 5.48.75 11.76c0 4.98 3.23 9.2 7.71 10.69.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.1-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.77 1.72 2.73 1.22.08-.95.39-1.6.71-1.97-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.12 1.15a10.8 10.8 0 0 1 5.68 0c2.17-1.45 3.12-1.15 3.12-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.78.54A11.03 11.03 0 0 0 23.25 11.76C23.25 5.48 18.27.5 12 .5z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

const PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    href: "/api/auth/oauth/google",
    icon: GoogleMark,
  },
  {
    id: "github",
    label: "Continue with GitHub",
    href: "/api/auth/oauth/github",
    icon: GitHubMark,
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    href: "/api/auth/oauth/facebook",
    icon: FacebookMark,
  },
] as const;

export function SocialAuthButtons({ dividerLabel }: { dividerLabel?: string }) {
  return (
    <>
      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
        <span className="h-px flex-1 bg-slate-200" />
        {dividerLabel || "OR"}
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid gap-2.5">
        {PROVIDERS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800",
                "transition hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <Icon />
              {item.label}
            </a>
          );
        })}
      </div>
    </>
  );
}
