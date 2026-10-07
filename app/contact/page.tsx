import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { ContactForm } from "@/components/contact/contact-form";
import {
  ContactChannels,
  ContactCtaBand,
  ContactFaq,
  ContactHelpLinks,
  ContactIntro,
  ContactMedia,
  ContactOffices,
  ContactPremiumHero,
  ContactResponse,
} from "@/components/contact/contact-page-sections";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { getContactPageContent, getSiteSettings } from "@/lib/orbit/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPageContent();
  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: routes.contact,
  });
}

export default async function ContactPage() {
  const [content, settings] = await Promise.all([
    getContactPageContent(),
    getSiteSettings(),
  ]);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: routes.contact },
  ]);

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: content.seoTitle,
    description: content.seoDescription,
    url: new URL(routes.contact, siteConfig.url).toString(),
  };

  const faqJsonLd =
    content.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faqs
            .filter((f) => f.visible !== false && f.question && f.answer)
            .map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        }
      : null;

  return (
    <BlogSiteShell>
      <Script
        id="contact-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="contact-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id="contact-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <ContactPremiumHero
          content={content}
          contactEmail={settings.contactEmail}
        />
      </div>

      <div className="mx-auto mt-10 max-w-[1320px] space-y-14 px-1 sm:px-0">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#673de6]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-[#1a1035]">Contact</li>
          </ol>
        </nav>

        <ContactIntro content={content} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <ContactForm
            formTitle={content.formTitle}
            formDescription={content.formDescription}
            successTitle={content.formSuccessTitle}
            successMessage={content.formSuccessMessage}
          />
          <aside className="space-y-4 rounded-3xl border border-violet-100 bg-violet-50/50 p-6 text-sm text-slate-600">
            <p className="font-bold text-[#1a1035]">Quick tips</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Include your account email for faster lookup.</li>
              <li>Add domain names for DNS or SSL issues.</li>
              <li>Check Tips &amp; guides for common how-tos.</li>
            </ul>
            {settings.contactPhone ? (
              <p>
                Phone:{" "}
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="font-semibold text-[#673de6]"
                >
                  {settings.contactPhone}
                </a>
              </p>
            ) : null}
          </aside>
        </div>

        <ContactChannels content={content} />
        <ContactHelpLinks content={content} />
        <ContactMedia content={content} />
        <ContactOffices content={content} />
        <ContactResponse content={content} />
        <ContactFaq content={content} />
        <ContactCtaBand content={content} />
      </div>
    </BlogSiteShell>
  );
}
