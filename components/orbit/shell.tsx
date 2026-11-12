"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Bot,
  Building2,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  Code2,
  FileText,
  Files,
  FolderTree,
  Globe,
  ImageIcon,
  Languages,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Navigation,
  PenLine,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CANONICAL_HEADER_LOGO_SRC } from "@/components/shared/logo";
import type { OrbitAccessMode } from "@/lib/orbit/staff-access";
import { cn } from "@/lib/utils";

type NavLeaf = { href: string; label: string; icon: React.ElementType };

type NavGroup = {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavLeaf[];
};

const articlesChildren: NavLeaf[] = [
  { href: "/orbit/blog", label: "All articles", icon: FileText },
  { href: "/orbit/blog/new", label: "Add new article", icon: PenLine },
  { href: "/orbit/blog/categories", label: "Categories", icon: FolderTree },
  { href: "/orbit/blog/tags", label: "Tags", icon: Tags },
  { href: "/orbit/blog/media", label: "Media library", icon: ImageIcon },
  { href: "/orbit/blog/drafts", label: "Drafts", icon: FileText },
  {
    href: "/orbit/blog/scheduled",
    label: "Scheduled articles",
    icon: CalendarClock,
  },
  { href: "/orbit/blog/seo", label: "SEO settings", icon: Search },
];

const fullNav: NavGroup[] = [
  { href: "/orbit", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/orbit/beyond-master",
    label: "AI Agent",
    icon: Bot,
    children: [
      {
        href: "/orbit/beyond-master",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        href: "/orbit/beyond-master/controls",
        label: "Gemini usage & controls",
        icon: SlidersHorizontal,
      },
      {
        href: "/orbit/beyond-master/usage",
        label: "Usage analytics",
        icon: Activity,
      },
      {
        href: "/orbit/beyond-master/tickets",
        label: "Support Tickets",
        icon: FileText,
      },
      {
        href: "/orbit/beyond-master/conversations",
        label: "Agent conversations",
        icon: MessageSquare,
      },
      {
        href: "/orbit/beyond-master/knowledge",
        label: "Knowledge Base",
        icon: BookOpen,
      },
      {
        href: "/orbit/beyond-master/dns",
        label: "DNS Management",
        icon: Globe,
      },
      {
        href: "/orbit/beyond-master/security",
        label: "Security & Audit",
        icon: ShieldCheck,
      },
    ],
  },
  { href: "/orbit/pages", label: "Pages", icon: FileText },
  { href: "/orbit/about", label: "About Page", icon: Building2 },
  { href: "/orbit/editorial", label: "Footer pages", icon: Files },
  {
    href: "/orbit/users",
    label: "Customers",
    icon: Users,
    children: [
      { href: "/orbit/users", label: "Users & wallets", icon: Users },
      {
        href: "/orbit/customer-domains",
        label: "Customer domains",
        icon: Globe,
      },
      { href: "/orbit/wallets", label: "Wallet ledger", icon: Wallet },
    ],
  },
  { href: "/orbit/contact", label: "Contact Page", icon: Mail },
  {
    href: "/orbit/blog",
    label: "Articles",
    icon: FileText,
    children: articlesChildren,
  },
  {
    href: "/orbit/blog/tips-hub",
    label: "Editorial hubs",
    icon: LayoutDashboard,
    children: [
      { href: "/orbit/blog/tips-hub", label: "Tips hub", icon: Sparkles },
      { href: "/orbit/blog/updates-hub", label: "Updates", icon: Activity },
      {
        href: "/orbit/blog/case-studies-hub",
        label: "Case studies",
        icon: Building2,
      },
      { href: "/orbit/blog/growth-hub", label: "Growth hub", icon: Globe },
      { href: "/orbit/blog/docs-hub", label: "Documentation", icon: FileText },
    ],
  },
  { href: "/orbit/content", label: "Website Content", icon: Sparkles },
  { href: "/orbit/domains", label: "Domain Pages", icon: Globe },
  {
    href: "/orbit/domain-services",
    label: "Domain Services",
    icon: LayoutDashboard,
  },
  { href: "/orbit/domain-pricing", label: "Domain Pricing", icon: Tags },
  { href: "/orbit/domain-orders", label: "Domain Orders", icon: FileText },
  { href: "/orbit/invoices", label: "Invoices", icon: FileText },
  {
    href: "/orbit/domain-reconciliation",
    label: "Domain Reconciliation",
    icon: Activity,
  },
  {
    href: "/orbit/migration-requests",
    label: "Migration Requests",
    icon: ArrowLeftRight,
  },
  { href: "/orbit/wallets", label: "Wallet ledger (all)", icon: Wallet },
  { href: "/orbit/pricing", label: "Pricing Page", icon: Tags },
  { href: "/orbit/beyond-ai", label: "Beyond AI Product", icon: Sparkles },
  { href: "/orbit/business-email", label: "Business Email", icon: Mail },
  { href: "/orbit/hosting", label: "Web Hosting", icon: Globe },
  {
    href: "/orbit/hosting-orders",
    label: "Hosting orders",
    icon: Server,
  },
  { href: "/orbit/ssl", label: "SSL Certificates", icon: ShieldCheck },
  {
    href: "/orbit/hosting-products",
    label: "Hosting Plans",
    icon: Tags,
  },
  {
    href: "/orbit/developer-hosting",
    label: "Developer Hosting",
    icon: Code2,
  },
  { href: "/orbit/hosting-addons", label: "Hosting Add-ons", icon: Tags },
  { href: "/orbit/cloud", label: "Cloud Hosting", icon: Cloud },
  {
    href: "/orbit/website-migration",
    label: "Website Migration",
    icon: ArrowLeftRight,
  },
  {
    href: "/orbit/domain-transfer",
    label: "Transfer page copy",
    icon: ArrowLeftRight,
  },
  { href: "/orbit/navigation", label: "Navigation", icon: Navigation },
  { href: "/orbit/media", label: "Media Library", icon: ImageIcon },
  {
    href: "/orbit/currency-rates",
    label: "Currency & FX",
    icon: CircleDollarSign,
  },
  {
    href: "/orbit/languages",
    label: "Languages & Translation",
    icon: Languages,
  },
  { href: "/orbit/forms", label: "Forms", icon: FileText },
  { href: "/orbit/activity", label: "Activity Log", icon: Activity },
  { href: "/orbit/settings", label: "Settings", icon: Settings },
];

