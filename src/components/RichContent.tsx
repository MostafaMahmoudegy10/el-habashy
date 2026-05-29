import { sanitizeRichText } from "../lib/richText";

export function RichContent({ value, compact = false }: { value: string; compact?: boolean }) {
  const html = sanitizeRichText(value);
  if (!html) return null;

  return (
    <div
      className={`text-sm font-medium leading-8 text-slate-600
        [&>*+*]:mt-4
        [&_a]:font-bold [&_a]:text-amber-700 [&_a]:underline [&_a]:underline-offset-4
        [&_blockquote]:rounded-2xl [&_blockquote]:border-s-4 [&_blockquote]:border-amber-500 [&_blockquote]:bg-amber-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-800
        [&_h1]:text-4xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-slate-950
        [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-slate-950
        [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-950
        [&_ol]:list-decimal [&_ol]:ps-6
        [&_ul]:list-disc [&_ul]:ps-6
        ${compact ? "line-clamp-3" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
