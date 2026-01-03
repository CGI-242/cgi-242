// server/src/middleware/cache.middleware.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Generates a weak ETag from response body
 */
function generateETag(body: string | Buffer): string {
  const hash = crypto.createHash('md5').update(body).digest('hex');
  return `W/"${hash}"`;
}

/**
 * ETag middleware for HTTP caching
 * Adds ETag header and handles If-None-Match for 304 responses
 *
 * Usage:
 * router.get('/articles/:id', etag(), articleController.getById);
 */
export function etag() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override res.json
    res.json = function (body: unknown): Response {
      const bodyString = JSON.stringify(body);
      const etagValue = generateETag(bodyString);

      res.setHeader('ETag', etagValue);

      // Check If-None-Match header
      const ifNoneMatch = _req.headers['if-none-match'];
      if (ifNoneMatch === etagValue) {
        return res.status(304).end();
      }

      return originalJson(body);
    };

    // Override res.send for non-JSON responses
    res.send = function (body: unknown): Response {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        const etagValue = generateETag(body);
        res.setHeader('ETag', etagValue);

        const ifNoneMatch = _req.headers['if-none-match'];
        if (ifNoneMatch === etagValue) {
          return res.status(304).end();
        }
      }

      return originalSend(body);
    };

    next();
  };
}

/**
 * Cache-Control middleware
 * Sets Cache-Control headers for HTTP caching
 *
 * Usage:
 * router.get('/articles/:id', cacheControl({ maxAge: 3600 }), handler);
 * router.get('/articles', cacheControl({ maxAge: 300, public: true }), handler);
 */
interface CacheControlOptions {
  maxAge?: number;          // Cache duration in seconds
  sMaxAge?: number;         // Shared cache duration (CDN)
  public?: boolean;         // Can be cached by shared caches
  private?: boolean;        // Only browser can cache
  noCache?: boolean;        // Must revalidate before using cache
  noStore?: boolean;        // Don't cache at all
  mustRevalidate?: boolean; // Must check server after maxAge
  staleWhileRevalidate?: number; // Serve stale while fetching new
}

export function cacheControl(options: CacheControlOptions = {}) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const directives: string[] = [];

    if (options.noStore) {
      directives.push('no-store');
    } else {
      if (options.public) {
        directives.push('public');
      } else if (options.private) {
        directives.push('private');
      }

      if (options.noCache) {
        directives.push('no-cache');
      }

      if (options.maxAge !== undefined) {
        directives.push(`max-age=${options.maxAge}`);
      }

      if (options.sMaxAge !== undefined) {
        directives.push(`s-maxage=${options.sMaxAge}`);
      }

      if (options.mustRevalidate) {
        directives.push('must-revalidate');
      }

      if (options.staleWhileRevalidate !== undefined) {
        directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
      }
    }

    if (directives.length > 0) {
      res.setHeader('Cache-Control', directives.join(', '));
    }

    next();
  };
}

/**
 * No-cache middleware for dynamic/sensitive endpoints
 * Prevents caching of sensitive data
 *
 * Usage:
 * router.get('/me', noCache(), userController.getProfile);
 */
export function noCache() {
  return cacheControl({
    noStore: true,
    noCache: true,
    mustRevalidate: true
  });
}

/**
 * Combined ETag + Cache-Control for static-like content
 *
 * Usage:
 * router.get('/articles/:id', httpCache({ maxAge: 3600 }), handler);
 */
export function httpCache(options: CacheControlOptions = { maxAge: 3600 }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Apply cache control
    cacheControl(options)(req, res, () => {
      // Apply ETag
      etag()(req, res, next);
    });
  };
}

// Preset configurations
export const CACHE_PRESETS = {
  // Articles - cacheable for 1 hour, revalidate with ETag
  ARTICLE: { maxAge: 3600, public: true, mustRevalidate: true },

  // Article list - shorter cache, stale-while-revalidate for UX
  ARTICLE_LIST: { maxAge: 300, public: true, staleWhileRevalidate: 60 },

  // Static references - long cache
  STATIC: { maxAge: 86400, public: true },

  // User-specific data - private, short cache
  USER_DATA: { maxAge: 60, private: true },

  // No cache for sensitive operations
  SENSITIVE: { noStore: true },
};

export default { etag, cacheControl, noCache, httpCache, CACHE_PRESETS };
