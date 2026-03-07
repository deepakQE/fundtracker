"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

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
  const candidateSources = useMemo(() => {
    const values: string[] = []
    if (src) {
      const globalGivingMatch = src.match(/\/pfil\/(\d+)\//)
      if (globalGivingMatch?.[1]) {
        const projectId = globalGivingMatch[1]
        values.push(`https://www.globalgiving.org/pfil/${projectId}/pict_original.jpg`)
        values.push(`https://www.globalgiving.org/pfil/${projectId}/pict_large.jpg`)
      }
      values.push(src)
    }
    values.push(fallback)
    return Array.from(new Set(values))
  }, [src])

  const [sourceIndex, setSourceIndex] = useState(0)
  const currentSrc = candidateSources[sourceIndex] || fallback

  useEffect(() => {
    setSourceIndex(0)
  }, [src])

  const handleError = () => {
    setSourceIndex((index) => {
      if (index >= candidateSources.length - 1) {
        return index
      }
      return index + 1
    })
  }

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
      onError={handleError}
    />
  )
}
