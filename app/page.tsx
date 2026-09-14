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
import { HeroJourneySlider } from "@/components/home/hero-journey-slider";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export default async function HomePage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="overflow-x-hidden bg-[#f6f2ff]">
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
      {sections.beyondAi?.visible !== false ? (
        <BeyondAiSection content={sections.beyondAi} />
      ) : null}
      {sections.businessEmail?.visible !== false ? (
        <BusinessEmailSection content={sections.businessEmail} />
      ) : null}
      {sections.aiAssistant?.visible !== false ? (
        <AiAssistantSection content={sections.aiAssistant} />
      ) : null}
      {sections.whyChoose?.visible !== false ? (
        <WhyChooseSection content={sections.whyChoose} />
      ) : null}
      {sections.homeFaqs?.visible !== false ? (
        <HomeFaqsSection content={sections.homeFaqs} />
      ) : null}
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
