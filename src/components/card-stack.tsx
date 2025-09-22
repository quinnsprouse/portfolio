"use client"

import {
  animate,
  easeIn,
  mix,
  motion,
  progress,
  useMotionValue,
  useTransform,
  wrap,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface CardImage {
  src: string
  ratio: number
  srcSet: string
  width: number
  height: number
  alt?: string
}

interface CardStackProps {
  images?: CardImage[]
  maxRotate?: number
}

interface StackImageProps {
  src: string
  ratio: number
  index: number
  totalImages: number
  currentIndex: number
  maxRotate: number
  minDistance: number
  minSpeed: number
  setNextImage: () => void
  containerSize: number
  onInteract: () => void
}

const defaultImages: CardImage[] = [
  {
    src: '/images/optimized/photo-JtrwPxnjdA37BdPP-640.webp',
    srcSet: '/images/optimized/photo-JtrwPxnjdA37BdPP-320.webp 320w, /images/optimized/photo-JtrwPxnjdA37BdPP-640.webp 640w',
    ratio: 2 / 3,
    width: 640,
    height: 960,
    alt: 'Outdoors landscape photograph',
  },
  {
    src: '/images/optimized/photo-Vh1X4nx6YrXLuwjA (1)-640.webp',
    srcSet: '/images/optimized/photo-Vh1X4nx6YrXLuwjA (1)-320.webp 320w, /images/optimized/photo-Vh1X4nx6YrXLuwjA (1)-640.webp 640w',
    ratio: 3 / 2,
    width: 640,
    height: 427,
    alt: 'River bank photograph',
  },
  {
    src: '/images/optimized/photo-59pYq5cxKfGmZ3Wi-640.webp',
    srcSet: '/images/optimized/photo-59pYq5cxKfGmZ3Wi-320.webp 320w, /images/optimized/photo-59pYq5cxKfGmZ3Wi-640.webp 640w',
    ratio: 2 / 3,
    width: 640,
    height: 960,
    alt: 'Portrait street photograph',
  },
  {
    src: '/images/optimized/photo-CCrzUlQEJZtPr7iB-640.webp',
    srcSet: '/images/optimized/photo-CCrzUlQEJZtPr7iB-320.webp 320w, /images/optimized/photo-CCrzUlQEJZtPr7iB-640.webp 640w',
    ratio: 2 / 3,
    width: 640,
    height: 960,
    alt: 'Portrait ocean photograph',
  },
]

export function CardStack({ images = defaultImages, maxRotate = 5 }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLUListElement>(null)
  const [size, setSize] = useState(360)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      if (containerRef.current) {
        setSize(containerRef.current.offsetWidth)
      }
    }

    updateSize()

    const observer = new ResizeObserver(() => updateSize())
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <ul
          ref={containerRef}
          className="relative list-none p-0"
          style={{
            width: 'clamp(220px, 40vw, 340px)',
            height: 'clamp(220px, 40vw, 340px)',
          }}
        >
          {images.map((image, index) => (
            <StackImage
              key={image.src}
              {...image}
              index={index}
              currentIndex={currentIndex}
              totalImages={images.length}
              maxRotate={maxRotate}
              minDistance={size * 0.45}
              minSpeed={110}
              containerSize={size}
              setNextImage={() => setCurrentIndex(wrap(0, images.length, currentIndex + 1))}
              onInteract={() => setHasInteracted(true)}
            />
          ))}
        </ul>

        <div className="mt-4 flex h-4 items-center justify-center">
          <span
            className={`text-[0.625rem] font-medium uppercase tracking-[0.32em] text-muted-foreground transition-opacity duration-200 ${
              hasInteracted ? 'opacity-0' : 'opacity-80'
            }`}
            aria-hidden={hasInteracted}
          >
            Drag a card
          </span>
        </div>
      </div>
    </div>
  )
}

function StackImage({
  src,
  ratio,
  srcSet,
  width: intrinsicWidth,
  height: intrinsicHeight,
  alt,
  index,
  currentIndex,
  totalImages,
  maxRotate,
  setNextImage,
  minDistance,
  minSpeed,
  containerSize,
  onInteract,
}: StackImageProps) {
  const baseRotation = mix(0, maxRotate, Math.sin(index))
  const x = useMotionValue(0)
  const rotate = useTransform(x, [0, 400], [baseRotation, baseRotation + 10], {
    clamp: false,
  })

  const zIndex = totalImages - wrap(totalImages, 0, index - currentIndex + 1)

  const handleDragEnd = () => {
    const distance = Math.abs(x.get())
    const speed = Math.abs(x.getVelocity())

    if (distance > minDistance || speed > minSpeed) {
      setNextImage()
      animate(x, 0, {
        type: 'spring',
        stiffness: 600,
        damping: 50,
      })
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 50,
      })
    }
  }

  const stackProgress = progress(0, totalImages - 1, zIndex)
  const scale = mix(0.78, 1, easeIn(stackProgress))

  const portrait = ratio < 1
  const landscapeScale = portrait ? 1 : 0.86
  const base = containerSize * landscapeScale
  const displayWidth = portrait ? base * ratio : base
  const displayHeight = portrait ? base : base / ratio

  return (
    <motion.li
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] bg-muted/40 shadow-[0_20px_45px_rgba(15,23,42,0.22)]"
      style={{
        width: displayWidth,
        height: displayHeight,
        zIndex,
        rotate,
        x,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      drag={index === currentIndex ? 'x' : false}
      onDragEnd={handleDragEnd}
      onDragStart={() => {
        if (index === currentIndex) {
          onInteract()
        }
      }}
      onPointerDown={() => {
        if (index === currentIndex) {
          onInteract()
        }
      }}
      whileTap={index === currentIndex ? { scale: 0.96 } : undefined}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes="(min-width: 1024px) 340px, (min-width: 768px) 280px, 60vw"
        width={intrinsicWidth}
        height={intrinsicHeight}
        alt={alt ?? 'Selected work'}
        className="h-full w-full object-cover"
        draggable={false}
        loading={zIndex >= 1 ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={zIndex >= 1 ? 'high' : 'low'}
        onPointerDown={(event) => event.preventDefault()}
      />
    </motion.li>
  )
}
