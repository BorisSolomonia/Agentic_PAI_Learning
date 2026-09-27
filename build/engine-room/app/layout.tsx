import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeOS Engine Room — a visual learning guide',
  description: 'Explore LifeOS architecture, components, source files, and information flows through an interactive engine model.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
