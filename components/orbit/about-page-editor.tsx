"use client";

import type { CmsAboutPageContent } from "@/lib/orbit/about-page-content";
import {
  newAboutFaq,
  newAboutMilestone,
  newAboutTeamMember,
  newAboutValue,
} from "@/lib/orbit/about-page-content";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextBlock({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className={inputClass}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function AboutPageEditor({
  value,
  onChange,
}: {
  value: CmsAboutPageContent;
  onChange: (next: CmsAboutPageContent) => void;
}) {
  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold">SEO</h2>
        <Field label="SEO title">
          <input
            className={inputClass}
            value={value.seoTitle}
            onChange={(e) => onChange({ ...value, seoTitle: e.target.value })}
          />
        </Field>
        <TextBlock
          label="Meta description"
          value={value.seoDescription}
          onChange={(v) => onChange({ ...value, seoDescription: v })}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Hero & company</h2>
        <Field label="Eyebrow">
          <input
            className={inputClass}
            value={value.heroEyebrow}
            onChange={(e) =>
              onChange({ ...value, heroEyebrow: e.target.value })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <input
              className={inputClass}
              value={value.heroTitle}
              onChange={(e) =>
                onChange({ ...value, heroTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Accent">
            <input
              className={inputClass}
              value={value.heroTitleAccent}
              onChange={(e) =>
                onChange({ ...value, heroTitleAccent: e.target.value })
              }
            />
          </Field>
        </div>
        <TextBlock
          label="Hero description"
          value={value.heroDescription}
          onChange={(v) => onChange({ ...value, heroDescription: v })}
        />
        <Field label="Legal / brand name">
          <input
            className={inputClass}
            value={value.companyLegalName}
            onChange={(e) =>
              onChange({ ...value, companyLegalName: e.target.value })
            }
          />
        </Field>
        <Field label="Headquarters line">
          <input
            className={inputClass}
            value={value.headquartersLine}
            onChange={(e) =>
              onChange({ ...value, headquartersLine: e.target.value })
            }
          />
        </Field>
        <Field label="Serving line">
          <input
            className={inputClass}
            value={value.servingLine}
            onChange={(e) =>
              onChange({ ...value, servingLine: e.target.value })
            }
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Mission & vision</h2>
        <Field label="Mission title">
          <input
            className={inputClass}
            value={value.missionTitle}
            onChange={(e) =>
              onChange({ ...value, missionTitle: e.target.value })
            }
          />
        </Field>
        <TextBlock
          label="Mission body"
          value={value.missionBody}
          onChange={(v) => onChange({ ...value, missionBody: v })}
          rows={4}
        />
        <Field label="Vision title">
          <input
            className={inputClass}
            value={value.visionTitle}
            onChange={(e) =>
              onChange({ ...value, visionTitle: e.target.value })
            }
          />
        </Field>
        <TextBlock
          label="Vision body"
          value={value.visionBody}
          onChange={(v) => onChange({ ...value, visionBody: v })}
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">USA & story</h2>
        <Field label="USA section title">
          <input
            className={inputClass}
            value={value.usaTitle}
            onChange={(e) => onChange({ ...value, usaTitle: e.target.value })}
          />
        </Field>
        <TextBlock
          label="USA body"
          value={value.usaBody}
          onChange={(v) => onChange({ ...value, usaBody: v })}
          rows={4}
        />
        <TextBlock
          label="USA secondary"
          value={value.usaBodySecondary}
          onChange={(v) => onChange({ ...value, usaBodySecondary: v })}
          rows={3}
        />
        <Field label="Story title">
          <input
            className={inputClass}
            value={value.storyTitle}
            onChange={(e) => onChange({ ...value, storyTitle: e.target.value })}
          />
        </Field>
        <TextBlock
          label="Story body"
          value={value.storyBody}
          onChange={(v) => onChange({ ...value, storyBody: v })}
          rows={4}
        />
        <TextBlock
          label="Story secondary"
          value={value.storyBodySecondary}
          onChange={(v) => onChange({ ...value, storyBodySecondary: v })}
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Values</h2>
        {value.values.map((item, i) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-slate-100 p-4"
          >
            <Field label="Title">
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => {
                  const values = [...value.values];
                  values[i] = { ...item, title: e.target.value };
                  onChange({ ...value, values });
                }}
              />
            </Field>
            <TextBlock
              label="Description"
              value={item.description}
              onChange={(v) => {
                const values = [...value.values];
                values[i] = { ...item, description: v };
                onChange({ ...value, values });
              }}
              rows={2}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({ ...value, values: [...value.values, newAboutValue()] })
          }
        >
          + Add value
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Milestones</h2>
        {value.milestones.map((item, i) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-violet-50 bg-violet-50/40 p-4"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="Year">
                <input
                  className={inputClass}
                  value={item.year}
                  onChange={(e) => {
                    const milestones = [...value.milestones];
                    milestones[i] = { ...item, year: e.target.value };
                    onChange({ ...value, milestones });
                  }}
                />
              </Field>
              <Field label="Title">
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => {
                    const milestones = [...value.milestones];
                    milestones[i] = { ...item, title: e.target.value };
                    onChange({ ...value, milestones });
                  }}
                />
              </Field>
            </div>
            <TextBlock
              label="Description"
              value={item.description}
              onChange={(v) => {
                const milestones = [...value.milestones];
                milestones[i] = { ...item, description: v };
                onChange({ ...value, milestones });
              }}
              rows={2}
            />
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                onChange({
                  ...value,
                  milestones: value.milestones.filter((_, j) => j !== i),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({
              ...value,
              milestones: [...value.milestones, newAboutMilestone()],
            })
          }
        >
          + Add milestone
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Team</h2>
        <Field label="Section title">
          <input
            className={inputClass}
            value={value.teamSectionTitle}
            onChange={(e) =>
              onChange({ ...value, teamSectionTitle: e.target.value })
            }
          />
        </Field>
        <TextBlock
          label="Section intro"
          value={value.teamSectionIntro}
          onChange={(v) => onChange({ ...value, teamSectionIntro: v })}
          rows={2}
        />
        {value.team.map((member, i) => (
          <div
            key={member.id}
            className="space-y-2 rounded-xl border border-slate-100 p-4"
          >
            <Field label="Name">
              <input
                className={inputClass}
                value={member.name}
                onChange={(e) => {
                  const team = [...value.team];
                  team[i] = { ...member, name: e.target.value };
                  onChange({ ...value, team });
                }}
              />
            </Field>
            <Field label="Role">
              <input
                className={inputClass}
                value={member.role}
                onChange={(e) => {
                  const team = [...value.team];
                  team[i] = { ...member, role: e.target.value };
                  onChange({ ...value, team });
                }}
              />
            </Field>
            <TextBlock
              label="Bio"
              value={member.bio}
              onChange={(v) => {
                const team = [...value.team];
                team[i] = { ...member, bio: v };
                onChange({ ...value, team });
              }}
              rows={2}
            />
            <Field label="Photo URL (optional)">
              <input
                className={inputClass}
                value={member.imageUrl ?? ""}
                onChange={(e) => {
                  const team = [...value.team];
                  team[i] = { ...member, imageUrl: e.target.value };
                  onChange({ ...value, team });
                }}
              />
            </Field>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                onChange({
                  ...value,
                  team: value.team.filter((_, j) => j !== i),
                })
              }
            >
              Remove member
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({ ...value, team: [...value.team, newAboutTeamMember()] })
          }
        >
          + Add team member
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Commitment & FAQ</h2>
        <Field label="Commitment title">
          <input
            className={inputClass}
            value={value.commitmentTitle}
            onChange={(e) =>
              onChange({ ...value, commitmentTitle: e.target.value })
            }
          />
        </Field>
        <TextBlock
          label="Commitment body"
          value={value.commitmentBody}
          onChange={(v) => onChange({ ...value, commitmentBody: v })}
          rows={3}
        />
        {value.faqs.map((faq, i) => (
          <div
            key={faq.id}
            className="space-y-2 rounded-xl border border-slate-100 p-4"
          >
            <Field label="Question">
              <input
                className={inputClass}
                value={faq.question}
                onChange={(e) => {
                  const faqs = [...value.faqs];
                  faqs[i] = { ...faq, question: e.target.value };
                  onChange({ ...value, faqs });
                }}
              />
            </Field>
            <TextBlock
              label="Answer"
              value={faq.answer}
              onChange={(v) => {
                const faqs = [...value.faqs];
                faqs[i] = { ...faq, answer: v };
                onChange({ ...value, faqs });
              }}
              rows={3}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({ ...value, faqs: [...value.faqs, newAboutFaq()] })
          }
        >
          + Add FAQ
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bottom CTA</h2>
        <Field label="Title">
          <input
            className={inputClass}
            value={value.ctaTitle}
            onChange={(e) => onChange({ ...value, ctaTitle: e.target.value })}
          />
        </Field>
        <TextBlock
          label="Description"
          value={value.ctaDescription}
          onChange={(v) => onChange({ ...value, ctaDescription: v })}
          rows={2}
        />
      </section>
    </div>
  );
}
