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
} from "@/components/home";
import { PartnerLogoStrip } from "@/components/home/partner-logo-strip";
import { SectionStoryBand } from "@/components/home/section-story-band";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export default async function HomePage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="overflow-x-hidden bg-[#f4f8fd]">
      {/* Premium sky-blue glass hero — matches speaker scene glass */}
      <div className="relative flex min-h-0 flex-col bg-[#b5d3f2] lg:min-h-svh">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(165deg,#b5d3f2_0%,#b7d4f0_28%,#c5daf0_58%,#bdd8f0_100%)]" />
          <div className="absolute top-[-20%] left-[-12%] h-[60%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.42),transparent_68%)] blur-3xl" />
          <div className="absolute top-[-8%] right-[-8%] h-[55%] w-[50%] rounded-full bg-[radial-gradient(ellipse,rgba(155,205,240,0.48),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-[8%] left-[20%] h-[40%] w-[50%] rounded-full bg-[radial-gradient(ellipse,rgba(125,180,230,0.22),transparent_70%)] blur-3xl" />
        </div>

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

      {sections.solutions ? (
        <SolutionsSection content={sections.solutions} />
      ) : null}
      <SectionStoryBand
        eyebrow="One platform"
        lead="Everything you need to"
        words={["host", "launch", "grow", "scale"]}
        description="Domains, NVMe hosting, business email, and Beyond AI in one HostingBeyond account — not five vendors taped together."
      />
      <PartnerLogoStrip partners={sections.hero.technologyPartners} />
      <SectionStoryBand
        eyebrow="Start here"
        lead="Plans built to"
        words={["go live", "stay fast", "stay online"]}
        description="Choose a plan. SSL, backups, and 24/7 support ship with it so the site can go public the same day."
      />
      {sections.hostingPlans?.visible !== false ? (
        <HostingPlansSection content={sections.hostingPlans} />
      ) : null}
      <SectionStoryBand
        eyebrow="Beyond hosting"
        lead="Then let AI"
        words={["write", "design", "publish", "iterate"]}
        description="Beyond AI turns a prompt into pages you host on the same stack — no extra platform to learn."
      />
      {sections.beyondAi?.visible !== false ? (
        <BeyondAiSection content={sections.beyondAi} />
      ) : null}
      <SectionStoryBand
        eyebrow="Look professional"
        lead="Email that"
        words={["builds trust", "wins clients", "stays yours"]}
        description="Business mail on your own domain, next to hosting — not a free inbox beside a serious brand."
      />
      {sections.businessEmail?.visible !== false ? (
        <BusinessEmailSection content={sections.businessEmail} />
      ) : null}
      <SectionStoryBand
        eyebrow="Always on"
        lead="Help that"
        words={["answers", "migrates", "fixes", "stays"]}
        description="Real people and the HostingBeyond assistant in the panel, whenever the site needs a hand."
      />
      {sections.aiAssistant?.visible !== false ? (
        <AiAssistantSection content={sections.aiAssistant} />
      ) : null}
      {sections.whyChoose?.visible !== false ? (
        <WhyChooseSection content={sections.whyChoose} />
      ) : null}
      <SectionStoryBand
        eyebrow="Before you buy"
        lead="Clear answers before you"
        words={["migrate", "launch", "scale"]}
        description="Hosting and SEO questions written for real buyers — and for search."
      />
      {sections.homeFaqs?.visible !== false ? (
        <HomeFaqsSection content={sections.homeFaqs} />
      ) : null}
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
