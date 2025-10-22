import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title = "Just-Jeje | Video Editor & Videographer Portfolio",
  description = "Professional video editor and videographer based in Surakarta. Specializing in short films, wedding videos, and cinematic content. 8+ years of experience with 30+ projects completed.",
  image = "https://raw.githubusercontent.com/beruangs/justjeje-imagehost/refs/heads/master/home/profile.PNG",
  type = "website",
  structuredData = null
}) => {
  const location = useLocation();
  const url = `https://justjeje.vercel.app${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', 'video editor, videographer, short film, wedding video, cinematic, surakarta, film maker, just-jeje, editor indonesia');
    updateMetaTag('author', 'Just-Jeje');

    // Open Graph meta tags (for Facebook, LinkedIn, etc.)
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Just-Jeje Portfolio', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional SEO meta tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'Indonesian');
    updateMetaTag('revisit-after', '7 days');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // JSON-LD Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, image, url, type, structuredData]);

  // Default structured data for homepage
  useEffect(() => {
    if (location.pathname === '/' && !structuredData) {
      const defaultStructuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Just-Jeje",
        "alternateName": "Jeje",
        "url": "https://justjeje.vercel.app",
        "image": "https://raw.githubusercontent.com/beruangs/justjeje-imagehost/refs/heads/master/home/profile.PNG",
        "jobTitle": "Video Editor & Videographer",
        "worksFor": {
          "@type": "Organization",
          "name": "Freelance"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Surakarta",
          "addressCountry": "ID"
        },
        "sameAs": [
          "https://instagram.com/justjejee._",
          "https://youtube.com/c/JustJejeTV",
          "https://www.tiktok.com/@justjejee._"
        ],
        "knowsAbout": [
          "Video Editing",
          "Videography",
          "Short Film Production",
          "Wedding Videography",
          "Color Grading",
          "Director of Photography"
        ]
      };

      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(defaultStructuredData);
    }
  }, [location.pathname, structuredData]);

  return null;
};

export default SEO;
