import { SiteFooter, SiteHeader } from "@/components/layout";
import {
  HeroSection,
  HostingPlansSection,
  BeyondAiSection,
  BusinessEmailSection,
  AiAssistantSection,
  SolutionsSection,
  WhyChooseSection,
  HomeFaqsSection,
  EssentialsSection,
  StorySplitSection,
  PowerTilesSection,
  ProofSliderSection,
  CloseCtaSection,
} from "@/components/home";
import { PartnerLogoStrip } from "@/components/home/partner-logo-strip";
import { HeroJourneySlider } from "@/components/home/hero-journey-slider";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";
import { routes } from "@/config/routes";

export default async function HomePage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="overflow-x-hidden bg-white">
      <div className="hb-hero-hostinger relative flex min-h-0 flex-col lg:min-h-svh">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />
        {sections.hero.visible ? <HeroSection content={sections.hero} /> : null}
      </div>
      {sections.journey?.visible !== false ? (
        <HeroJourneySlider content={sections.journey} />
      ) : null}

      {sections.solutions ? (
        <SolutionsSection content={sections.solutions} />
      ) : null}
      <PartnerLogoStrip partners={sections.hero.technologyPartners} />
      {sections.hostingPlans?.visible !== false ? (
        <HostingPlansSection content={sections.hostingPlans} />
      ) : null}

      <EssentialsSection />

      {sections.beyondAi?.visible !== false ? (
        <BeyondAiSection content={sections.beyondAi} />
      ) : null}

      <StorySplitSection
        eyebrow="Hands-on control"
        heading="Want more control over what you build?"
        tone="white"
        slides={[
          {
            id: "wordpress",
            label: "WordPress",
            title: "Hosting for WordPress",
            body: "AI-assisted, plugin-rich, fully managed WordPress on NVMe — 1-click install, free SSL, and daily backups.",
            ctaLabel: "Explore WordPress hosting",
            ctaHref: routes.hosting,
            image: "/images/home/wordpress.webp",
            alt: "WordPress editor on a laptop",
          },
          {
            id: "templates",
            label: "Templates",
            title: "Designer-made templates",
            body: "Start from a niche-ready layout, then keep prompting Beyond AI until it looks like your brand.",
            ctaLabel: "Explore templates",
            ctaHref: routes.beyondAi,
            image: "/images/home/templates.webp",
            alt: "Website template gallery on a studio monitor",
          },
        ]}
      />

      {sections.businessEmail?.visible !== false ? (
        <BusinessEmailSection content={sections.businessEmail} />
      ) : null}

      <StorySplitSection
        eyebrow="Grow"
        heading="Bring customers back after you launch"
        tone="ice"
        imageFirst
        slides={[
          {
            id: "shop",
            label: "Ecommerce",
            title: "Grow sales and keep more of what you earn",
            body: "Sell with branded checkout, 0% platform transaction fees on hosting, and a store that sits next to your mail.",
            ctaLabel: "Explore ecommerce hosting",
            ctaHref: routes.hosting,
            image: "/images/home/ecommerce.webp",
            alt: "Founder packing orders beside an ecommerce dashboard",
          },
          {
            id: "mail",
            label: "Email marketing",
            title: "Campaigns from the same branded inbox",
            body: "Draft, send, and follow up with Beyond Reach — AI writes, you approve, customers come back.",
            ctaLabel: "Explore business email",
            ctaHref: routes.businessEmail,
            image: "/images/journey/beyond.webp",
            alt: "Customer reading a branded campaign on a phone",
          },
        ]}
      />

      {sections.aiAssistant?.visible !== false ? (
        <AiAssistantSection content={sections.aiAssistant} />
      ) : null}

      <PowerTilesSection />

      {sections.whyChoose?.visible !== false ? (
        <WhyChooseSection content={sections.whyChoose} />
      ) : null}

      <ProofSliderSection />
      <CloseCtaSection />

      {sections.homeFaqs?.visible !== false ? (
        <HomeFaqsSection content={sections.homeFaqs} />
      ) : null}
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
