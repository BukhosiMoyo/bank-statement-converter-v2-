import { SiteHeader } from "@/components/site-header";

type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{intro}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Updated {updatedAt}
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-sm leading-7 text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
