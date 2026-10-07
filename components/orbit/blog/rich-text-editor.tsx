"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write your article…" }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#673de6]/30 prose prose-slate max-w-none",
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

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {(
          [
            {
              label: "B",
              run: () => editor.chain().focus().toggleBold().run(),
            },
            {
              label: "I",
              run: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              label: "U",
              run: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
              label: "H2",
              run: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
              label: "H3",
              run: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
            },
            {
              label: "•",
              run: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
              label: "1.",
              run: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
              label: "❝",
              run: () => editor.chain().focus().toggleBlockquote().run(),
            },
            {
              label: "Code",
              run: () => editor.chain().focus().toggleCodeBlock().run(),
            },
            {
              label: "—",
              run: () => editor.chain().focus().setHorizontalRule().run(),
            },
          ] as const
        ).map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.run}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url)
              editor.chain().focus().setImage({ src: url, alt: "" }).run();
          }}
        >
          Image
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
