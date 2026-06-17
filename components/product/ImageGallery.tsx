'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations('product');
  const [active, setActive] = useState(0);
  // Derive a valid index rather than resetting via an effect.
  const current = active < images.length ? active : 0;

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-sm bg-cream-dark text-charcoal-light">
        {t('noImage')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-cream-dark">
        <Image
          src={images[current]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border ${
                i === current ? 'border-charcoal' : 'border-border'
              }`}
              aria-label={t('viewImage', { n: i + 1 })}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
