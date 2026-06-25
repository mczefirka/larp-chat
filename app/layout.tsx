import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LarpChat — Turn your docs into a chatbot',
  description: 'Upload your company PDFs and instantly get a ChatGPT-style assistant you can embed on any website.',
  openGraph: {
    title: 'LarpChat — Turn your docs into a chatbot',
    description: 'Upload your company PDFs and instantly get an AI assistant you can embed anywhere.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
