import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { UserContextProvider } from '@/contexts/user-context';
import { Toaster } from '@/components/ui/sonner';
import HeaderWrapper from '@/components/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TravelLite',
  description: 'Make your upcoming travels sustainable!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserContextProvider>
          <HeaderWrapper>{children}</HeaderWrapper>
        </UserContextProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
