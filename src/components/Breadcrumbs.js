import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = ({ theme }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Define route labels for better SEO
  const routeLabels = {
    '': 'AI Text Humanizer',
    'dashboard': 'Dashboard',
    'notepad': 'AI Writing Editor',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'pricing': 'Pricing Plans',
    'about': 'About Us',
    'contact': 'Contact Support'
  };

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: '12px 0',
        fontSize: '14px',
        color: theme?.muted || '#606060'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Home Link with Schema */}
        <Link
          to="/"
          style={{
            color: theme?.primary || '#635bff',
            textDecoration: 'none',
            fontWeight: '500'
          }}
          itemProp="item"
          itemScope
          itemType="https://schema.org/WebPage"
        >
          <span itemProp="name">Home</span>
        </Link>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <React.Fragment key={to}>
              <span style={{ color: theme?.muted || '#606060' }}>›</span>
              {isLast ? (
                <span
                  style={{
                    color: theme?.text || '#000000',
                    fontWeight: '600'
                  }}
                  itemProp="item"
                  itemScope
                  itemType="https://schema.org/WebPage"
                  aria-current="page"
                >
                  <span itemProp="name">{label}</span>
                </span>
              ) : (
                <Link
                  to={to}
                  style={{
                    color: theme?.primary || '#635bff',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  itemProp="item"
                  itemScope
                  itemType="https://schema.org/WebPage"
                >
                  <span itemProp="name">{label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Structured Data for Breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Text Humanizer",
              "item": "https://www.notecraft.pro/"
            },
            ...pathnames.map((value, index) => ({
              "@type": "ListItem",
              "position": index + 2,
              "name": routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1),
              "item": `https://www.notecraft.pro/${pathnames.slice(0, index + 1).join('/')}`
            }))
          ]
        })}
      </script>
    </nav>
  );
};

export default Breadcrumbs;