import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class lists and keeps truthy conditional classes', () => {
    expect(
      cn('p-2', ['text-sm'], {
        'font-semibold': true,
        italic: false,
      })
    ).toBe('p-2 text-sm font-semibold')
  })

  it('resolves conflicting tailwind classes in favor of later values', () => {
    expect(cn('p-2 text-sm', 'p-4', 'text-lg')).toBe('p-4 text-lg')
  })
})
