import { SiteHeader } from "@/components/layout";
import {
  HeroSection,
  HostingPlansSection,
  HostingTypesSection,
  ProductsSection,
} from "@/components/home";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export default async function HomePage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="overflow-x-hidden bg-[#07122a]">
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

      {sections.products.visible ? (
        <ProductsSection content={sections.products} />
      ) : null}
      {sections.hostingTypes?.visible !== false ? (
        <HostingTypesSection content={sections.hostingTypes} />
      ) : null}
      {sections.hostingPlans?.visible !== false ? (
        <HostingPlansSection content={sections.hostingPlans} />
      ) : null}
    </div>
  );
}
