import { SignCard } from '@/components/zodiac/SignCard';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import { SCOPE_META } from '@/features/horoscope/types';
import type { Scope } from '@/features/horoscope/types';

interface SignPickerProps {
  scope: Scope;
  title?: string;
}

/** Rejilla de los 12 signos que enlaza al horóscopo del scope indicado. */
export function SignPicker({ scope, title }: SignPickerProps) {
  const path = SCOPE_META[scope].path;

  return (
    <section aria-label="Elegir signo">
      {title && (
        <h2 className="mb-4 font-display text-xl text-ink">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ZODIAC_SIGNS.map((slug) => (
          <SignCard
            key={slug}
            sign={ZODIAC[slug]}
            size="sm"
            to={`/horoscopo/${path}/${slug}`}
          />
        ))}
      </div>
    </section>
  );
}
