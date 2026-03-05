# Development Setup & Troubleshooting

## Fast Refresh / Hot Module Replacement (HMR)

### Problem: Needing to hard refresh after every change

If you're experiencing issues where changes don't appear without a hard refresh (Cmd+Shift+R), this is likely due to
caching issues.

### Solutions

#### 1. Clear Cache and Restart Dev Server

Use the clean dev command:

```bash
npm run dev:clean
```

This command:

- Removes the `.next` directory (Next.js cache)
- Removes `tsconfig.tsbuildinfo` (TypeScript cache)
- Starts a fresh dev server

#### 2. Manual Cache Clear

If you need to manually clear all caches:

```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo

# Clear node_modules cache (more extreme)
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

#### 3. Browser Cache

Sometimes the browser itself is caching aggressively:

- **Chrome/Edge**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- **Firefox**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- **Safari**: Cmd+Option+R (Mac)

Or disable cache in DevTools:

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while developing

### Configuration Changes Made

The following changes were made to improve development experience:

#### `next.config.mjs`

1. **ISR Memory Cache Disabled in Development**
   ```javascript
   experimental: {
     isrMemoryCacheSize: 0,
   }
   ```

2. **No-Cache Headers in Development**
    - Development mode now sends `Cache-Control: no-store` headers
    - Production mode uses normal caching for performance

#### `package.json`

Added `dev:clean` script for easy cache clearing.

### Best Practices

1. **Use `npm run dev` for normal development**
2. **Use `npm run dev:clean` when you notice caching issues**
3. **Keep DevTools open with cache disabled** during active development
4. **Restart dev server** if HMR stops working

### Common Issues

#### Issue: Changes to CSS modules not reflecting

**Solution**: Run `npm run dev:clean`

#### Issue: TypeScript types not updating

**Solution**:

```bash
rm -f tsconfig.tsbuildinfo
# Restart your IDE/editor
```

#### Issue: API routes not updating

**Solution**: Stop the dev server (Ctrl+C) and restart with `npm run dev`

#### Issue: Environment variables not updating

**Solution**:

1. Stop dev server
2. Update `.env` file
3. Run `npm run dev` again

### Next.js Turbopack

This project uses Next.js with Turbopack (the default in Next.js 16+). Turbopack should provide fast refresh out of the
box, but:

- First-time compilation may take a few seconds
- Subsequent changes should be near-instant
- If HMR breaks, use `dev:clean`

### When All Else Fails

If you're still experiencing issues:

1. **Complete reset**:
   ```bash
   npm run dev:clean
   # Wait for server to start
   # Hard refresh browser (Cmd+Shift+R)
   ```

2. **Nuclear option**:
   ```bash
   rm -rf node_modules
   rm -rf .next
   rm -f package-lock.json
   npm install
   npm run dev:clean
   ```

3. **Check for**:
    - Multiple dev servers running (check port 3000)
    - Proxy/VPN interfering with localhost
    - Browser extensions blocking HMR websockets
    - Antivirus software blocking file watching

### Performance Tips

- Close unused applications to free up memory
- Use `npm run dev` instead of `npm run dev:clean` for normal work
- Only run clean when you notice issues
- Keep file watchers count reasonable (avoid opening too many large files)

---

Last Updated: March 5, 2026