const supportOnlyNav: NavGroup[] = [
  {
    href: "/orbit/beyond-master/support-queue",
    label: "Human support queue",
    icon: MessageSquare,
  },
  {
    href: "/orbit/beyond-master/conversations",
    label: "Support conversations",
    icon: MessageSquare,
  },
];

export function OrbitShell({
  children,
  orbitAccess = "full",
}: {
  children: React.ReactNode;
  adminName: string;
  orbitAccess?: OrbitAccessMode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = useMemo(
    () => (orbitAccess === "support_only" ? supportOnlyNav : fullNav),
    [orbitAccess],
  );
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of orbitAccess === "support_only"
      ? supportOnlyNav
      : fullNav) {
      if (item.children?.length) {
        initial[item.href] =
          item.href === "/orbit/blog"
            ? pathname.startsWith("/orbit/blog")
            : pathname.startsWith(item.href);
      }
    }
    initial["/orbit/blog"] = pathname.startsWith("/orbit/blog");
    return initial;
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of nav) {
        if (item.children?.length && pathname.startsWith(item.href)) {
          next[item.href] = true;
        }
      }
      return next;
    });
  }, [pathname, nav]);

  async function logout() {
    await fetch("/api/orbit/auth/logout", { method: "POST" });
    router.replace("/orbit");
    router.refresh();
  }

  return (
    <div
      className="notranslate flex h-dvh flex-col overflow-hidden bg-[#e8eeff] text-slate-900"
      translate="no"
    >
      <header className="hb-orbit-mega sticky top-0 z-50 shrink-0 bg-white">
        <div className="hb-orbit-mega__row">
          <button
            type="button"
            className="hb-orbit-mega-icon hb-orbit-mega-icon--menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" strokeWidth={2.2} />
          </button>
          <Link href="/orbit" className="hb-orbit-mega-logo">
            <Image
              src={CANONICAL_HEADER_LOGO_SRC}
              alt="HostingBeyond"
              width={996}
              height={183}
              priority
              unoptimized
              className="hb-orbit-mega-logo__img"
            />
          </Link>
          <span className="hb-orbit-mega-badge">Orbit</span>
          <div className="min-w-0 flex-1" />
          <div className="hb-orbit-mega-actions">
            <Link
              href="/"
              className="hb-orbit-mega-pill hb-orbit-mega-pill--accent hidden sm:inline-flex"
            >
              Website
            </Link>
            <a
              href="/resources/blog"
              target="_blank"
              rel="noreferrer"
              className="hb-orbit-mega-pill hidden md:inline-flex"
            >
              View blog
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="hb-orbit-mega-pill hb-orbit-mega-pill--logout"
            >
              <LogOut className="size-4 shrink-0" strokeWidth={2.2} />
              <span className="hidden min-[420px]:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden">
        <aside
          className={cn(
            "hb-band-purple fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto overscroll-contain border-r border-white/15 p-4 text-white transition-transform lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:shrink-0 lg:translate-x-0 lg:self-stretch",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2 px-1 lg:hidden">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-white/70 uppercase">
              Orbit
            </p>
            <button
              type="button"
              className="rounded-lg border border-white/25 p-2"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/orbit"
                  ? pathname === "/orbit"
                  : pathname.startsWith(item.href);
              const hasChildren = Boolean(item.children?.length);
              const isOpen = Boolean(expanded[item.href]);

              return (
                <div key={item.href}>
                  <div
                    className={cn(
                      "flex items-center rounded-xl transition",
                      active && !hasChildren
                        ? "bg-white text-[#2f1c6a] shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                        : hasChildren && active
                          ? "bg-white/15 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-1 items-center gap-3 px-3 py-2.5 text-sm font-medium"
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-label={
                          isOpen
                            ? `Collapse ${item.label}`
                            : `Expand ${item.label}`
                        }
                        aria-expanded={isOpen}
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [item.href]: !prev[item.href],
                          }))
                        }
                        className="mr-2 rounded-md p-1 hover:bg-white/10"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    ) : null}
                  </div>

                  {hasChildren && isOpen ? (
                    <ul className="mt-1 ml-4 space-y-0.5 border-l border-white/20 pl-2">
                      {item.children?.map((child) => {
                        const childActive =
                          child.href === item.href
                            ? pathname === child.href
                            : pathname === child.href ||
                              pathname.startsWith(`${child.href}/`);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition",
                                childActive
                                  ? "bg-white/20 font-semibold text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white",
                              )}
                            >
                              <child.icon className="size-3.5" />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="hb-band-cream min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
