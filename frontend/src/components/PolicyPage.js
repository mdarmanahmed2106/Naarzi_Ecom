import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Shared layout for the written policies. Each section is a heading plus blocks:
// a string is a paragraph, { list: [...] } a bulleted list, { h3: '...' } a sub-heading.
// Writing support@naarzi.com anywhere in the text makes it a mail link.
const EMAIL = 'support@naarzi.com';

function withEmailLink(text) {
  const parts = text.split(EMAIL);
  return parts.flatMap((part, i) => (i === 0 ? [part] : [
    <a key={i} href={`mailto:${EMAIL}`} className="text-primary underline underline-offset-2">{EMAIL}</a>,
    part,
  ]));
}

function Block({ block }) {
  if (typeof block === 'string') return <p>{withEmailLink(block)}</p>;
  if (block.h3) return <h3 className="text-lg font-semibold text-on-surface pt-2">{block.h3}</h3>;
  if (block.list) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {block.list.map((item) => <li key={item}>{withEmailLink(item)}</li>)}
      </ul>
    );
  }
  return null;
}

export default function PolicyPage({ title, effective, intro = [], sections, closing = [], related }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full text-on-surface">
        <h1 className="text-4xl font-display-lg mb-2">{title}</h1>
        <p className="text-sm text-on-surface-variant mb-10">Effective date: {effective}</p>

        <div className="space-y-8 font-body-md text-base leading-relaxed text-on-surface/80">
          {intro.map((p) => <p key={p}>{withEmailLink(p)}</p>)}

          {sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="text-2xl font-headline-sm text-on-surface">{s.heading}</h2>
              {s.blocks.map((b, i) => <Block key={i} block={b} />)}
            </section>
          ))}

          {closing.map((p) => <p key={p} className="text-sm">{withEmailLink(p)}</p>)}

          {related && (
            <p className="text-sm">
              See also our <Link href={related.href} className="text-primary underline underline-offset-2">{related.label}</Link>.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
