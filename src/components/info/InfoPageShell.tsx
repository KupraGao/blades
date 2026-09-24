import type { ReactNode } from "react";

type InfoPageShellProps = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export function InfoPageShell({ title, intro, children }: InfoPageShellProps) {
  return (
    <article className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {intro}
          </p>
        ) : null}
      </header>

      <div className="max-w-2xl space-y-8 text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
        {children}
      </div>
    </article>
  );
}

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export const infoLinkClassName =
  "font-medium text-zinc-900 underline-offset-2 transition hover:text-brand-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:text-white dark:focus-visible:ring-offset-zinc-900";
