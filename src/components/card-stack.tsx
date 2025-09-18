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

interface CardStackProps {
  images?: { src: string; ratio: number }[]
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
}

const defaultImages: { src: string; ratio: number }[] = [
  { src: '/images/photo-JtrwPxnjdA37BdPP.webp', ratio: 4 / 3 },
  { src: '/images/photo-Vh1X4nx6YrXLuwjA (1).webp', ratio: 4 / 3 },
  { src: '/images/photo-59pYq5cxKfGmZ3Wi.webp', ratio: 3 / 4 },
  { src: '/images/photo-CCrzUlQEJZtPr7iB.webp', ratio: 3 / 4 },
]

export function CardStack({ images = defaultImages, maxRotate = 5 }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLUListElement>(null)
  const [size, setSize] = useState(360)

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
          />
        ))}
      </ul>
    </div>
  )
}

function StackImage({
  src,
  ratio,
  index,
  currentIndex,
  totalImages,
  maxRotate,
  setNextImage,
  minDistance,
  minSpeed,
  containerSize,
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
  const width = portrait ? base * ratio : base
  const height = portrait ? base : base / ratio

  return (
    <motion.li
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] bg-muted/40 shadow-[0_20px_45px_rgba(15,23,42,0.22)]"
      style={{
        width,
        height,
        zIndex,
        rotate,
        x,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      drag={index === currentIndex ? 'x' : false}
      onDragEnd={handleDragEnd}
      whileTap={index === currentIndex ? { scale: 0.96 } : undefined}
    >
      <img
        src={src}
        alt="Selected work"
        className="h-full w-full object-cover"
        draggable={false}
        loading={index === currentIndex ? 'eager' : 'lazy'}
        decoding="async"
        sizes="(min-width: 768px) 340px, 60vw"
        onPointerDown={(event) => event.preventDefault()}
      />
    </motion.li>
  )
}
