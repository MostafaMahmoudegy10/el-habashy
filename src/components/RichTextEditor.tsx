import { useEffect } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FiBold,
  FiItalic,
  FiLink2,
  FiList,
  FiMessageSquare,
  FiMinus,
  FiType,
} from "react-icons/fi";

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "font-bold text-amber-700 underline underline-offset-4",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-56 rounded-b-xl bg-white px-4 py-4 text-sm font-medium leading-7 text-slate-700 outline-none",
      },
    },
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const addLink = () => {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("URL", current ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-amber-400 focus-within:shadow-md">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/90 p-2">
          <ToolButton active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} label="H1">
            <FiType />
          </ToolButton>
          <ToolButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} label="H2">
            <FiType />
          </ToolButton>
          <ToolButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} label="Bold">
            <FiBold />
          </ToolButton>
          <ToolButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} label="Italic">
            <FiItalic />
          </ToolButton>
          <ToolButton active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} label="List">
            <FiList />
          </ToolButton>
          <ToolButton active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} label="Quote">
            <FiMessageSquare />
          </ToolButton>
          <ToolButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} label="Rule">
            <FiMinus />
          </ToolButton>
          <ToolButton active={editor?.isActive("link")} onClick={addLink} label="Link">
            <FiLink2 />
          </ToolButton>
        </div>
        <EditorContent
          editor={editor}
          className="
            [&_.ProseMirror>*+*]:mt-3
            [&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-amber-700 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4
            [&_.ProseMirror_blockquote]:border-s-4 [&_.ProseMirror_blockquote]:border-amber-500 [&_.ProseMirror_blockquote]:bg-amber-50 [&_.ProseMirror_blockquote]:px-4 [&_.ProseMirror_blockquote]:py-2 [&_.ProseMirror_blockquote]:text-slate-800
            [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-black [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:text-slate-950
            [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h2]:leading-tight [&_.ProseMirror_h2]:text-slate-950
            [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-black [&_.ProseMirror_h3]:text-slate-950
            [&_.ProseMirror_hr]:border-slate-200
            [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ps-6
            [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-slate-400 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          "
        />
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-black transition ${
        active
          ? "border-amber-300 bg-amber-100 text-slate-950"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50"
      }`}
      title={label}
      aria-label={label}
    >
      {children}
      {label.startsWith("H") ? <span>{label}</span> : null}
    </button>
  );
}
