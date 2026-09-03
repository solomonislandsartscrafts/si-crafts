/**
 * Shared JSON-LD renderer.
 *
 * The escaping is the whole point of having this in one place. Serialised JSON
 * sits inside a <script> element, so any `<` in the data could otherwise close
 * the tag early and turn CMS-authored content into markup. Escaping `<`, `>`,
 * `&` and `/` to unicode sequences keeps the payload valid JSON while making it
 * impossible to break out of the element.
 *
 * Extracted from src/app/piece/[productCode]/page.tsx, which had this inline.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e')
          .replace(/&/g, '\\u0026')
          .replace(/\//g, '\\u002f'),
      }}
    />
  );
}
