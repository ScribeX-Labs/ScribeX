import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Noto_Sans } from 'next/font/google';
import { UserUploadDataProvider } from '@/context/UserUploadDataContext';

const noto_sans = Noto_Sans({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Scribe',
  description:
    'Scribe is a website that helps users accurately transcribe audio or video files and use up-to-date AI features to help users better understand the transcript.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${noto_sans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserUploadDataProvider>{children}</UserUploadDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
