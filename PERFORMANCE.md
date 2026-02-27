# Performance Optimization Guide for Bueboka

## Overview

This document outlines the performance optimizations implemented to reduce latency for Norwegian users accessing the app
deployed in US-based infrastructure.

## Architecture

- **Frontend**: Deployed on Netlify (US East)
- **Database**: Prisma.io (US-based)
- **Users**: Primarily in Norway

## Implemented Optimizations

### 1. Prisma Accelerate

- **What**: Edge caching and connection pooling for Prisma queries
- **Benefit**: Reduces database round-trip time by caching at the edge
- **Configuration**: Already enabled via `@prisma/extension-accelerate`
- **Usage**: Add `cacheStrategy: { ttl: 60, swr: 120 }` to queries

### 2. Application-Level Caching

- **File**: `lib/cache.ts`
- **What**: In-memory caching for frequently accessed data
- **Caches**:
    - `roundTypesCache`: 5 minutes (round types rarely change)
    - `userProfileCache`: 2 minutes
    - `statsCache`: 3 minutes
- **Benefit**: Eliminates redundant database queries within the cache window

### 3. HTTP Caching Headers

- **Where**: `next.config.mjs` and `netlify.toml`
- **Strategy**:
    - Static assets: 1 year cache (immutable)
    - API responses: 60-180 seconds with stale-while-revalidate
    - Images: Aggressive caching with modern formats (AVIF, WebP)
- **Benefit**: Reduces server load and improves repeat visits

### 4. Netlify Edge Optimization

- **Build Optimization**: Faster builds with esbuild bundler
- **Function Timeout**: Extended to 10 seconds for database operations
- **Asset Caching**: Comprehensive cache rules for all asset types

### 5. Next.js Optimizations

- **Compression**: Enabled gzip/brotli compression
- **Image Optimization**: AVIF/WebP formats with 30-day cache
- **Code Splitting**: Automatic via Next.js
- **Minification**: SWC-based minification enabled

## Cache Strategy by Endpoint

| Endpoint               | Memory Cache | Prisma Cache | HTTP Cache |
|------------------------|--------------|--------------|------------|
| `/api/round-types`     | 5 min        | 5 min        | 5 min      |
| `/api/practices/cards` | None         | 60 sec       | 60 sec     |
| `/api/stats`           | 3 min        | 3 min        | 3 min      |
| `/api/stats/detailed`  | 3 min        | 3 min        | 3 min      |
| Static assets          | N/A          | N/A          | 1 year     |

## Performance Metrics to Monitor

1. **Time to First Byte (TTFB)**: Should be < 500ms
2. **API Response Times**: Should be < 300ms (cached), < 1s (uncached)
3. **Page Load Time**: Should be < 2s on 3G
4. **Cache Hit Rate**: Monitor in Netlify analytics

## Additional Optimization Opportunities

### Immediate Actions (No Code Changes)

1. **Enable Prisma Accelerate Premium**: Get closer to European edge locations
2. **Consider Netlify Enterprise**: Better edge network and regional function execution
3. **Add CDN**: CloudFlare in front of Netlify for European PoPs

### Future Improvements

1. **Database Migration**: Move to a European database region (Oslo, Stockholm, Frankfurt)
2. **Split Architecture**:
    - Keep static site on Netlify CDN (global)
    - Move API/functions to Vercel Edge Functions or similar with EU regions
3. **Implement Service Workers**: For offline-first experience
4. **GraphQL**: Replace REST with GraphQL + DataLoader for better query batching
5. **React Server Components**: Reduce client-side JavaScript bundle

### Database Optimization

1. **Connection Pooling**: Already enabled via Prisma Accelerate
2. **Query Optimization**: Use `select` to fetch only needed fields (already implemented)
3. **Indexes**: Ensure proper indexes on frequently queried fields
4. **Read Replicas**: If using premium Prisma plan, enable read replicas

### Frontend Optimization

1. **Code Splitting**: Lazy load non-critical components
2. **Reduce Bundle Size**:
    - Use dynamic imports for heavy dependencies
    - Tree-shake unused code
3. **Preloading**: Add `<link rel="preload">` for critical assets
4. **Font Optimization**: Use `font-display: swap` (already via Next.js)

## Environment Variables Required

For Prisma Accelerate to work optimally, ensure these are set:

```bash
# Your regular database connection
DATABASE_URL="postgresql://..."

# Prisma Accelerate connection (if using premium)
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

## Testing Performance

### Local Testing

```bash
# Run lighthouse
npm run build
npm start
# Then run Lighthouse in Chrome DevTools

# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-site.netlify.app/api/stats
```

### Production Monitoring

- Use Netlify Analytics for real-user metrics
- Set up Sentry Performance Monitoring
- Monitor Prisma Accelerate dashboard for cache hit rates

## Expected Improvements

With these optimizations:

- **First Load**: 30-40% faster (cached assets, optimized images)
- **Repeat Visits**: 60-70% faster (aggressive caching)
- **API Calls**: 50-80% faster (when cache is warm)
- **Database Load**: Reduced by 60-80% (caching layers)

## Rollback Plan

If issues occur:

1. Remove `cacheStrategy` from Prisma queries
2. Set all cache TTLs to 0
3. Revert `netlify.toml` and `next.config.mjs` changes

## Notes

- Caching introduces eventual consistency (users might see stale data for cache TTL)
- Invalidate caches when critical data changes (practices, user profile)
- Monitor error rates after deployment
- Consider user feedback on "stale" data

## Support

For issues or questions:

- Check Netlify build logs
- Review Prisma Accelerate dashboard
- Check Sentry for errors

