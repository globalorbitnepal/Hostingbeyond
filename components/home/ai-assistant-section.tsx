"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Layers,
  Play,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultAiAssistantSection,
  type CmsAiAssistantContent,
  type CmsAiAssistantHighlight,
  type CmsAiAssistantPrompt,
  type CmsAiAssistantStat,
} from "@/lib/orbit/defaults";

function PartnerMark({ id }: { id: string }) {
  const className = "size-[22px] shrink-0 sm:size-6";
  if (id === "claude") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <g fill="#DE7356" transform="translate(12 12)">
          <rect x="-1.15" y="-10.2" width="2.3" height="20.4" rx="1.15" />
          <rect
            x="-1.15"
            y="-10.2"
            width="2.3"
            height="20.4"
            rx="1.15"
            transform="rotate(45)"
          />
          <rect
            x="-1.15"
            y="-10.2"
            width="2.3"
            height="20.4"
            rx="1.15"
            transform="rotate(90)"
          />
          <rect
            x="-1.15"
            y="-10.2"
            width="2.3"
            height="20.4"
            rx="1.15"
            transform="rotate(135)"
          />
        </g>
      </svg>
    );
  }
  if (id === "openai") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#202123"
          d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.911 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .511 4.91 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zm-9.022 12.608a4.476 4.476 0 0 1-2.876-1.041l.142-.08 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.495 4.494zm-9.661-4.125a4.47 4.47 0 0 1-.534-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .78 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.499 4.499 0 0 1-6.141-1.646zM2.341 7.896a4.485 4.485 0 0 1 2.365-1.973V11.6a.766.766 0 0 0 .388.676l5.814 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.0 13.99A4.504 4.504 0 0 1 2.34 7.872zm16.596 3.856L13.104 8.364 15.12 7.2a.076.076 0 0 1 .07 0l4.831 2.791a4.494 4.494 0 0 1-.677 8.104v-5.677a.79.79 0 0 0-.407-.667zm2.011-3.023-.142-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.499 4.499 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.056V6.074a4.499 4.499 0 0 1 7.375-3.454l-.141.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
        />
      </svg>
    );
  }
  if (id === "gemini") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }
  if (id === "deepseek") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#4D6BFE"
          d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615z"
        />
      </svg>
    );
  }
  if (id === "openrouter") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#1A1A2E"
          d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="#43A047" transform="translate(12 12)">
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" />
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" transform="rotate(60)" />
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" transform="rotate(120)" />
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" transform="rotate(180)" />
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" transform="rotate(240)" />
        <ellipse cx="0" cy="-6.1" rx="2.55" ry="5.15" transform="rotate(300)" />
      </g>
      <circle cx="12" cy="12" r="2.35" fill="#2E7D32" />
    </svg>
  );
}

const highlightIcons: Record<CmsAiAssistantHighlight["icon"], typeof Zap> = {
  zap: Zap,
  layers: Layers,
  shield: Shield,
  users: Users,
};

const promptIcons: Record<CmsAiAssistantPrompt["icon"], typeof Globe> = {
  globe: Globe,
  layers: Layers,
  search: Search,
  refresh: RefreshCw,
};

const statIcons: Record<CmsAiAssistantStat["icon"], typeof Globe> = {
  globe: Globe,
  layers: Layers,
  users: Users,
};

