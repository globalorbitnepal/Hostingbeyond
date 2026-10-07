import { Node, mergeAttributes } from "@tiptap/core";

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (el) => el.getAttribute("data-callout") || "info",
        renderHTML: (attrs) => ({ "data-callout": attrs.variant }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "hb-callout" }), 0];
  },
});

export const CtaBlockExtension = Node.create({
  name: "hbCta",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      title: { default: "Need reliable hosting for your website?" },
      body: {
        default:
          "Explore HostingBeyond hosting plans built for speed and support.",
      },
      href: { default: "/web-hosting" },
      label: { default: "Explore Hosting" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-hb-cta="true"]' }];
  },
  renderHTML({ node }) {
    const { title, body, href, label } = node.attrs;
    return [
      "div",
      {
        "data-hb-cta": "true",
        class: "hb-cta-block",
      },
      ["p", { class: "hb-cta-block__title" }, title],
      ["p", { class: "hb-cta-block__body" }, body],
      [
        "a",
        {
          href,
          class: "hb-cta-block__btn",
        },
        label,
      ],
    ];
  },
});
