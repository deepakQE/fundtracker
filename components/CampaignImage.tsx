"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

type CampaignImageProps = {
  src?: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
}

export default function CampaignImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
}: CampaignImageProps) {
  const fallback = "/default-campaign.svg"
  const normalized = useMemo(() => src || fallback, [src])
  const [currentSrc, setCurrentSrc] = useState(normalized)

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      quality={100}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setCurrentSrc(fallback)}
    />
  )
}
