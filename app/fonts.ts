import { Inter, Source_Serif_4 } from 'next/font/google';

/**
 * Two families. That is all.
 *
 *   sourceSerif: body and headlines (varying weights).
 *                Substitutes Asterisk's "Noe Text" / "Noe Standard" pairing.
 *   inter:       small UI labels, datelines, captions, footer.
 *                Substitutes Asterisk's "Atlas Grotesk".
 */

export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-source-serif',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});
