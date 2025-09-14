// C:\Users\vgsav\Downloads\Waitpage\app\layout.tsx
import './globals.css'

export const metadata = {
  title: 'TrackVerse – Waitlist',
  description: 'Track & Field goes social. Join the waitlist.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
