# Logo Files

## Current Logo

The application currently uses a placeholder SVG logo (`cognisys-logo.svg`).

## How to Replace with Your Actual Logo

### Option 1: Download from LinkedIn (Recommended if you have access)

1. Go to your [Cognisys AI company page on LinkedIn](https://www.linkedin.com/company/cognisys-ai/)
2. Right-click on the company logo
3. Save the image as `cognisys-logo.png` or `cognisys-logo.jpg` in this folder
4. Update the file references in the code if you change the file extension

### Option 2: Use Your Own Logo File

1. Place your logo file in this folder (`public/images/`)
2. Rename it to `cognisys-logo.svg` (or keep the extension you prefer)
3. If you change the extension, update these files:
   - `src/app/login/page.tsx`
   - `src/app/signup/page.tsx`
   - `src/components/footer.tsx`

### Option 3: Use the Placeholder

The current placeholder SVG logo will work fine for development and testing. It features:
- A network/brain design representing AI
- The letter "C" for Cognisys
- Professional indigo color scheme

## Supported Formats

- **SVG** (recommended) - Scalable, small file size
- **PNG** - Good quality with transparency
- **JPG** - Smaller file size, no transparency
- **WebP** - Modern format with good compression

## Logo Specifications

Current usage in the app:
- **Login/Signup pages**: 40x40 pixels
- **Footer**: 32x32 pixels
- **Next.js Image component** automatically optimizes the image

## Why Not Use LinkedIn URLs?

LinkedIn CDN URLs don't work for external websites because:
- ❌ CORS restrictions (Cross-Origin Resource Sharing)
- ❌ Authentication required
- ❌ Time-limited URLs (expire after a date)
- ❌ Rate limiting

Always use local images for your application!

## Example: Replacing the Logo

```typescript
// If you want to use a PNG instead of SVG:
<Image
  src="/images/cognisys-logo.png"  // Change extension here
  alt="Cognisys AI Logo"
  width={40}
  height={40}
  className="rounded-md"
/>
```

