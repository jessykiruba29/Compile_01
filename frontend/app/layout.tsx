import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Compile_01',
  description: 'Deterministic AI App Compiler',
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