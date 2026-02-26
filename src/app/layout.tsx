import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://teachtracker.com'),
  title: {
    default: 'teachtracker.com - Intelligent IEP Management for Modern School Districts',
    template: '%s | teachtracker.com',
  },
  description: 'Deliver compliant, collaborative, and data-driven student plans at scale. Empower educators and parents with clarity and confidence using intelligent IEP management software.',
  keywords: [
    'Intelligent IEP Software',
    'Special Education Compliance',
    'IEP Management',
    'School District IEP',
    'IEP Software',
    'Special Education Software',
    'IEP Tracking',
    'Individualized Education Program',
  ],
  authors: [{ name: 'teachtracker.com' }],
  creator: 'teachtracker.com',
  publisher: 'teachtracker.com',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://teachtracker.com',
    siteName: 'teachtracker.com',
    title: 'teachtracker.com - Intelligent IEP Management for Modern School Districts',
    description: 'Deliver compliant, collaborative, and data-driven student plans at scale. Empower educators and parents with clarity and confidence.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'teachtracker.com - Intelligent IEP Management Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'teachtracker.com - Intelligent IEP Management',
    description: 'Deliver compliant, collaborative, and data-driven student plans at scale.',
    images: ['/og-image.png'],
    creator: '@teachtracker',
  },
  alternates: {
    canonical: 'https://teachtracker.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'teachtracker.com',
    applicationCategory: 'EducationSoftware',
    operatingSystem: 'Web',
    description: 'Intelligent IEP Management software for modern school districts',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'teachtracker.com',
      url: 'https://teachtracker.com',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
