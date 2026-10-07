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
import { useCallback, useEffect, useState } from "react";

import {
  CalloutExtension,
  CtaBlockExtension,
} from "@/lib/blog/tiptap-extensions";
import { uploadOrbitFile } from "@/lib/orbit/upload-orbit-file";

function ToolbarButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold ${
        active
          ? "border-[#673de6] bg-violet-50 text-[#673de6]"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [blockOpen, setBlockOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkQ, setLinkQ] = useState("");
  const [linkResults, setLinkResults] = useState<
    { title: string; href: string }[]
  >([]);

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
        placeholder: "Start writing, or type / for blocks…",
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "hb-orbit-editor-canvas min-h-[420px] px-1 py-2 text-[17px] leading-[1.75] text-slate-800 outline-none",
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
          const transaction = view.state.tr.insert(coordinates.pos, node);
          view.dispatch(transaction);
        });
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const insertInternalLink = useCallback(async () => {
    if (!editor) return;
    const res = await fetch(
      `/api/orbit/blog/internal-links?q=${encodeURIComponent(linkQ)}`,
    );
    const json = await res.json();
    setLinkResults(json.results ?? []);
    setLinkOpen(true);
  }, [editor, linkQ]);

  useEffect(() => {
    if (!linkOpen) return;
    void insertInternalLink();
  }, [linkOpen, linkQ, insertInternalLink]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-violet-100/80 bg-white shadow-sm">
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <ToolbarButton
            label="B"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          />
          <ToolbarButton
            label="I"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          />
          <ToolbarButton
            label="U"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          />
          <ToolbarButton
            label="Link"
            onClick={() => {
              setLinkOpen(true);
              setLinkQ("");
            }}
          />
          <ToolbarButton
            label="Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          />
        </BubbleMenu>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2">
        <ToolbarButton
          label="H2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label="H3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <ToolbarButton
          label="• List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Check"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />
        <ToolbarButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Code"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="Table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        />
        <ToolbarButton
          label="—"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton
          label="Link"
          onClick={() => {
            setLinkOpen(true);
            setLinkQ("");
          }}
        />
        <div className="relative">
          <ToolbarButton
            label="+ Block"
            onClick={() => setBlockOpen((v) => !v)}
          />
          {blockOpen ? (
            <div className="absolute top-full left-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {(
                [
                  {
                    label: "Callout",
                    run: () =>
                      editor
                        .chain()
                        .focus()
                        .insertContent({
                          type: "callout",
                          attrs: { variant: "info" },
                          content: [{ type: "paragraph" }],
                        })
                        .run(),
                  },
                  {
                    label: "CTA",
                    run: () =>
                      editor
                        .chain()
                        .focus()
                        .insertContent({ type: "hbCta", attrs: {} })
                        .run(),
                  },
                  {
                    label: "Image",
                    run: () => {
                      const url = window.prompt("Image URL");
                      if (url)
                        editor
                          .chain()
                          .focus()
                          .setImage({ src: url, alt: "" })
                          .run();
                    },
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-violet-50"
                  onClick={() => {
                    item.run();
                    setBlockOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <EditorContent editor={editor} />

      {linkOpen ? (
        <div className="border-t border-slate-100 p-3">
          <p className="text-xs font-semibold text-slate-600">Insert link</p>
          <input
            value={linkQ}
            onChange={(e) => setLinkQ(e.target.value)}
            placeholder="Search pages or posts"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {linkResults.map((row) => (
              <li key={row.href}>
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-1 text-left hover:bg-violet-50"
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
                  <span className="ml-2 text-xs text-slate-400">
                    {row.href}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-slate-500"
            onClick={() => setLinkOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
