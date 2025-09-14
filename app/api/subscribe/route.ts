// C:\Users\vgsav\Downloads\Waitpage\app\api\subscribe\route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function makeRefCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

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
    const body = await req.json()
    const rawEmail = typeof body?.email === 'string' ? body.email : ''
    const email = rawEmail.trim().toLowerCase()
    const ref = typeof body?.ref === 'string' ? body.ref.trim() : null

    if (!isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), { status: 400 })
    }

    // Helper: compute ahead, position and totals for a given row
    const computePlace = async (createdAt: Date) => {
      const ahead = await prisma.waitlist.count({
        where: { createdAt: { lt: createdAt } },
      })
      const total = await prisma.waitlist.count()
      return { ahead, position: ahead + 1, total }
    }

    // Try to create a fresh row with a unique referralCode.
    // If email already exists, return their position instead of erroring.
    for (let i = 0; i < 5; i++) {
      const referralCode = makeRefCode()
      try {
        const entry = await prisma.waitlist.create({
          data: { email, referralCode, referredBy: ref ?? null },
        })

        const place = await computePlace(entry.createdAt)
        return Response.json({
          ok: true,
          created: true,
          id: entry.id,
          email: entry.email,
          referralCode: entry.referralCode,
          referredBy: entry.referredBy,
          createdAt: entry.createdAt,
          ...place,
        })
      } catch (e: any) {
        // Unique constraint on email -> they already signed up; return their current position.
        if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('email')) {
          const existing = await prisma.waitlist.findUnique({ where: { email } })
          if (!existing) {
            // Extremely rare: unique constraint says exists but we can't find it — treat as server error.
            return new Response(JSON.stringify({ ok: false, error: 'Email already registered but not found' }), {
              status: 500,
            })
          }
          const place = await computePlace(existing.createdAt)
          return Response.json({
            ok: true,
            created: false,
            alreadyRegistered: true,
            id: existing.id,
            email: existing.email,
            referralCode: existing.referralCode,
            referredBy: existing.referredBy,
            createdAt: existing.createdAt,
            ...place,
          })
        }

        // Unique constraint on referralCode -> try another code
        if (e?.code === 'P2002') continue

        // Any other error -> bubble up
        throw e
      }
    }

    return new Response(JSON.stringify({ ok: false, error: 'Could not generate unique referral code' }), {
      status: 500,
    })
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Server error',
        debug: { code: e?.code, message: e?.message, meta: e?.meta },
      }),
      { status: 500 }
    )
  }
}
