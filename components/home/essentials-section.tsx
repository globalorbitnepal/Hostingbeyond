"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { hbSpring } from "@/lib/motion";

const cards = [
  {
    id: "hosting",
    title: "Hosting",
    body: "Fast, secure NVMe hosting for your site.",
    href: routes.hosting,
    image: "/images/home/wordpress.webp",
    alt: "WordPress site running on HostingBeyond",
  },
  {
    id: "domains",
    title: "Domains",
    body: "Find and register the right domain for your brand.",
    href: routes.domains,
    image: "/images/home/domains.webp",
    alt: "Searching for a domain name",
  },
  {
    id: "email",
    title: "Business email",
    body: "Build trust with email on your own domain.",
    href: routes.businessEmail,
    image: "/images/journey/beyond.webp",
    alt: "Branded inbox on a phone",
  },
  {
    id: "migrate",
    title: "Free website migration",
    body: "Move your existing site to HostingBeyond — we handle it.",
    href: routes.beyondAi,
    image: "/images/journey/create.webp",
    alt: "Team celebrating a successful site move",
  },
];

export function EssentialsSection() {
  const reduce = useReducedMotion();

  return (
    <section className="hb-home-section hb-home-section--white">
      <div className="hb-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={hbSpring}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
            Set up the essentials to go online
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#727586]">
            Domain, hosting, mail, and a free move — everything you need in one
            HostingBeyond account.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                delay: reduce ? 0 : index * 0.08,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={card.href}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-[#f4f5ff] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-28px_rgba(47,28,106,0.45)]"
              >
                <div className="relative h-[200px] overflow-hidden sm:h-[220px]">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <h3 className="text-[18px] font-extrabold tracking-tight text-[#2f1c6a]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[#727586]">
                    {card.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6]">
                    Learn more
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
