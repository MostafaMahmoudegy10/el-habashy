const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "EM",
  "H1",
  "H2",
  "H3",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "U",
  "UL",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return value.startsWith("/") || value.startsWith("#");
  }
}

function cleanElement(element: Element) {
  Array.from(element.children).forEach(cleanElement);

  if (!allowedTags.has(element.tagName)) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (element.tagName === "A" && name === "href" && isSafeUrl(value)) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer");
      return;
    }

    element.removeAttribute(attribute.name);
  });
}

export function sanitizeRichText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (typeof DOMParser === "undefined" || typeof document === "undefined") {
    return escapeHtml(trimmed);
  }

  const parsed = new DOMParser().parseFromString(trimmed, "text/html");
  Array.from(parsed.body.children).forEach(cleanElement);
  return parsed.body.innerHTML;
}

export function stripRichText(value: string) {
  if (!value.trim()) return "";

  if (typeof DOMParser !== "undefined") {
    const parsed = new DOMParser().parseFromString(value, "text/html");
    return (parsed.body.textContent ?? "").replace(/\s+/g, " ").trim();
  }

  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