function useChatScript(
  lines: string[],
  speed = 34,
  pause = 380,
  loopPause = 2400,
) {
  const [chars, setChars] = useState<string[]>(() => lines.map(() => ""));
  const [active, setActive] = useState(0);
  const script = lines.join("\u0000");

  useEffect(() => {
    const nextLines = script.split("\u0000");
    let cancelled = false;
    let timeout = 0;
    let line = 0;
    let col = 0;
    setChars(nextLines.map(() => ""));
    setActive(0);

    function tick() {
      if (cancelled) return;
      const target = nextLines[line] ?? "";
      if (col < target.length) {
        col += 1;
        const shown = target.slice(0, col);
        const current = line;
        setChars((prev) => {
          const copy = [...prev];
          copy[current] = shown;
          return copy;
        });
        timeout = window.setTimeout(tick, speed);
        return;
      }
      if (line < nextLines.length - 1) {
        timeout = window.setTimeout(() => {
          line += 1;
          col = 0;
          setActive(line);
          tick();
        }, pause);
        return;
      }
      timeout = window.setTimeout(() => {
        line = 0;
        col = 0;
        setChars(nextLines.map(() => ""));
        setActive(0);
        tick();
      }, loopPause);
    }

    timeout = window.setTimeout(tick, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [script, speed, pause, loopPause]);

  return { chars, active };
}

function Caret({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current" />
  );
}

function AssistantChat({ content }: { content: CmsAiAssistantContent }) {
  const lines = [
    content.helloTitle,
    content.helloSubtitle,
    ...content.prompts.map((prompt) => prompt.label),
  ];
  const { chars, active } = useChatScript(lines);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_32px_80px_-28px_rgba(37,80,130,0.45)] backdrop-blur-2xl sm:rounded-[32px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[#2563eb] text-white">
            <Sparkles className="size-4" />
          </span>
          <span>
            <span className="block text-[13px] font-extrabold text-slate-900">
              {content.botName}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {content.botStatus}
            </span>
          </span>
        </div>
        <span className="grid grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="size-1 rounded-full bg-slate-300" />
          ))}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="max-w-[92%] rounded-2xl bg-[#eef4ff] px-3.5 py-3">
          <p className="min-h-[22px] text-[15px] font-extrabold text-slate-900">
            {chars[0]}
            <Caret on={active === 0} />
          </p>
          <p className="mt-1 min-h-[18px] text-[12px] text-slate-500">
            {chars[1]}
            <Caret on={active === 1} />
          </p>
        </div>

        <div className="space-y-2">
          {content.prompts.map((prompt, index) => {
            const Icon = promptIcons[prompt.icon] ?? Globe;
            const lineIndex = index + 2;
            return (
              <button
                key={prompt.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-left text-[12px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(37,80,130,0.06)]"
              >
                <Icon className="size-3.5 shrink-0 text-[#2563eb]" />
                <span className="min-w-0 truncate">
                  {chars[lineIndex]}
                  <Caret on={active === lineIndex} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AssistantStage({ content }: { content: CmsAiAssistantContent }) {
  const photoSrc = content.imageUrl.includes("?")
    ? content.imageUrl
    : `${content.imageUrl}?v=scene5`;

  return (
    <div className="relative mx-auto min-h-[600px] w-full overflow-visible sm:min-h-[680px] lg:ml-auto lg:min-h-[740px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-24 h-[120%] w-[90%] rounded-full bg-[radial-gradient(ellipse_at_70%_40%,rgba(186,210,255,0.45),transparent_70%)] blur-3xl"
      />

      {content.imageUrl ? (
        <div className="absolute inset-y-0 right-[-6%] left-[4%] z-10">
          <Image
            src={photoSrc}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            unoptimized={
              isRuntimeMediaSrc(content.imageUrl) ||
              content.imageUrl.includes(".png")
            }
            className="object-contain object-right-bottom"
          />
        </div>
      ) : null}

      <div className="absolute top-[16%] left-0 z-20 w-[90%] max-w-[332px] sm:top-[18%] sm:w-[48%]">
        <AssistantChat content={content} />
      </div>

      {content.handwrittenNote ? (
        <div className="absolute top-3 right-2 z-30 hidden w-[150px] xl:block">
          <svg
            aria-hidden
            viewBox="0 0 64 36"
            className="absolute -top-1 -left-10 h-9 w-16 text-[#7dd3fc]"
          >
            <path
              d="M4 28 C 18 4, 42 6, 58 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M50 12 L58 18 L49 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-right font-serif text-[13px] leading-[1.25] text-[#38bdf8] italic">
            {content.handwrittenNote.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      <div className="absolute top-[28%] right-0 z-30 hidden w-[168px] flex-col gap-2 xl:flex">
        {content.stats.map((stat) => {
          const Icon = statIcons[stat.icon] ?? Globe;
          return (
            <div
              key={stat.id}
              className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-2.5 py-2 shadow-[0_12px_30px_rgba(37,80,130,0.12)] backdrop-blur-xl"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb]">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-slate-900">
                  {stat.title}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {stat.subtitle}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AiAssistantSection({
  content,
}: {
  content?: CmsAiAssistantContent;
}) {
  const data = content ?? defaultAiAssistantSection();

  return (
    <section className="relative isolate overflow-hidden bg-[#f7f8fc] pt-6 pb-0 sm:pt-8 lg:pb-0">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7fd_48%,#eef3fb_100%)]" />
        <div className="absolute top-[-18%] right-[-10%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(186,210,255,0.5),transparent_72%)] blur-3xl" />
        <div className="absolute right-[4%] bottom-[-8%] h-[42%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(196,216,255,0.28),transparent_74%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="mb-8 flex flex-nowrap items-center justify-center overflow-x-auto px-1 sm:mb-11">
          {data.partners.map((partner, index) => (
            <span
              key={partner.id}
              className="inline-flex shrink-0 items-center"
            >
              {index > 0 ? (
                <span
                  aria-hidden
                  className="mx-2.5 h-4 w-px shrink-0 bg-slate-300/90 sm:mx-4"
                />
              ) : null}
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <PartnerMark id={partner.id} />
                <span className="text-[12.5px] font-semibold tracking-tight whitespace-nowrap text-slate-800 sm:text-[14px]">
                  {partner.label}
                </span>
              </span>
            </span>
          ))}
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              {data.badge}
            </p>

            <h2 className="font-heading mt-6 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-6 space-y-3">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-extrabold text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-[13px] text-slate-500">
                        {item.subtitle}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/80 px-5 text-[14px] font-bold text-slate-800 shadow-[0_10px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[600px] sm:min-h-[680px] lg:min-h-[740px]">
            <AssistantStage content={data} />
          </div>
        </div>
      </div>
    </section>
  );
}
