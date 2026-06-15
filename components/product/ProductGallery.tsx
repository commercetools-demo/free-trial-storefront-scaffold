'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  // Clamp instead of resetting in an effect; parent passes a `key` to remount on variant change.
  const current = active < images.length ? active : 0;

  if (images.length === 0) {
    return <div className="aspect-[3/4] w-full rounded-3xl bg-mist grid place-items-center text-ink/30">No image</div>;
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                i === current ? 'border-violet' : 'border-transparent'
              }`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-3xl bg-mist">
        <Image
          src={images[current]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
