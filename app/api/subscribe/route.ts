// C:\Users\vgsav\Downloads\Waitpage\app\api\subscribe\route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.waitlist.count()
    return Response.json({ ok: true, message: 'subscribe route OK', count })
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, step: 'GET health', code: e?.code, message: e?.message }),
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { email, ref } = await req.json()
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 })
    }

    // retry a few times to avoid rare referralCode collisions
    for (let i = 0; i < 5; i++) {
      const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase()
      try {
        const entry = await prisma.waitlist.create({
          data: { email, referralCode, referredBy: ref ?? null },
        })
        return Response.json({ ok: true, referralCode, id: entry.id })
      } catch (e: any) {
        if (e?.code === 'P2002' && e?.meta?.target?.includes('email')) {
          return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 })
        }
        if (e?.code === 'P2002') continue // duplicate referralCode → try again
        throw e
      }
    }
    return new Response(JSON.stringify({ error: 'Could not generate unique referral code' }), { status: 500 })
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: 'Server error', debug: { code: e?.code, message: e?.message, meta: e?.meta } }),
      { status: 500 }
    )
  }
}
