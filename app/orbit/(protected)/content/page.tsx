"use client";

import { useEffect, useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import {
  defaultTechnologyPartners,
  type CmsDomainTld,
  type CmsHomeSections,
  type CmsHostingGuarantee,
  type CmsHostingPlan,
  type CmsHostingTypeCard,
  type CmsLoginFeature,
  type CmsLoginPage,
  type CmsProductOffer,
  type CmsTechPartner,
} from "@/lib/orbit/defaults";

export default function OrbitContentPage() {
  const [sections, setSections] = useState<CmsHomeSections | null>(null);
  const [login, setLogin] = useState<CmsLoginPage | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingLogin, setSavingLogin] = useState(false);

  useEffect(() => {
    void (async () => {
      const [homeRes, loginRes] = await Promise.all([
        fetch("/api/orbit/content/home"),
        fetch("/api/orbit/content/login"),
      ]);
      const homeJson = await homeRes.json();
      const loginJson = await loginRes.json();
      if (homeRes.ok) setSections(homeJson.sections);
      else setStatus(homeJson.error || "Failed to load content");
      if (loginRes.ok) setLogin(loginJson.login);
    })();
  }, []);

  async function save() {
    if (!sections) return;
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/orbit/content/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    const json = await res.json();
    setSaving(false);
    setStatus(res.ok ? "Saved successfully" : json.error || "Save failed");
    if (res.ok && json.sections) setSections(json.sections);
  }

  async function saveLogin() {
    if (!login) return;
    setSavingLogin(true);
    setStatus("");
    const res = await fetch("/api/orbit/content/login", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });
    const json = await res.json();
    setSavingLogin(false);
    setStatus(
      res.ok ? "Login page saved successfully" : json.error || "Save failed",
    );
    if (res.ok && json.login) setLogin(json.login);
  }

  function updateOffer(index: number, patch: Partial<CmsProductOffer>) {
    if (!sections) return;
    const offers = [...sections.products.offers];
    offers[index] = { ...offers[index], ...patch };
    setSections({
      ...sections,
      products: { ...sections.products, offers },
    });
  }

  function moveOffer(index: number, direction: -1 | 1) {
    if (!sections) return;
    const target = index + direction;
    if (target < 0 || target >= sections.products.offers.length) return;
    const offers = [...sections.products.offers];
    const [item] = offers.splice(index, 1);
    offers.splice(target, 0, item);
    setSections({
      ...sections,
      products: {
        ...sections.products,
        offers: offers.map((offer, order) => ({ ...offer, order })),
      },
    });
  }

  if (!sections) {
    return <p className="text-sm text-[var(--hb-muted)]">Loading content…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Website Content</h1>
          <p className="mt-1 text-sm text-[var(--hb-muted)]">
            Full editor for homepage, hosting plans, and the /login page.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/login"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-[var(--hb-muted)] hover:text-white"
          >
            Preview login
          </a>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-[var(--hb-muted)] hover:text-white"
          >
            Preview site
          </a>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save home"}
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}

      {/* HERO */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Hero section</h2>
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={sections.hero.visible}
              onChange={(e) =>
                setSections({
                  ...sections,
                  hero: { ...sections.hero, visible: e.target.checked },
                })
              }
            />
            Visible
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={sections.hero.eyebrow ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, eyebrow: value },
              })
            }
          />
          <Field
            label="Search button text"
            value={sections.hero.searchButtonLabel ?? "Search"}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, searchButtonLabel: value },
              })
            }
          />
        </div>
        <Field
          label="Main heading"
          value={sections.hero.headline}
          onChange={(value) =>
            setSections({
              ...sections,
              hero: { ...sections.hero, headline: value },
            })
          }
        />
        <Field
          label="Highlighted heading"
          value={sections.hero.headlineAccent}
          onChange={(value) =>
            setSections({
              ...sections,
              hero: { ...sections.hero, headlineAccent: value },
            })
          }
        />
        <TextArea
          label="Description"
          value={sections.hero.description}
          onChange={(value) =>
            setSections({
              ...sections,
              hero: { ...sections.hero, description: value },
            })
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Search placeholder"
            value={sections.hero.searchPlaceholder}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, searchPlaceholder: value },
              })
            }
          />
          <Field
            label="Bulk search label"
            value={sections.hero.bulkSearchLabel}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, bulkSearchLabel: value },
              })
            }
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <OrbitImageField
            label="Speaker image (clear cutout)"
            value={sections.hero.speakerImage ?? ""}
            onChange={(url) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, speakerImage: url },
              })
            }
          />
          <OrbitImageField
            label="Hero atmosphere / background plate"
            value={sections.hero.backgroundImage}
            onChange={(url) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, backgroundImage: url },
              })
            }
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextArea
            label="Left glass panel text (one line per row)"
            value={sections.hero.glassPanelLeft ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, glassPanelLeft: value },
              })
            }
          />
          <TextArea
            label="Right glass panel caption"
            value={sections.hero.glassPanelRight ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hero: { ...sections.hero, glassPanelRight: value },
              })
            }
          />
        </div>
      </section>

      {/* DOMAIN PRICING */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h2 className="font-semibold">Domain TLD Pricing</h2>
          <p className="mt-0.5 text-xs text-[var(--hb-muted)]">
            Edit the domain extension prices shown in the hero search bar.
          </p>
        </div>
        <DomainPricingEditor
          pricing={
            sections.hero.domainPricing ?? [
              { tld: ".com", priceLabel: "$7.99/yr", visible: true },
              { tld: ".net", priceLabel: "$6.99/yr", visible: true },
              { tld: ".org", priceLabel: "$5.99/yr", visible: true },
              { tld: ".co", priceLabel: "$4.99/yr", visible: true },
              { tld: ".dev", priceLabel: "$3.99/yr", visible: true },
            ]
          }
          onChange={(domainPricing) =>
            setSections({
              ...sections,
              hero: { ...sections.hero, domainPricing },
            })
          }
        />
      </section>

      {/* TECHNOLOGY / TRUST STRIP */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h2 className="font-semibold">Technology / trust logos</h2>
          <p className="mt-0.5 text-xs text-[var(--hb-muted)]">
            Control visibility, order, labels and optional custom logo images
            for the strip under the hero.
          </p>
        </div>
        <TechPartnersEditor
          partners={
            sections.hero.technologyPartners ?? defaultTechnologyPartners()
          }
          onChange={(technologyPartners) =>
            setSections({
              ...sections,
              hero: { ...sections.hero, technologyPartners },
            })
          }
        />
      </section>

      {/* PRODUCTS */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Service cards section</h2>
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={sections.products.visible}
              onChange={(e) =>
                setSections({
                  ...sections,
                  products: {
                    ...sections.products,
                    visible: e.target.checked,
                  },
                })
              }
            />
            Visible
          </label>
        </div>
        <Field
          label="Eyebrow"
          value={sections.products.eyebrow}
          onChange={(value) =>
            setSections({
              ...sections,
              products: { ...sections.products, eyebrow: value },
            })
          }
        />
        <Field
          label="Title"
          value={sections.products.title}
          onChange={(value) =>
            setSections({
              ...sections,
              products: { ...sections.products, title: value },
            })
          }
        />
        <Field
          label="Title accent"
          value={sections.products.titleAccent}
          onChange={(value) =>
            setSections({
              ...sections,
              products: { ...sections.products, titleAccent: value },
            })
          }
        />
        <TextArea
          label="Description"
          value={sections.products.description}
          onChange={(value) =>
            setSections({
              ...sections,
              products: { ...sections.products, description: value },
            })
          }
        />

        {sections.products.offers.map((offer, index) => (
          <div
            key={offer.id}
            className="space-y-3 rounded-xl border border-white/10 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-wide uppercase">
                {offer.title || offer.id} card
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
                  <input
                    type="checkbox"
                    checked={offer.visible !== false}
                    onChange={(e) =>
                      updateOffer(index, { visible: e.target.checked })
                    }
                  />
                  Visible
                </label>
                <button
                  type="button"
                  onClick={() => moveOffer(index, -1)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOffer(index, 1)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs"
                >
                  ↓
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Title"
                value={offer.title}
                onChange={(value) => updateOffer(index, { title: value })}
              />
              <Field
                label="Badge"
                value={offer.badge}
                onChange={(value) => updateOffer(index, { badge: value })}
              />
              <Field
                label="Subtitle"
                value={offer.subtitle ?? ""}
                onChange={(value) => updateOffer(index, { subtitle: value })}
              />
              <Field
                label="Accent (blue / purple / cyan)"
                value={offer.accent}
                onChange={(value) =>
                  updateOffer(index, {
                    accent:
                      value === "purple" || value === "cyan" ? value : "blue",
                  })
                }
              />
              <Field
                label="Price override (optional USD display)"
                value={offer.priceOverride ?? ""}
                onChange={(value) =>
                  updateOffer(index, { priceOverride: value })
                }
              />
              <Field
                label="Billing period / price suffix"
                value={offer.priceSuffix}
                onChange={(value) => updateOffer(index, { priceSuffix: value })}
              />
              <Field
                label="Promotional text / highlight"
                value={offer.highlight ?? ""}
                onChange={(value) => updateOffer(index, { highlight: value })}
              />
              <Field
                label="Small pricing label"
                value={offer.priceLabel ?? ""}
                onChange={(value) => updateOffer(index, { priceLabel: value })}
              />
              <Field
                label="CTA text"
                value={offer.ctaLabel}
                onChange={(value) => updateOffer(index, { ctaLabel: value })}
              />
              <Field
                label="CTA link"
                value={offer.ctaHref}
                onChange={(value) => updateOffer(index, { ctaHref: value })}
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
              <input
                type="checkbox"
                checked={Boolean(offer.searchEnabled)}
                onChange={(e) =>
                  updateOffer(index, { searchEnabled: e.target.checked })
                }
              />
              Show domain search under CTA
            </label>

            {offer.searchEnabled ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Search placeholder"
                  value={offer.searchPlaceholder ?? ""}
                  onChange={(value) =>
                    updateOffer(index, { searchPlaceholder: value })
                  }
                />
                <Field
                  label="Search button text"
                  value={offer.searchButtonLabel ?? "Search"}
                  onChange={(value) =>
                    updateOffer(index, { searchButtonLabel: value })
                  }
                />
              </div>
            ) : null}

            <FeatureEditor
              features={offer.features}
              onChange={(features) => updateOffer(index, { features })}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <OrbitImageField
                label="Card icon image"
                value={offer.iconUrl ?? ""}
                onChange={(url) => updateOffer(index, { iconUrl: url })}
              />
              <OrbitImageField
                label="Card illustration image"
                value={offer.illustrationUrl ?? ""}
                onChange={(url) => updateOffer(index, { illustrationUrl: url })}
              />
            </div>
          </div>
        ))}
      </section>

      {/* HOSTING TYPES — 4 glass cards */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Hosting types (4 glass cards)</h2>
            <p className="mt-0.5 text-xs text-[var(--hb-muted)]">
              Full A–Z editor for Cloud / eCommerce / WordPress / Reseller cards
              — titles, links, icons, and in-card images.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={sections.hostingTypes?.visible !== false}
              onChange={(e) =>
                setSections({
                  ...sections,
                  hostingTypes: {
                    ...sections.hostingTypes,
                    cards: sections.hostingTypes?.cards ?? [],
                    visible: e.target.checked,
                  },
                })
              }
            />
            Visible
          </label>
        </div>

        {(sections.hostingTypes?.cards ?? []).map((card, index) => (
          <HostingTypeCardEditor
            key={card.id}
            card={card}
            onChange={(patch) => {
              const cards = [...(sections.hostingTypes?.cards ?? [])];
              cards[index] = { ...cards[index], ...patch };
              setSections({
                ...sections,
                hostingTypes: {
                  ...sections.hostingTypes,
                  visible: sections.hostingTypes?.visible !== false,
                  cards,
                },
              });
            }}
            onMove={(direction) => {
              const target = index + direction;
              const cards = [...(sections.hostingTypes?.cards ?? [])];
              if (target < 0 || target >= cards.length) return;
              const [item] = cards.splice(index, 1);
              cards.splice(target, 0, item);
              setSections({
                ...sections,
                hostingTypes: {
                  ...sections.hostingTypes,
                  visible: sections.hostingTypes?.visible !== false,
                  cards: cards.map((c, order) => ({ ...c, order })),
                },
              });
            }}
            onRemove={() => {
              setSections({
                ...sections,
                hostingTypes: {
                  ...sections.hostingTypes,
                  visible: sections.hostingTypes?.visible !== false,
                  cards: (sections.hostingTypes?.cards ?? []).filter(
                    (_, i) => i !== index,
                  ),
                },
              });
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => {
            const cards = sections.hostingTypes?.cards ?? [];
            setSections({
              ...sections,
              hostingTypes: {
                ...sections.hostingTypes,
                visible: sections.hostingTypes?.visible !== false,
                cards: [
                  ...cards,
                  {
                    id: `type-${Date.now()}`,
                    visible: true,
                    order: cards.length,
                    title: "New Hosting Type",
                    description: "Describe this hosting product.",
                    href: "/hosting",
                    accent: cards.length % 2 === 0 ? "blue" : "purple",
                    icon: "cloud",
                    ctaLabel: "View Plans",
                    imageUrl: "/images/hosting/cloud.jpg",
                    imageAlt: "Hosting visual",
                    overlayStyle: "cloud",
                    overlayCaption: "www",
                    overlayStat: "↑ 85.2%",
                    overlayPills: ["UPTIME", "RELIABILITY", "SECURITY"],
                  },
                ],
              },
            });
          }}
          className="rounded-xl border border-dashed border-white/20 px-4 py-2 text-xs font-semibold text-white/70 hover:border-white/40 hover:text-white"
        >
          + Add hosting type card
        </button>
      </section>

      {/* HOSTING PLANS */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Web Hosting Plans & Price</h2>
            <p className="mt-0.5 text-xs text-[var(--hb-muted)]">
              Full A–Z editor for the pricing section on the homepage.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={sections.hostingPlans?.visible !== false}
              onChange={(e) =>
                setSections({
                  ...sections,
                  hostingPlans: {
                    ...sections.hostingPlans,
                    visible: e.target.checked,
                  },
                })
              }
            />
            Visible
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={sections.hostingPlans?.eyebrow ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: { ...sections.hostingPlans, eyebrow: value },
              })
            }
          />
          <Field
            label="Default billing (annually / monthly)"
            value={sections.hostingPlans?.defaultBilling ?? "annually"}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  defaultBilling: value === "monthly" ? "monthly" : "annually",
                },
              })
            }
          />
          <Field
            label="Title"
            value={sections.hostingPlans?.title ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: { ...sections.hostingPlans, title: value },
              })
            }
          />
          <Field
            label="Title accent (gradient text)"
            value={sections.hostingPlans?.titleAccent ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  titleAccent: value,
                },
              })
            }
          />
        </div>

        <TextArea
          label="Description"
          value={sections.hostingPlans?.description ?? ""}
          onChange={(value) =>
            setSections({
              ...sections,
              hostingPlans: { ...sections.hostingPlans, description: value },
            })
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Support label"
            value={sections.hostingPlans?.supportLabel ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  supportLabel: value,
                },
              })
            }
          />
          <Field
            label="Activation label"
            value={sections.hostingPlans?.activationLabel ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  activationLabel: value,
                },
              })
            }
          />
          <Field
            label="Annual toggle helper text"
            value={sections.hostingPlans?.annualToggleLabel ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  annualToggleLabel: value,
                },
              })
            }
          />
          <Field
            label="Monthly toggle label"
            value={sections.hostingPlans?.monthlyToggleLabel ?? ""}
            onChange={(value) =>
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  monthlyToggleLabel: value,
                },
              })
            }
          />
        </div>

        {(sections.hostingPlans?.plans ?? []).map((plan, index) => (
          <HostingPlanEditor
            key={plan.id}
            plan={plan}
            onChange={(patch) => {
              const plans = [...sections.hostingPlans.plans];
              plans[index] = { ...plans[index], ...patch };
              setSections({
                ...sections,
                hostingPlans: { ...sections.hostingPlans, plans },
              });
            }}
            onMove={(direction) => {
              const target = index + direction;
              const plans = [...sections.hostingPlans.plans];
              if (target < 0 || target >= plans.length) return;
              const [item] = plans.splice(index, 1);
              plans.splice(target, 0, item);
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  plans: plans.map((p, order) => ({ ...p, order })),
                },
              });
            }}
            onRemove={() => {
              setSections({
                ...sections,
                hostingPlans: {
                  ...sections.hostingPlans,
                  plans: sections.hostingPlans.plans.filter(
                    (_, i) => i !== index,
                  ),
                },
              });
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => {
            const plans = sections.hostingPlans?.plans ?? [];
            setSections({
              ...sections,
              hostingPlans: {
                ...sections.hostingPlans,
                plans: [
                  ...plans,
                  {
                    id: `plan-${Date.now()}`,
                    visible: true,
                    order: plans.length,
                    name: "New Plan",
                    discountBadge: "50% OFF",
                    popular: false,
                    popularLabel: "",
                    accent: "blue",
                    priceAnnually: "$0.00",
                    originalAnnually: "$0.00",
                    billedAnnually: "Billed annually",
                    priceMonthly: "$0.00",
                    originalMonthly: "",
                    billedMonthly: "Billed monthly",
                    features: ["Feature 1"],
                    ctaLabel: "Get Started",
                    ctaHref: "/get-started",
                  },
                ],
              },
            });
          }}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[var(--hb-muted)] hover:text-white"
        >
          + Add plan
        </button>

        <div className="space-y-3 border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold">Guarantee cards</h3>
          {(sections.hostingPlans?.guarantees ?? []).map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-xl border border-white/10 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Title"
                  value={item.title}
                  onChange={(value) => {
                    const guarantees = [...sections.hostingPlans.guarantees];
                    guarantees[index] = { ...guarantees[index], title: value };
                    setSections({
                      ...sections,
                      hostingPlans: { ...sections.hostingPlans, guarantees },
                    });
                  }}
                />
                <Field
                  label="Icon (shield / lock / rocket)"
                  value={item.icon}
                  onChange={(value) => {
                    const guarantees = [...sections.hostingPlans.guarantees];
                    const icon: CmsHostingGuarantee["icon"] =
                      value === "lock" || value === "rocket" ? value : "shield";
                    guarantees[index] = { ...guarantees[index], icon };
                    setSections({
                      ...sections,
                      hostingPlans: { ...sections.hostingPlans, guarantees },
                    });
                  }}
                />
              </div>
              <TextArea
                label="Description"
                value={item.description}
                onChange={(value) => {
                  const guarantees = [...sections.hostingPlans.guarantees];
                  guarantees[index] = {
                    ...guarantees[index],
                    description: value,
                  };
                  setSections({
                    ...sections,
                    hostingPlans: { ...sections.hostingPlans, guarantees },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* LOGIN PAGE */}
      {login ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Login page (/login)</h2>
              <p className="mt-0.5 text-xs text-[var(--hb-muted)]">
                Full A–Z editor for the Sign In page — Google / GitHub included.
              </p>
            </div>
            <button
              type="button"
              disabled={savingLogin}
              onClick={() => void saveLogin()}
              className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {savingLogin ? "Saving…" : "Save login page"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <OrbitImageField
              label="Logo image"
              value={login.logoPath}
              onChange={(url) => setLogin({ ...login, logoPath: url })}
            />
            <OrbitImageField
              label="Background image (right side)"
              value={login.backgroundImage}
              onChange={(url) => setLogin({ ...login, backgroundImage: url })}
            />
            <Field
              label="Tagline under logo"
              value={login.tagline}
              onChange={(value) => setLogin({ ...login, tagline: value })}
            />
            <Field
              label="Copyright footer"
              value={login.copyright}
              onChange={(value) => setLogin({ ...login, copyright: value })}
            />
            <Field
              label="Badge"
              value={login.badge}
              onChange={(value) => setLogin({ ...login, badge: value })}
            />
            <Field
              label="Headline"
              value={login.headline}
              onChange={(value) => setLogin({ ...login, headline: value })}
            />
            <Field
              label="Headline accent (gradient)"
              value={login.headlineAccent}
              onChange={(value) =>
                setLogin({ ...login, headlineAccent: value })
              }
            />
            <Field
              label="Divider label"
              value={login.dividerLabel}
              onChange={(value) => setLogin({ ...login, dividerLabel: value })}
            />
          </div>

          <TextArea
            label="Description"
            value={login.description}
            onChange={(value) => setLogin({ ...login, description: value })}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Card title"
              value={login.cardTitle}
              onChange={(value) => setLogin({ ...login, cardTitle: value })}
            />
            <Field
              label="Card subtitle"
              value={login.cardSubtitle}
              onChange={(value) => setLogin({ ...login, cardSubtitle: value })}
            />
            <Field
              label="Email label"
              value={login.emailLabel}
              onChange={(value) => setLogin({ ...login, emailLabel: value })}
            />
            <Field
              label="Email placeholder"
              value={login.emailPlaceholder}
              onChange={(value) =>
                setLogin({ ...login, emailPlaceholder: value })
              }
            />
            <Field
              label="Password label"
              value={login.passwordLabel}
              onChange={(value) => setLogin({ ...login, passwordLabel: value })}
            />
            <Field
              label="Password placeholder"
              value={login.passwordPlaceholder}
              onChange={(value) =>
                setLogin({ ...login, passwordPlaceholder: value })
              }
            />
            <Field
              label="Remember me label"
              value={login.rememberLabel}
              onChange={(value) => setLogin({ ...login, rememberLabel: value })}
            />
            <Field
              label="Forgot password label"
              value={login.forgotLabel}
              onChange={(value) => setLogin({ ...login, forgotLabel: value })}
            />
            <Field
              label="Forgot password link"
              value={login.forgotHref}
              onChange={(value) => setLogin({ ...login, forgotHref: value })}
            />
            <Field
              label="Login button text"
              value={login.loginCtaLabel}
              onChange={(value) => setLogin({ ...login, loginCtaLabel: value })}
            />
            <Field
              label="Signup prompt"
              value={login.signupPrompt}
              onChange={(value) => setLogin({ ...login, signupPrompt: value })}
            />
            <Field
              label="Signup link text"
              value={login.signupLabel}
              onChange={(value) => setLogin({ ...login, signupLabel: value })}
            />
            <Field
              label="Signup link href"
              value={login.signupHref}
              onChange={(value) => setLogin({ ...login, signupHref: value })}
            />
          </div>

          <div className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Google sign-in</h3>
                <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
                  <input
                    type="checkbox"
                    checked={login.google.visible}
                    onChange={(e) =>
                      setLogin({
                        ...login,
                        google: { ...login.google, visible: e.target.checked },
                      })
                    }
                  />
                  Visible
                </label>
              </div>
              <Field
                label="Button label"
                value={login.google.label}
                onChange={(value) =>
                  setLogin({
                    ...login,
                    google: { ...login.google, label: value },
                  })
                }
              />
              <Field
                label="Button link / OAuth URL"
                value={login.google.href}
                onChange={(value) =>
                  setLogin({
                    ...login,
                    google: { ...login.google, href: value },
                  })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">GitHub sign-in</h3>
                <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
                  <input
                    type="checkbox"
                    checked={login.github.visible}
                    onChange={(e) =>
                      setLogin({
                        ...login,
                        github: { ...login.github, visible: e.target.checked },
                      })
                    }
                  />
                  Visible
                </label>
              </div>
              <Field
                label="Button label"
                value={login.github.label}
                onChange={(value) =>
                  setLogin({
                    ...login,
                    github: { ...login.github, label: value },
                  })
                }
              />
              <Field
                label="Button link / OAuth URL"
                value={login.github.href}
                onChange={(value) =>
                  setLogin({
                    ...login,
                    github: { ...login.github, href: value },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Feature icons</h3>
              <button
                type="button"
                onClick={() =>
                  setLogin({
                    ...login,
                    features: [
                      ...login.features,
                      {
                        id: `feature-${Date.now()}`,
                        title: "New feature",
                        description: "Description",
                        icon: "shield",
                      },
                    ],
                  })
                }
                className="rounded-lg border border-white/10 px-2 py-1 text-xs"
              >
                Add feature
              </button>
            </div>
            {login.features.map((feature, index) => (
              <div
                key={feature.id}
                className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2"
              >
                <Field
                  label="Title"
                  value={feature.title}
                  onChange={(value) => {
                    const features = [...login.features];
                    features[index] = { ...features[index], title: value };
                    setLogin({ ...login, features });
                  }}
                />
                <Field
                  label="Icon (shield / zap / headphones / lock)"
                  value={feature.icon}
                  onChange={(value) => {
                    const icon: CmsLoginFeature["icon"] =
                      value === "zap" ||
                      value === "headphones" ||
                      value === "lock"
                        ? value
                        : "shield";
                    const features = [...login.features];
                    features[index] = { ...features[index], icon };
                    setLogin({ ...login, features });
                  }}
                />
                <div className="md:col-span-2">
                  <TextArea
                    label="Description"
                    value={feature.description}
                    onChange={(value) => {
                      const features = [...login.features];
                      features[index] = {
                        ...features[index],
                        description: value,
                      };
                      setLogin({ ...login, features });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLogin({
                      ...login,
                      features: login.features.filter((_, i) => i !== index),
                    })
                  }
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs text-red-300 md:col-span-2 md:w-fit"
                >
                  Remove feature
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HostingTypeCardEditor({
  card,
  onChange,
  onMove,
  onRemove,
}: {
  card: CmsHostingTypeCard;
  onChange: (patch: Partial<CmsHostingTypeCard>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          {card.title || card.id} card
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={card.visible !== false}
              onChange={(e) => onChange({ visible: e.target.checked })}
            />
            Visible
          </label>
          <button
            type="button"
            onClick={() => onMove(-1)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-red-300"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Title"
          value={card.title}
          onChange={(value) => onChange({ title: value })}
        />
        <Field
          label="CTA text"
          value={card.ctaLabel}
          onChange={(value) => onChange({ ctaLabel: value })}
        />
        <Field
          label="CTA link"
          value={card.href}
          onChange={(value) => onChange({ href: value })}
        />
        <Field
          label="Accent (blue / purple)"
          value={card.accent}
          onChange={(value) =>
            onChange({ accent: value === "purple" ? "purple" : "blue" })
          }
        />
        <Field
          label="Icon (cloud / cart / wordpress / user)"
          value={card.icon}
          onChange={(value) =>
            onChange({
              icon:
                value === "cart" || value === "wordpress" || value === "user"
                  ? value
                  : "cloud",
            })
          }
        />
        <Field
          label="Overlay style (cloud / shop / gallery / studio)"
          value={card.overlayStyle}
          onChange={(value) =>
            onChange({
              overlayStyle:
                value === "shop" || value === "gallery" || value === "studio"
                  ? value
                  : "cloud",
            })
          }
        />
        <Field
          label="Overlay caption"
          value={card.overlayCaption}
          onChange={(value) => onChange({ overlayCaption: value })}
        />
        <Field
          label="Overlay stat (e.g. ↑ 85.2% / 109.00)"
          value={card.overlayStat}
          onChange={(value) => onChange({ overlayStat: value })}
        />
        <Field
          label="Overlay pills (comma-separated)"
          value={card.overlayPills.join(", ")}
          onChange={(value) =>
            onChange({
              overlayPills: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
        <Field
          label="Image alt text"
          value={card.imageAlt}
          onChange={(value) => onChange({ imageAlt: value })}
        />
      </div>

      <TextArea
        label="Description"
        value={card.description}
        onChange={(value) => onChange({ description: value })}
      />

      <OrbitImageField
        label="In-card image (fills bottom of glass box)"
        value={card.imageUrl}
        onChange={(url) => onChange({ imageUrl: url })}
      />
    </div>
  );
}

function HostingPlanEditor({
  plan,
  onChange,
  onMove,
  onRemove,
}: {
  plan: CmsHostingPlan;
  onChange: (patch: Partial<CmsHostingPlan>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          {plan.name || plan.id} plan
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={plan.visible !== false}
              onChange={(e) => onChange({ visible: e.target.checked })}
            />
            Visible
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={Boolean(plan.popular)}
              onChange={(e) => onChange({ popular: e.target.checked })}
            />
            Most popular
          </label>
          <button
            type="button"
            onClick={() => onMove(-1)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-red-300"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Plan name"
          value={plan.name}
          onChange={(value) => onChange({ name: value })}
        />
        <Field
          label="Discount badge"
          value={plan.discountBadge}
          onChange={(value) => onChange({ discountBadge: value })}
        />
        <Field
          label="Popular label"
          value={plan.popularLabel}
          onChange={(value) => onChange({ popularLabel: value })}
        />
        <Field
          label="Accent (blue / purple / gradient)"
          value={plan.accent}
          onChange={(value) =>
            onChange({
              accent:
                value === "purple" || value === "gradient" ? value : "blue",
            })
          }
        />
        <Field
          label="Annual price /mo"
          value={plan.priceAnnually}
          onChange={(value) => onChange({ priceAnnually: value })}
        />
        <Field
          label="Annual original (strikethrough)"
          value={plan.originalAnnually}
          onChange={(value) => onChange({ originalAnnually: value })}
        />
        <Field
          label="Billed annually text"
          value={plan.billedAnnually}
          onChange={(value) => onChange({ billedAnnually: value })}
        />
        <Field
          label="Monthly price /mo"
          value={plan.priceMonthly}
          onChange={(value) => onChange({ priceMonthly: value })}
        />
        <Field
          label="Monthly original (strikethrough)"
          value={plan.originalMonthly}
          onChange={(value) => onChange({ originalMonthly: value })}
        />
        <Field
          label="Billed monthly text"
          value={plan.billedMonthly}
          onChange={(value) => onChange({ billedMonthly: value })}
        />
        <Field
          label="CTA text"
          value={plan.ctaLabel}
          onChange={(value) => onChange({ ctaLabel: value })}
        />
        <Field
          label="CTA link"
          value={plan.ctaHref}
          onChange={(value) => onChange({ ctaHref: value })}
        />
      </div>

      <FeatureEditor
        features={plan.features}
        onChange={(features) => onChange({ features })}
      />
    </div>
  );
}

function DomainPricingEditor({
  pricing,
  onChange,
}: {
  pricing: CmsDomainTld[];
  onChange: (pricing: CmsDomainTld[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pricing.length) return;
    const next = [...pricing];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {pricing.map((item, index) => (
        <div
          key={`${index}-${item.tld}`}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 p-3"
        >
          <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
            <input
              type="checkbox"
              checked={item.visible !== false}
              onChange={(e) => {
                const next = [...pricing];
                next[index] = { ...next[index], visible: e.target.checked };
                onChange(next);
              }}
            />
            Visible
          </label>
          <input
            value={item.tld}
            onChange={(e) => {
              const next = [...pricing];
              next[index] = { ...next[index], tld: e.target.value };
              onChange(next);
            }}
            placeholder=".com"
            className="w-[80px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
          />
          <input
            value={item.priceLabel}
            onChange={(e) => {
              const next = [...pricing];
              next[index] = { ...next[index], priceLabel: e.target.value };
              onChange(next);
            }}
            placeholder="$7.99/yr"
            className="w-[110px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
          />
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => move(index, -1)}
              className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-[var(--hb-muted)]"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-[var(--hb-muted)]"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => onChange(pricing.filter((_, i) => i !== index))}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...pricing,
            { tld: ".io", priceLabel: "$12.99/yr", visible: true },
          ])
        }
        className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[var(--hb-muted)] hover:text-white"
      >
        + Add TLD
      </button>
    </div>
  );
}

function TechPartnersEditor({
  partners,
  onChange,
}: {
  partners: CmsTechPartner[];
  onChange: (partners: CmsTechPartner[]) => void;
}) {
  const ordered = [...partners].sort((a, b) => a.order - b.order);

  const update = (index: number, patch: Partial<CmsTechPartner>) => {
    const next = ordered.map((partner, i) =>
      i === index ? { ...partner, ...patch } : partner,
    );
    onChange(next.map((partner, i) => ({ ...partner, order: i })));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next.map((partner, i) => ({ ...partner, order: i })));
  };

  return (
    <div className="space-y-3">
      {ordered.map((partner, index) => (
        <div
          key={partner.id}
          className="space-y-2 rounded-xl border border-white/10 p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[var(--hb-muted)]">
              <input
                type="checkbox"
                checked={partner.visible !== false}
                onChange={(e) => update(index, { visible: e.target.checked })}
              />
              Visible
            </label>
            <input
              value={partner.label}
              onChange={(e) => update(index, { label: e.target.value })}
              className="min-w-[120px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => move(index, -1)}
              className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-[var(--hb-muted)]"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-[var(--hb-muted)]"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(
                  ordered
                    .filter((_, i) => i !== index)
                    .map((item, i) => ({ ...item, order: i })),
                )
              }
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-red-300"
            >
              Remove
            </button>
          </div>
          <OrbitImageField
            label={`${partner.label} logo (optional — leave empty for built-in mark)`}
            value={partner.imageUrl}
            onChange={(url) => update(index, { imageUrl: url })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...ordered,
            {
              id: `partner-${Date.now()}`,
              label: "New partner",
              imageUrl: "",
              visible: true,
              order: ordered.length,
            },
          ])
        }
        className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[var(--hb-muted)] hover:text-white"
      >
        + Add partner
      </button>
    </div>
  );
}

function FeatureEditor({
  features,
  onChange,
}: {
  features: string[];
  onChange: (features: string[]) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-[var(--hb-muted)] uppercase">
          Features
        </p>
        <button
          type="button"
          onClick={() => onChange([...features, "New feature"])}
          className="rounded-lg border border-white/10 px-2 py-1 text-xs"
        >
          Add feature
        </button>
      </div>
      {features.map((feature, index) => (
        <div key={`${index}-${feature.slice(0, 12)}`} className="flex gap-2">
          <input
            value={feature}
            onChange={(event) => {
              const next = [...features];
              next[index] = event.target.value;
              onChange(next);
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const next = [...features];
              if (index > 0) {
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onChange(next);
              }
            }}
            className="rounded-lg border border-white/10 px-2 text-xs"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => {
              const next = [...features];
              if (index < next.length - 1) {
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                onChange(next);
              }
            }}
            className="rounded-lg border border-white/10 px-2 text-xs"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onChange(features.filter((_, i) => i !== index))}
            className="rounded-lg border border-white/10 px-2 text-xs text-red-300"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-[var(--hb-muted)] uppercase">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-normal tracking-normal text-white normal-case outline-none focus:border-[var(--hb-blue)]/40"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-[var(--hb-muted)] uppercase">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-normal tracking-normal text-white normal-case outline-none focus:border-[var(--hb-blue)]/40"
      />
    </label>
  );
}
