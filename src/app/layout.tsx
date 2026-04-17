import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'RETC Academic Portal | วิทยาลัยเทคนิคร้อยเอ็ด',
  description: 'แหล่งรวมงานวิจัยและผลงานวิชาการ วิทยาลัยเทคนิคร้อยเอ็ด',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <Navbar user={session} />
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Sarabun', sans-serif",
              borderRadius: '8px',
              padding: '16px',
            },
          }} 
        />
      </body>
    </html>
  );
}
