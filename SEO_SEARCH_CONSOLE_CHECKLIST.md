# Omilearn Google Search Console Checklist

## 1. Add property
- Go to https://search.google.com/search-console
- Add Domain property: `omilearn.com` if you can edit DNS.
- If DNS is not convenient, add URL-prefix property: `https://omilearn.com/`.

## 2. Verify ownership
Recommended: DNS TXT record at domain provider.
Alternative: HTML meta tag in `app/app/layout.tsx` metadata verification after Google gives the token.

## 3. Submit sitemap
Submit this sitemap URL:

```text
https://omilearn.com/sitemap.xml
```

## 4. Request indexing manually
Use URL Inspection → Request indexing for:

```text
https://omilearn.com/
https://omilearn.com/landing
https://omilearn.com/features
https://omilearn.com/tools
https://omilearn.com/blog
https://omilearn.com/blog/tao-lo-trinh-hoc-bang-ai
https://omilearn.com/tools/ai-quiz-generator
https://omilearn.com/tools/flashcard-generator
https://omilearn.com/tools/study-plan-generator
```

## 5. Check index status
After a few hours/day, search:

```text
site:omilearn.com
Omilearn
Omilearn AI học tập
Omilearn lộ trình học AI
```

## 6. Monitor weekly
Check Search Console → Performance:
- Queries with impressions but low CTR → rewrite title/description.
- Pages discovered but not indexed → inspect reason.
- Core Web Vitals → optimize LCP/INP/CLS if warnings appear.

## 7. Fast discovery backlinks
Add `https://omilearn.com` to:
- GitHub profile README.
- Project repository README.
- LinkedIn profile/post.
- Product/startup directory listings.
- Dev.to/Medium article linking to Omilearn blog pages.
