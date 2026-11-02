"use client";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  ImageIcon,
  Quote,
  Redo2,
  Search,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { editorContentStats } from "@/lib/blog/editor-stats";
import { safeEditorPreviewHtml } from "@/lib/blog/editor-preview";
import {
  CalloutExtension,
  CtaBlockExtension,
} from "@/lib/blog/tiptap-extensions";
import { uploadOrbitFile } from "@/lib/orbit/upload-orbit-file";
import { cn } from "@/lib/utils";

type EditorMode = "visual" | "html" | "preview";

function ToolButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm text-[#3c434a] transition",
        active
          ? "bg-[#e0e5e9] text-[#135e96] shadow-[inset_0_0_0_1px_#c3c4c7]"
          : "hover:bg-[#f0f0f1] hover:text-[#135e96]",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-[#dcdcde]" aria-hidden />;
}

export function RichTextEditor({
  value,
  onChange,
  previewHref,
}: {
  value: string;
  onChange: (html: string) => void;
  previewHref?: string | null;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<EditorMode>("visual");
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [fullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkQ, setLinkQ] = useState("");
  const [linkResults, setLinkResults] = useState<
    { title: string; href: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = editorContentStats(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Strike,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CalloutExtension,
      CtaBlockExtension,
      Placeholder.configure({
        placeholder: "Start writing, or type / for a quick block…",
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "hb-wp-editor-canvas min-h-[440px] px-6 py-5 text-[16px] leading-[1.75] text-[#1d2327] outline-none",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        void uploadOrbitFile(file, "").then((url) => {
          if (!url) return;
          const { schema } = view.state;
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (!coordinates) return;
          const node = schema.nodes.image.create({ src: url, alt: "" });
          view.dispatch(view.state.tr.insert(coordinates.pos, node));
        });
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor || mode !== "visual") return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value, mode]);

  useEffect(() => {
    if (mode === "html") setHtmlDraft(value);
  }, [mode, value]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const commitHtml = () => {
    onChange(htmlDraft);
    setMode("visual");
    editor?.commands.setContent(htmlDraft || "<p></p>", { emitUpdate: false });
  };

  const fetchLinks = useCallback(async () => {
    const res = await fetch(
      `/api/orbit/blog/internal-links?q=${encodeURIComponent(linkQ)}`,
    );
    const json = await res.json();
    setLinkResults(json.results ?? []);
  }, [linkQ]);

  useEffect(() => {
    if (!linkOpen) return;
    void fetchLinks();
  }, [linkOpen, linkQ, fetchLinks]);

  const toggleFullscreen = () => {
    if (!shellRef.current) return;
    if (!fullscreen) {
      void shellRef.current.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setNotice("");
    try {
      const url = await uploadOrbitFile(file, "");
      if (mode === "html") {
        setHtmlDraft(
          (draft) => `${draft}\n<figure><img src="${url}" alt="" /></figure>`,
        );
      } else {
        editor?.chain().focus().setImage({ src: url, alt: "" }).run();
      }
      setNotice("Image added to the article.");
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const findReplace = () => {
    const find = window.prompt("Find text");
    if (!find) return;
    const replace = window.prompt("Replace with (leave empty to delete)");
    const html = editor?.getHTML() ?? value;
    if (!html.includes(find)) {
      setNotice("Text not found.");
      return;
    }
    const next = replace
      ? html.split(find).join(replace)
      : html.split(find).join("");
    editor?.commands.setContent(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[11px] font-bold tracking-[0.08em] text-[#646970] uppercase">
          Article content
        </label>
        <div className="flex overflow-hidden rounded-sm border border-[#c3c4c7] bg-white text-[11px] font-semibold">
          {(
            [
              ["visual", "Visual"],
              ["html", "HTML"],
              ["preview", "Preview"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key !== "html" && mode === "html") commitHtml();
                setMode(key);
              }}
              className={cn(
                "px-3 py-1.5 tracking-wide uppercase transition",
                mode === key
                  ? "bg-[#f0eee4] text-[#1d2327]"
                  : "text-[#646970] hover:bg-[#f6f7f7]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={shellRef}
        className={cn(
          "flex flex-col overflow-hidden rounded-sm border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
          fullscreen && "fixed inset-0 z-[200] rounded-none",
        )}
      >
        {mode !== "preview" ? (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-[#dcdcde] bg-[#f6f7f3] px-2 py-1.5">
            <ToolButton
              title="Undo"
              onClick={() => editor?.chain().focus().undo().run()}
            >
              <Undo2 className="size-4" />
            </ToolButton>
            <ToolButton
              title="Redo"
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 className="size-4" />
            </ToolButton>

            <Divider />

            {mode === "visual" ? (
              <select
                aria-label="Block style"
                value={
                  editor?.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor?.isActive("heading", { level: 3 })
                      ? "h3"
                      : editor?.isActive("heading", { level: 4 })
                        ? "h4"
                        : "p"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "p") editor?.chain().focus().setParagraph().run();
                  else
                    editor
                      ?.chain()
                      .focus()
                      .toggleHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 })
                      .run();
                }}
                className="mr-1 h-8 rounded-sm border border-[#8c8f94] bg-white px-2 text-xs text-[#2c3338]"
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>
            ) : null}

            {mode === "visual" ? (
              <>
                <ToolButton
                  title="Bold"
                  active={editor?.isActive("bold")}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Italic"
                  active={editor?.isActive("italic")}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Underline"
                  active={editor?.isActive("underline")}
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                >
                  <UnderlineIcon className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Strikethrough"
                  active={editor?.isActive("strike")}
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Highlight"
                  active={editor?.isActive("highlight")}
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleHighlight({ color: "#fef08a" })
                      .run()
                  }
                >
                  <Highlighter className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Inline code"
                  active={editor?.isActive("code")}
                  onClick={() => editor?.chain().focus().toggleCode().run()}
                >
                  <Code2 className="size-4" />
                </ToolButton>

                <Divider />

                <ToolButton
                  title="Align left"
                  active={editor?.isActive({ textAlign: "left" })}
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("left").run()
                  }
                >
                  <AlignLeft className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Align center"
                  active={editor?.isActive({ textAlign: "center" })}
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("center").run()
                  }
                >
                  <AlignCenter className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Align right"
                  active={editor?.isActive({ textAlign: "right" })}
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("right").run()
                  }
                >
                  <AlignRight className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Justify"
                  active={editor?.isActive({ textAlign: "justify" })}
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("justify").run()
                  }
                >
                  <AlignJustify className="size-4" />
                </ToolButton>

                <Divider />

                <ToolButton
                  title="Bulleted list"
                  active={editor?.isActive("bulletList")}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                >
                  <List className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Numbered list"
                  active={editor?.isActive("orderedList")}
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                >
                  <ListOrdered className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Outdent"
                  onClick={() =>
                    editor?.chain().focus().liftListItem("listItem").run()
                  }
                >
                  <IndentDecrease className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Indent"
                  onClick={() =>
                    editor?.chain().focus().sinkListItem("listItem").run()
                  }
                >
                  <IndentIncrease className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Quote"
                  active={editor?.isActive("blockquote")}
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                >
                  <Quote className="size-4" />
                </ToolButton>

                <Divider />

                <ToolButton
                  title="Insert / edit link"
                  active={editor?.isActive("link")}
                  onClick={() => {
                    const existing = editor?.getAttributes("link").href as
                      string | undefined;
                    const url = window.prompt(
                      "Link URL (leave empty to remove)",
                      existing ?? "https://",
                    );
                    if (url === null) return;
                    if (!url.trim()) {
                      editor?.chain().focus().unsetLink().run();
                      return;
                    }
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: url.trim() })
                      .run();
                  }}
                >
                  <Link2 className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Search internal links"
                  onClick={() => {
                    setLinkOpen(true);
                    setLinkQ("");
                  }}
                >
                  <Search className="size-4" />
                </ToolButton>
                <ToolButton
                  title={uploading ? "Uploading image…" : "Insert image"}
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageIcon className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Insert table"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                >
                  <Table2 className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Embed YouTube video"
                  onClick={() => {
                    const url = window.prompt("YouTube watch or embed URL");
                    if (!url) return;
                    const idMatch = url.match(
                      /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/,
                    );
                    const src = idMatch
                      ? `https://www.youtube-nocookie.com/embed/${idMatch[1]}`
                      : url;
                    editor
                      ?.chain()
                      .focus()
                      .insertContent(
                        `<p><iframe src="${src}" title="Video" loading="lazy"></iframe></p>`,
                      )
                      .run();
                  }}
                >
                  <Video className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Horizontal rule"
                  onClick={() =>
                    editor?.chain().focus().setHorizontalRule().run()
                  }
                >
                  <Minus className="size-4" />
                </ToolButton>
              </>
            ) : (
              <>
                <ToolButton
                  title="Insert H2"
                  onClick={() =>
                    setHtmlDraft((d) => `${d}\n<h2>Heading</h2>\n<p></p>`)
                  }
                >
                  <Heading1 className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Insert H3"
                  onClick={() =>
                    setHtmlDraft((d) => `${d}\n<h3>Subheading</h3>\n<p></p>`)
                  }
                >
                  <Heading2 className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Insert paragraph"
                  onClick={() => setHtmlDraft((d) => `${d}\n<p></p>`)}
                >
                  <Heading3 className="size-4" />
                </ToolButton>
              </>
            )}

            <Divider />

            <ToolButton
              title="Find and replace"
              onClick={findReplace}
              disabled={mode !== "visual"}
            >
              <Search className="size-4" />
            </ToolButton>
            <ToolButton
              title="Clear formatting"
              disabled={mode !== "visual"}
              onClick={() =>
                editor?.chain().focus().clearNodes().unsetAllMarks().run()
              }
            >
              <Eraser className="size-4" />
            </ToolButton>
            <ToolButton
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            >
              {fullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </ToolButton>

            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="ml-auto rounded-sm border border-[#c3c4c7] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2271b1] hover:bg-[#f0f6fc]"
              >
                View live draft
              </a>
            ) : null}
          </div>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
        />

        {mode === "visual" ? (
          <>
            {editor ? (
              <BubbleMenu
                editor={editor}
                className="flex gap-0.5 rounded border border-[#c3c4c7] bg-white p-1 shadow-md"
              >
                <ToolButton
                  title="Bold"
                  active={editor.isActive("bold")}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Italic"
                  active={editor.isActive("italic")}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="size-4" />
                </ToolButton>
                <ToolButton
                  title="Link"
                  active={editor.isActive("link")}
                  onClick={() => {
                    setLinkOpen(true);
                    setLinkQ("");
                  }}
                >
                  <Link2 className="size-4" />
                </ToolButton>
              </BubbleMenu>
            ) : null}
            <div className="min-h-[440px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : null}

        {mode === "html" ? (
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            spellCheck={false}
            className="min-h-[460px] w-full resize-y border-0 bg-[#1e1e1e] p-4 font-mono text-[13px] leading-relaxed text-[#d4d4d4] outline-none"
          />
        ) : null}

        {mode === "preview" ? (
          <div className="min-h-[420px] bg-white px-6 py-6">
            <div
              className="hb-blog-prose mx-auto max-w-[760px]"
              // Preview of the author's own HTML draft.
              dangerouslySetInnerHTML={{
                __html: safeEditorPreviewHtml(value || "<p></p>"),
              }}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dcdcde] bg-[#f6f7f3] px-3 py-1.5 text-[11px] text-[#646970]">
          <span className="inline-flex items-center gap-3">
            <span className="font-semibold">{stats.words} words</span>
            <span>{stats.characters} characters</span>
            <span>~{stats.readingTimeMinutes} min read</span>
          </span>
          <span>{notice || (uploading ? "Uploading image…" : "")}</span>
        </div>
      </div>

      {linkOpen && mode === "visual" ? (
        <div className="rounded-sm border border-[#c3c4c7] bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#2c3338]">
              Link to a HostingBeyond page or article
            </p>
            <button
              type="button"
              className="text-xs font-medium text-[#2271b1]"
              onClick={() => setLinkOpen(false)}
            >
              Close
            </button>
          </div>
          <input
            value={linkQ}
            onChange={(e) => setLinkQ(e.target.value)}
            placeholder="Search pages and posts"
            className="mt-2 w-full rounded-sm border border-[#8c8f94] px-3 py-2 text-sm"
          />
          <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto text-sm">
            {linkResults.map((row) => (
              <li key={row.href}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left hover:bg-[#f0f6fc]"
                  onClick={() => {
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: row.href })
                      .run();
                    setLinkOpen(false);
                  }}
                >
                  {row.title}
                  <span className="ml-2 text-xs text-[#646970]">
                    {row.href}
                  </span>
                </button>
              </li>
            ))}
            {linkResults.length === 0 ? (
              <li className="px-2 py-1 text-xs text-[#646970]">
                No matches. Type a full URL instead.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
