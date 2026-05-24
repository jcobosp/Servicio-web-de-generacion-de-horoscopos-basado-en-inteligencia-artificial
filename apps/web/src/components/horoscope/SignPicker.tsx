import { SignCard } from '@/components/zodiac/SignCard';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';

interface SignPickerProps {
  /** Construye el destino del enlace para cada signo. */
  hrefFor: (slug: ZodiacSign) => string;
  title?: string;
}

/** Rejilla de los 12 signos que enlaza al destino indicado por signo. */
export function SignPicker({ hrefFor, title }: SignPickerProps) {
  return (
    <section aria-label="Elegir signo">
      {title && <h2 className="mb-4 font-display text-xl text-ink">{title}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ZODIAC_SIGNS.map((slug) => (
          <SignCard
            key={slug}
            sign={ZODIAC[slug]}
            size="sm"
            to={hrefFor(slug)}
          />
        ))}
      </div>
    </section>
  );
}
