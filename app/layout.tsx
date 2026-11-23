import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rusty\'s Food Guide',
  description: 'A cute red panda that recommends food places and opens them on Google Maps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
