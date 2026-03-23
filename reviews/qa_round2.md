# QA Round 2 — Interaction Polish Report

**Date:** 2026-03-23  
**Status:** ✅ All fixes applied, build clean, all routes 200

---

## Summary

Round 2 focused on interaction polish, visual refinement, and demo-flow smoothness. Previous round fixed major bugs; this round addresses subtle UX issues, animation quality, responsive design, and text quality.

---

## Issues Found & Fixed

### 1. Visual Polish

| Item | Status | Fix |
|------|--------|-----|
| Buttons missing `active:scale` feedback | ✅ Fixed | Added `active:scale-95` / `active:scale-[0.99]` to all major buttons |
| Mindmap background plain beige | ✅ Fixed | Added `.mindmap-bg` CSS class with dot-grid pattern `radial-gradient(circle, #C8C4BF 1px, transparent 1px)` |
| Schedule color coding inconsistent | ✅ Fixed | Unified `bg`/`color`/`dot` per subject, legend now uses matching text colors |
| "HÔM NAY" badge not visually distinct | ✅ Fixed | Added pulsing dot (`.today-pulse` animation) + improved badge styling |
| Roadmap "Lập Plan" button not standout enough | ✅ Fixed | Made button larger (`px-12 py-5 text-xl font-black`), added CSS `btn-glow` animation |
| Dashboard stat cards no visual accent | ✅ Fixed | Added top accent stripe in matching color per card |
| "Phân tích sâu" accordion not smooth | ✅ Fixed | Used `AnimatePresence` + `height: 'auto'` animation for smooth expand/collapse |
| Selected mindmap node glow weak | ✅ Fixed | Enhanced to triple-layer glow shadow: ring + spread + blur |
| Cards missing shadow on hover | ✅ Fixed | Added `hover:shadow-md` to project cards and session items |

### 2. CreateProjectModal Improvements

| Item | Status | Fix |
|------|--------|-----|
| File upload shows generic icon | ✅ Fixed | Added `fileTypeIcon()` helper: `📊` xlsx, `🖼️` images, `🎬` videos, `📄` generic |
| Step indicator was already present | ✅ OK | Already has numbered step circles with check marks |
| AI avatar already present | ✅ OK | AI messages already had `bg-[#6B2D3E]` avatar with "AI" label |

### 3. Mobile / Responsive

| Item | Status | Fix |
|------|--------|-----|
| TopNavBar no mobile menu | ✅ Fixed | Added hamburger button + `AnimatePresence` drawer on mobile |
| Nav links visible on 768px | ✅ Fixed | `hidden md:flex` on nav, hamburger appears at `md:hidden` |
| Layout pt offset for smaller navbar | ✅ Fixed | `pt-[62px] md:pt-[72px]` responsive top padding |
| Schedule grid text truncation on mobile | ✅ Fixed | Responsive text sizing `text-[10px] md:text-xs`, tighter grid columns |
| Dashboard padding on small screens | ✅ Fixed | `px-4 md:px-6` responsive padding |

### 4. Performance / Memory

| Item | Status | Fix |
|------|--------|-----|
| AIStreamText `onComplete` in dep array | ✅ Fixed | Moved to `onCompleteRef` to prevent stale closures and re-render loops |
| `setInterval` memory leak in VideoViewer | ✅ Already OK | `useEffect` with `return () => clearInterval(interval)` already in place |
| Unused `useCallback` import | ✅ Fixed | Wrapped `renderText` in `useCallback` in AIStreamText |

### 5. Text Quality (Vietnamese)

| Check | Status |
|-------|--------|
| Diacritical marks | ✅ All correct throughout codebase |
| Natural phrasing | ✅ Consistent formal-but-friendly tone |
| No lorem ipsum | ✅ All content uses realistic Vietnamese learning data |
| Dashboard analysis text "2024" | ✅ Updated to "2025" |
| "cá nhân hoá" (typo) | ✅ Fixed to "cá nhân hóa" in dashboard |

### 6. Demo Flow Verification

Walk-through of complete demo flow:

- `/landing` → CTA "Bắt đầu miễn phí" → `/` ✅
- `/` → "+ Dự án mới" → `CreateProjectModal` (3-step) ✅
  - Step indicator with check marks ✅
  - File upload with type icons ✅
  - AI chat with avatar ✅
  - Step transitions animated ✅
- `/roadmap` → graph renders, drag works, context menu works ✅
  - "Lập Plan" button: large, glowing, animated ✅
  - After plan: smooth transition to "Xem lịch học" button ✅
- `/schedule` → timetable with today highlight + pulse dot ✅
- `/learn` → mindmap with dot-grid background ✅
  - Zoom indicator at bottom-left ✅
  - Node click → DocumentSidebar slides in ✅
  - Content nodes stagger animation ✅
  - NodeTextViewer → AI hỏi đáp → suggested questions → streaming response ✅
  - Ôn tập → Quiz, Flashcard, Tự luận, Dạy AI — all tabs work ✅
  - NodeVideoViewer → fake player with progress ✅
  - ChatBox bottom-right → expand → messages visible ✅
- `/dashboard/1` → CircularProgress animates ✅
  - Stat cards with accent stripes ✅
  - "Phân tích sâu" smooth accordion ✅

---

## CSS Additions (globals.css)

- `.mindmap-bg` — dot-grid pattern for mindmap canvas
- `.today-pulse` — keyframe animation for "HÔM NAY" dot
- `.btn-glow` — CSS keyframe glow pulse for "Lập Plan"
- `@media (max-width: 768px)` — `.hide-mobile` utility

---

## Build Status

```
✓ Compiled successfully
✓ TypeScript: 0 errors
✓ 10/10 pages generated
✓ All routes: 200 OK
```

Routes tested:
- `/`: 200
- `/learn`: 200
- `/roadmap`: 200
- `/dashboard/1`: 200
- `/schedule`: 200
- `/workspace`: 200
- `/landing`: 200
