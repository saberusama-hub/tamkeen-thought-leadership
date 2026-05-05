import type { Metadata } from 'next';
import { sourceSerif, inter } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tamkeen-thought-leadership.vercel.app'),
  title: {
    default: 'Tamkeen Thought Leadership',
    template: '%s · Tamkeen Thought Leadership',
  },
  description:
    'Tamkeen Thought Leadership. Independent analysis on policy, capability, and strategy.',
  openGraph: {
    type: 'website',
    siteName: 'Tamkeen Thought Leadership',
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
