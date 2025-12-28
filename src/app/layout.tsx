
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { Chatbot } from '@/components/chatbot';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Civix - Empowering Citizens. Improving Governance.',
  description:
    'A smart civic engagement platform to report issues, vote on community matters, and track resolutions transparently.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Chatbot />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
