'use client';

import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Parses provided string as proper HTML in a safe way.
 * @param {any} params Provided params (need html key)
 */
export function SafeHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'code', 'br', 'ul', 'ol', 'li', 'p', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'className'],
  });
  return <>{parse(clean)}</>;
}
