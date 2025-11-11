import { useSession } from '@tanstack/react-start/server'

export type ToolSessionData = {
  hasToolAccess?: boolean
  unlockedAt?: string
  sessionVersion?: string
}

const DEFAULT_SESSION_NAME = 'tool-session'
const DEFAULT_SESSION_MAX_AGE = 12 * 60 * 60 // 12 hours

function getSessionSecret() {
  const secret =
    process.env.TOOLS_SESSION_SECRET ?? process.env.APPLET_SESSION_SECRET

  if (!secret) {
    throw new Error('TOOLS_SESSION_SECRET must be defined for the tools gate.')
  }

  return secret
}

export function getCurrentSessionVersion() {
  return process.env.TOOLS_SESSION_VERSION ?? process.env.APPLET_SESSION_VERSION ?? '1'
}

export function useToolSession() {
  return useSession<ToolSessionData>({
    name: process.env.TOOLS_SESSION_NAME ?? process.env.APPLET_SESSION_NAME ?? DEFAULT_SESSION_NAME,
    password: getSessionSecret(),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: DEFAULT_SESSION_MAX_AGE,
    },
  })
}
