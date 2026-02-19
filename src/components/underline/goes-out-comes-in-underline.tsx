'use client'

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LazyMotion,
  domAnimation,
  m,
  useAnimationControls,
  useReducedMotion,
  type ValueAnimationTransition,
} from 'motion/react'

import { cn } from '@/lib/utils'

type Direction = 'left' | 'right'

type Props<T extends ElementType> = {
  children: ReactNode
  as?: T
  direction?: Direction
  className?: string
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
  transition?: ValueAnimationTransition
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

export function GoesOutComesInUnderline<T extends ElementType = 'span'>({
  children,
  as,
  direction = 'left',
  className,
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  transition = { duration: 0.5, ease: 'easeOut' },
  ...props
}: Props<T>) {
  const prefersReducedMotion = useReducedMotion()
  const controls = useAnimationControls()
  const [blocked, setBlocked] = useState(false)
  const textRef = useRef<HTMLElement | null>(null)
  const MotionComponent = useMemo(() => m.create(as ?? 'span'), [as])

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (!textRef.current) return
      const styles = getComputedStyle(textRef.current)
      const fontSize = parseFloat(styles.fontSize)
      const underlineHeight = fontSize * underlineHeightRatio
      const underlinePadding = fontSize * underlinePaddingRatio
      const textWidth =
        textRef.current
          .querySelector('[data-underline-text]')
          ?.getBoundingClientRect().width ??
        textRef.current.getBoundingClientRect().width
      textRef.current.style.setProperty(
        '--underline-height',
        `${underlineHeight}px`
      )
      textRef.current.style.setProperty(
        '--underline-padding',
        `${underlinePadding}px`
      )
      textRef.current.style.setProperty('--underline-width', `${textWidth}px`)
    }

    updateUnderlineStyles()
    window.addEventListener('resize', updateUnderlineStyles)
    return () => window.removeEventListener('resize', updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const originOut = direction === 'left' ? 'left' : 'right'
  const originIn = direction === 'left' ? 'right' : 'left'

  const animate = async () => {
    if (blocked || prefersReducedMotion) return

    setBlocked(true)

    // Phase 1: line goes out from the direction side
    controls.set({ transformOrigin: originOut })
    await controls.start({ scaleX: 0, transition })

    // Phase 2: line comes back in from the opposite side
    controls.set({ transformOrigin: originIn })
    await controls.start({ scaleX: 1, transition })

    // Reset origin for next hover
    controls.set({ transformOrigin: originOut })

    setBlocked(false)
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionComponent
        className={cn('relative inline-block cursor-pointer', className)}
        onHoverStart={animate}
        ref={textRef}
        {...props}
      >
        <span className="relative z-10 inline-block" data-underline-text>
          {children}
        </span>
        <m.span
          className="absolute left-0 bg-current"
          initial={{ scaleX: 1, transformOrigin: originOut }}
          style={{
            height: 'var(--underline-height)',
            bottom: 'calc(-1 * var(--underline-padding))',
            width: 'var(--underline-width, 100%)',
          }}
          animate={controls}
          aria-hidden="true"
        />
      </MotionComponent>
    </LazyMotion>
  )
}

GoesOutComesInUnderline.displayName = 'GoesOutComesInUnderline'
