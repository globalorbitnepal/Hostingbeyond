"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";

const tiles = [
  {
    id: "vps",
    title: "AI-managed VPS",
    body: "Run projects on a VPS with full root access and NVMe speed.",
    href: routes.vps,
    image: "/images/home/vps.webp",
  },
  {
    id: "cloud",
    title: "Cloud hosting",
    body: "Scale with more power when traffic spikes — no rebuild required.",
    href: routes.cloud,
    image: "/images/home/wordpress.webp",
  },
  {
    id: "apps",
    title: "Web app deploy",
    body: "Ship Node.js apps from GitHub onto the same HostingBeyond stack.",
    href: routes.hosting,
    image: "/images/journey/discover.webp",
  },
  {
    id: "agency",
    title: "Agency hosting",
    body: "One account to share access, manage client sites, and stay in control.",
    href: routes.hosting,
    image: "/images/journey/scale.webp",
  },
];

export function PowerTilesSection() {
  const reduce = useReducedMotion();

  return (
    <section className="hb-home-section hb-home-section--ice">
      <div className="hb-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-3xl"
        >
          <h2 className="font-heading text-[clamp(1.7rem,3.4vw,2.85rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
            More power when you need it
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-slate-600">
            Same purple platform. Extra horsepower for agencies, apps, and
            workloads that outgrow shared hosting.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.id}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: reduce ? 0 : index * 0.07, duration: 0.45 }}
            >
              <Link
                href={tile.href}
                className="group grid overflow-hidden rounded-[28px] bg-white ring-1 ring-[#e4e0ff] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(47,28,106,0.4)] sm:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="flex flex-col justify-center px-6 py-6">
                  <h3 className="text-[18px] font-extrabold text-[#2f1c6a]">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                    {tile.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6]">
                    Explore
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="relative min-h-[160px]">
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
