import { createHash, timingSafeEqual } from 'crypto'
import { createServerFn } from '@tanstack/react-start'

import {
  getCurrentSessionVersion,
  type ToolSessionData,
  useToolSession,
} from './session'

type UnlockToolInput = {
  password: string
}

type UnlockToolResult =
  | { success: true }
  | { success: false; error: string }

type ToolAccessResult = {
  hasToolAccess: boolean
  unlockedAt: string | null
}

const DEFAULT_PASSWORD_HASH =
  '45d4c7a121e221561c4081bab87bc9c6efd3a2528627e49a57acb8bc53399512'

function getPasswordHash() {
  return process.env.TOOLS_PASSWORD_HASH ?? process.env.APPLET_PASSWORD_HASH ?? DEFAULT_PASSWORD_HASH
}

function normalizePassword(password: string) {
  return password.normalize('NFKC')
}

function hashPassword(password: string) {
  return createHash('sha256').update(normalizePassword(password)).digest('hex')
}

function verifyPassword(password: string) {
  const expectedHash = getPasswordHash()
  const providedHash = hashPassword(password)

  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const providedBuffer = Buffer.from(providedHash, 'hex')

  if (expectedBuffer.byteLength !== providedBuffer.byteLength) {
    return false
  }

  return timingSafeEqual(expectedBuffer, providedBuffer)
}

async function markSession({
  hasToolAccess,
}: {
  hasToolAccess: boolean
}) {
  const session = await useToolSession()

  if (!hasToolAccess) {
    await session.update({
      hasToolAccess: false,
      unlockedAt: undefined,
      sessionVersion: getCurrentSessionVersion(),
    })
    return
  }

  await session.update({
    hasToolAccess: true,
    unlockedAt: new Date().toISOString(),
    sessionVersion: getCurrentSessionVersion(),
  })
}

export const unlockToolsAreaFn = createServerFn({ method: 'POST' })
  .inputValidator((data: UnlockToolInput) => data)
  .handler(async ({ data }): Promise<UnlockToolResult> => {
    const password = data.password?.trim()

    if (!password) {
      return {
        success: false,
        error: 'Password required.',
      }
    }

    if (!verifyPassword(password)) {
      return {
        success: false,
        error: 'That password does not match.',
      }
    }

    await markSession({ hasToolAccess: true })

    return { success: true }
  })

export const lockToolsAreaFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const session = await useToolSession()
    await session.clear()
    return { success: true }
  },
)

export const getToolAccessFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ToolAccessResult> => {
    const session = await useToolSession()
    const sessionVersion = getCurrentSessionVersion()
    const data: ToolSessionData = session.data ?? {}

    const hasToolAccess =
      data.hasToolAccess === true &&
      data.sessionVersion === sessionVersion

    if (!hasToolAccess && data.hasToolAccess) {
      await session.update({
        hasToolAccess: false,
        unlockedAt: undefined,
        sessionVersion,
      })
    }

    return {
      hasToolAccess,
      unlockedAt: hasToolAccess ? data.unlockedAt ?? null : null,
    }
  },
)
