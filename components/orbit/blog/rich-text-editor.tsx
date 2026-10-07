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
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Eye,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Printer,
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
import {
  CalloutExtension,
  CtaBlockExtension,
} from "@/lib/blog/tiptap-extensions";
import { uploadOrbitFile } from "@/lib/orbit/upload-orbit-file";
import { cn } from "@/lib/utils";

function WpToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded border text-slate-700 transition",
        active
          ? "border-[#2271b1] bg-[#f0f6fc] text-[#2271b1]"
          : "border-transparent bg-transparent hover:border-[#c3c4c7] hover:bg-white",
      )}
    >
      {children}
    </button>
  );
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
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [fullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkQ, setLinkQ] = useState("");
  const [linkResults, setLinkResults] = useState<
    { title: string; href: string }[]
  >([]);
  const [headingLevel, setHeadingLevel] = useState("normal");

  const stats = editorContentStats(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Strike,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CalloutExtension,
      CtaBlockExtension,
      Placeholder.configure({
        placeholder: "Write your article…",
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "hb-wp-editor-canvas min-h-[360px] px-4 py-3 text-[15px] leading-[1.7] text-[#1d2327] outline-none",
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
    if (!editor || htmlMode) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value, htmlMode]);

  useEffect(() => {
    if (htmlMode) setHtmlDraft(value);
  }, [htmlMode, value]);

  const applyHtmlMode = () => {
    onChange(htmlDraft);
    setHtmlMode(false);
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
      setFullscreen(true);
    } else {
      void document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  if (!editor) return null;

  const setHeading = (level: string) => {
    setHeadingLevel(level);
    if (level === "normal") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const n = Number(level.replace("h", "")) as 2 | 3 | 4;
    editor.chain().focus().toggleHeading({ level: n }).run();
  };

  const findReplace = () => {
    const find = window.prompt("Find text");
    if (!find) return;
    const replace = window.prompt("Replace with (leave empty to skip)");
    const html = editor.getHTML();
    if (!html.includes(find)) {
      window.alert("Text not found.");
      return;
    }
    const next = replace != null ? html.split(find).join(replace) : html;
    editor.commands.setContent(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold tracking-wide text-[#646970] uppercase">
        Content <span className="text-[#d63638]">*</span>
      </label>

      <div
        ref={shellRef}
        className={cn(
          "overflow-hidden rounded-sm border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
          fullscreen && "fixed inset-0 z-[200] rounded-none",
        )}
      >
        {/* WordPress-style utility row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#dcdcde] bg-[#f6f7f7] px-3 py-2">
          <button
            type="button"
            onClick={() => (htmlMode ? applyHtmlMode() : setHtmlMode(true))}
            className="inline-flex items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1]"
          >
            <Code2 className="size-3.5" />
            {htmlMode ? "Visual" : "HTML Source"}
          </button>
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1]"
            >
              <Eye className="size-3.5" />
              Preview
            </a>
          ) : null}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="inline-flex items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1]"
          >
            <Table2 className="size-3.5" />
            Table
          </button>
          <button
            type="button"
            onClick={findReplace}
            className="inline-flex items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1]"
          >
            <Search className="size-3.5" />
            Find &amp; Replace
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1] sm:inline-flex"
          >
            <Printer className="size-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-xs font-medium text-[#2c3338] hover:bg-[#f0f0f1]"
          >
            {fullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
          <p className="ml-auto text-xs text-[#646970]">
            {stats.words.toLocaleString()} words ·{" "}
            {stats.characters.toLocaleString()} characters
          </p>
        </div>

        {!htmlMode ? (
          <>
            <BubbleMenu
              editor={editor}
              className="flex gap-0.5 rounded border border-[#c3c4c7] bg-white p-1 shadow-md"
            >
              <WpToolBtn
                title="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Link"
                onClick={() => {
                  setLinkOpen(true);
                  setLinkQ("");
                }}
              >
                <Link2 className="size-4" />
              </WpToolBtn>
            </BubbleMenu>

            <div className="flex flex-wrap items-center gap-0.5 border-b border-[#dcdcde] bg-[#f0f0f1] px-2 py-1.5">
              <select
                value={headingLevel}
                onChange={(e) => setHeading(e.target.value)}
                className="mr-1 h-8 rounded border border-[#8c8f94] bg-white px-2 text-xs text-[#2c3338]"
                aria-label="Paragraph style"
              >
                <option value="normal">Normal</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>

              <WpToolBtn
                title="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Underline"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="size-4" />
              </WpToolBtn>

              <span className="mx-1 h-6 w-px bg-[#c3c4c7]" aria-hidden />

              <WpToolBtn
                title="Align left"
                active={editor.isActive({ textAlign: "left" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
              >
                <AlignLeft className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Align center"
                active={editor.isActive({ textAlign: "center" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
              >
                <AlignCenter className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Align right"
                active={editor.isActive({ textAlign: "right" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
              >
                <AlignRight className="size-4" />
              </WpToolBtn>

              <span className="mx-1 h-6 w-px bg-[#c3c4c7]" aria-hidden />

              <WpToolBtn
                title="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Blockquote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Quote className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Code block"
                active={editor.isActive("codeBlock")}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              >
                <Code2 className="size-4" />
              </WpToolBtn>

              <span className="mx-1 h-6 w-px bg-[#c3c4c7]" aria-hidden />

              <WpToolBtn
                title="Insert link"
                onClick={() => {
                  setLinkOpen(true);
                  setLinkQ("");
                }}
              >
                <Link2 className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Insert image"
                onClick={() => {
                  const url = window.prompt("Image URL");
                  if (url)
                    editor
                      .chain()
                      .focus()
                      .setImage({ src: url, alt: "" })
                      .run();
                }}
              >
                <ImageIcon className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Insert video (YouTube URL)"
                onClick={() => {
                  const url = window.prompt("YouTube embed URL");
                  if (!url) return;
                  editor
                    .chain()
                    .focus()
                    .insertContent(
                      `<iframe src="${url}" title="Video" loading="lazy"></iframe>`,
                    )
                    .run();
                }}
              >
                <Video className="size-4" />
              </WpToolBtn>

              <span className="mx-1 h-6 w-px bg-[#c3c4c7]" aria-hidden />

              <WpToolBtn
                title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
              >
                <Undo2 className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
              >
                <Redo2 className="size-4" />
              </WpToolBtn>
              <WpToolBtn
                title="Clear formatting"
                onClick={() =>
                  editor.chain().focus().clearNodes().unsetAllMarks().run()
                }
              >
                <Eraser className="size-4" />
              </WpToolBtn>
            </div>

            <EditorContent editor={editor} />
          </>
        ) : (
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            className="min-h-[420px] w-full resize-y border-0 bg-[#1e1e1e] p-4 font-mono text-sm text-[#d4d4d4] outline-none"
            spellCheck={false}
          />
        )}
      </div>

      {linkOpen && !htmlMode ? (
        <div className="rounded border border-[#c3c4c7] bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-[#2c3338]">Insert link</p>
          <input
            value={linkQ}
            onChange={(e) => setLinkQ(e.target.value)}
            placeholder="Search HostingBeyond pages or posts"
            className="mt-2 w-full rounded border border-[#8c8f94] px-3 py-2 text-sm"
          />
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {linkResults.map((row) => (
              <li key={row.href}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left hover:bg-[#f0f6fc]"
                  onClick={() => {
                    editor
                      .chain()
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
          </ul>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-[#2271b1]"
            onClick={() => setLinkOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
