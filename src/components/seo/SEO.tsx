import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const BASE_URL = 'https://tavara.care';

/**
 * Per-route SEO head. Injects unique title, description, canonical, OG/Twitter,
 * and optional JSON-LD schema. Overrides the sitewide fallbacks in index.html
 * for JS-executing crawlers (Googlebot).
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogImage = '/og-image.png',
  ogType = 'website',
  schema,
  noindex = false,
}) => {
  const url = `${BASE_URL}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Tavara" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
