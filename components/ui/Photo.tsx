"use client";

import Image from "next/image";
import { useState } from "react";
import { PHOTOS, photoUrl, type PhotoKey } from "@/lib/images";
import { useI18n } from "@/lib/i18n";

interface Props {
  name: PhotoKey;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Photo width requested from Unsplash before Next optimises it. */
  width?: number;
}

/**
 * A graded, grained photo that fills its (relatively positioned) parent.
 * If the image can't load, a designed "photo pending" plate takes its place
 * instead of a broken-image icon.
 */
export function Photo({ name, alt, sizes, priority, className = "", width = 1800 }: Props) {
  const photo = PHOTOS[name];
  const { locale } = useI18n();
  const [failed, setFailed] = useState(false);

  return (
    <div className={`grain absolute inset-0 overflow-hidden bg-asphalt-3 ${className}`}>
      {failed ? (
        <div
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          className="absolute inset-0 flex items-end bg-asphalt-3 p-3 text-paper"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(242,241,236,.05) 0 1px, transparent 1px 14px)",
          }}
        >
          <span className="label max-w-[28ch] text-paper/55">▧ {photo.subject[locale]}</span>
        </div>
      ) : (
        <Image
          src={photoUrl(photo.id, width)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="photo-grade object-cover"
          style={{ objectPosition: "focus" in photo ? photo.focus : "50% 50%" }}
        />
      )}
    </div>
  );
}
