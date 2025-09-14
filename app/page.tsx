'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic' // avoid prerender SSR for this page

const features = [
  { title: 'Track Your Progress', description: 'Log your races, analyze splits, and watch your progress soar with detailed analytics.', icon: '📈' },
  { title: 'Compete & Earn', description: 'Join virtual competitions and earn Track Coins for hitting personal bests.', icon: '🏆' },
  { title: 'Ranked System', description: 'Climb through Bronze, Silver, Gold, Platinum, Diamond, and Godspeed tiers.', icon: '🥇' },
  { title: 'Track Coin Betting', description: 'Bet Track Coins on races and competitions to multiply your rewards.', icon: '🪙' },
  { title: 'Connect & Share', description: 'Build your athlete profile, share achievements, and connect with fellow runners.', icon: '🤝' },
  { title: 'AI Analysis', description: 'Get personalized insights and form analysis powered by advanced AI.', icon: '🤖' }
]

export default function Page() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)

  // client-only refs stored in localStorage
  const [myRef, setMyRef] = useState<string>('')        // your personal referral code
  const [storedRef, setStoredRef] = useState<string | null>(null) // ?ref= someone else's code

  // Capture ?ref= for referral tracking (client only)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('ref')
      if (r) {
        window.localStorage.setItem('trackverse_ref', r)
        setStoredRef(r)
      } else {
        const existing = window.localStorage.getItem('trackverse_ref')
        if (existing) setStoredRef(existing)
      }
    } catch {}
  }, [])

  // Initialize or load your own referral code (client only)
  useEffect(() => {
    try {
      let mine = window.localStorage.getItem('my_ref')
      if (!mine) {
        mine = Math.random().toString(36).slice(2, 8).toUpperCase()
        window.localStorage.setItem('my_ref', mine)
      }
      setMyRef(mine)
    } catch {}
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API expects { email, ref }
        body: JSON.stringify({ email, ref: storedRef ?? null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to join waitlist')

      setSubmitted(true)
      setRefCode(myRef || null)
      setWaitlistPosition(typeof data.position === 'number' ? data.position : null)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${myRef || ''}`
      : `https://trackverse.app/?ref=${myRef || ''}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <main className="h-screen bg-gradient-to-br from-primary via-secondary to-accent overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-black/20 grid place-items-center font-bold">TV</div>
          <span className="font-semibold text-xl">Track<span className="text-accent">Verse</span></span>
        </div>
        <div className="text-sm md:text-base bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm animate-pulse">
          🎉 First 2,000 members get Pro free for 3 months + 1,000 Track Coins
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-2 grid lg:grid-cols-2 gap-6 items-center h-[calc(100vh-3rem)]">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200 animate-gradient">
            Track & Field Goes Social
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-accent/90">
            Join the Future of Athletic Achievement
          </h2>

          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            TrackVerse is revolutionizing how track athletes train, compete, and connect.
            Be part of the first social platform that combines performance tracking, AI analysis,
            ranked competition tiers, and Track Coin betting—all in one powerful app.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-1 bg-black/10 rounded-lg p-1.5 backdrop-blur-sm border border-white/10">
                <div className="text-lg">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-primary sm:max-w-md"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Joining...' : 'Get Early Access'}
                </button>
              </div>
              {error && <p className="text-sm text-red-200">{error}</p>}
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-2xl font-bold">🎉 You're on the waitlist!</h3>
              {waitlistPosition !== null && (
                <p className="text-lg">
                  There are <span className="font-bold text-accent">{waitlistPosition}</span> people ahead of you
                </p>
              )}
              <p className="text-base">Share your link to move up the line:</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input readOnly value={shareUrl} className="input-primary bg-white/90" />
                <button onClick={copyToClipboard} className="btn-primary bg-accent text-black hover:brightness-110">
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>

              <p className="text-sm text-white/80">
                Your referral code:{' '}
                <span className="font-mono bg-black/20 px-2 py-1 rounded">{refCode ?? myRef}</span>
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 max-w-xs">
            <Stat num="300+" label="Athletes" />
            <Stat num="400+" label="Beta Invites Reserved" />
            <Stat num="1.2M+" label="Track Coins Bonus Pool" />
          </div>
        </div>

        {/* App Preview */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-2 bg-black/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="aspect-[9/12] rounded-xl bg-black/30 overflow-hidden">
              <div className="p-2 space-y-2">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-12 bg-white/5 rounded"></div>
                  <div className="h-12 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-accent">Coming Soon:</h3>
                <Feature text="AI-powered form analysis" />
                <Feature text="Virtual competitions & rewards" />
                <Feature text="Personal record tracking & splits" />
                <Feature text="Social feed & athlete networking" />
                <Feature text="Track Coin marketplace" />
              </div>

              <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10 backdrop-blur-sm">
                <h4 className="font-semibold text-accent text-sm">Early Access Perks:</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> 3 months Pro membership</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> 1,000 Track Coins bonus</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> Exclusive beta features</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> Founding member badge</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-2 text-center hover:bg-black/30 transition">
      <div className="text-lg font-bold">{num}</div>
      <div className="text-xs text-white/90">{label}</div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 rounded-full bg-accent grid place-items-center text-black text-xs">✓</div>
      <span className="text-xs">{text}</span>
    </div>
  )
}
