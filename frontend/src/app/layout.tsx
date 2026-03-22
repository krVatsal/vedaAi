import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaAI — Assessment Creator',
  description: 'AI-powered assessment creator for educators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-bricolage antialiased bg-[#EEEEEE]">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#303030',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              fontFamily: "'Bricolage Grotesque', sans-serif",
            },
            success: {
              iconTheme: { primary: '#17CB9E', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#FF4040', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
