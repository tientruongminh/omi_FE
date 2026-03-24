# Steve Review — OmiLearn R1

**Score: 6.5/10**
**Demo Ready: NO — but close. Fix 5-7 things and you can ship a demo.**

## Executive Summary

The engineering team has built a surprisingly comprehensive prototype — the mindmap learning page, review system, and project creation flow are genuinely impressive for a first pass. But the product has structural bugs (double navigation on landing), significant spec gaps (no entry from Dashboard calendar to Learn page, no "connect calendar" in survey), and the design deviates from Figma in ways that will be immediately noticed in a demo video. The foundation is solid. The polish is not there yet.

## Design Fidelity (vs Figma exports)

### What matches well:
- **Color palette**: The #6B2D3E burgundy, #2D2D2D charcoal, #F5F0EB warm beige, #4CD964 green — all faithfully reproduced
- **Border-heavy sketch aesthetic**: 2px dark borders with rounded corners on cards — nailed it
- **Footer**: Almost pixel-perfect match to the Figma export — dashed separator, "omilearn" logo in burgundy, "© 2024 Editorial Learning", right-side links
- **TopNavBar (app version)**: Search bar, moon icon, user avatar — layout matches the Header_-_TopAppBar_preview
- **Card design**: Project cards with dashed separator, progress bars, "hoàn thành" label — very close to Main_preview
- **FloatingNote**: Matches the design — warm cream background, tip text, dismiss button
- **Schedule page**: Near-perfect match to Main_extra_preview — the grid layout, color-coded pills, legend bar, PREV/NEXT buttons, "HÔM NAY" highlight

### What doesn't match (critical deviations):

1. **TopNavBar logo font**: Design uses italic serif (Georgia/editorial), implementation uses `text-2xl font-medium tracking-tight lowercase` — but NOT italic. The design mockup shows the logo as italic serif everywhere. **Missing `font-style: italic` and `font-family: Georgia, serif`** on the app nav logo.

2. **TopNavBar layout**: Design (Header_-_Top_Navigation_preview) shows: logo left, search bar center-left, sun icon + toggle right. Implementation shows: logo left, nav links center, search bar + moon + user right. The app nav has **visible nav links (Dashboard, Mindmap, etc.)** which the Figma TopNavBar does NOT show — this is a design decision mismatch.

3. **Landing page Header**: Design (Header_-_Top_Navigation_preview) shows: "Features" (underlined), "How it Works", "Pricing" centered. "Sign In" bold + outline pill button right. Implementation matches concept but the active underline on "Features" is only 2px — design shows thicker.

4. **Main_preview (Home/Projects page)**: The dark hero card in the design has a partially visible green accent shape overlapping it. The implementation uses emoji 📚 and a white/10 box instead of whatever the actual design intended. The hero area looks generic compared to the Figma.

5. **Main2_preview (Workspace/File Manager)**: Design shows file type icons as **colored squares** (green for spreadsheet, pink for image) — implementation uses emoji icons (📊, 🖼️). Design shows the AI chat on a **warm cream/yellow background (#FFF8EC-ish)** — implementation uses #F1F1EC which is more gray. The AI avatar in design is a specific robot icon in mauve — implementation uses a generic 🤖 emoji.

6. **MindmapContainer@2x**: Design shows **dark background** for the mindmap canvas. Implementation uses light background (#F5F0EB). This is a MAJOR deviation — the Figma mindmap has purple/blue connecting lines on a **dark canvas**, giving it a professional, immersive feel. The implementation looks flat and washed out.

7. **MindmapContainer@2x**: Design shows content nodes with **"AI hỏi đáp" and "Ôn tập" tag badges** directly on the Video/PDF cards. Implementation generates content nodes as simple colored rectangles with emoji + label. **Missing the tag badge system** on content nodes.

8. **Footer separator**: Design shows a **dashed dotted line**. Implementation correctly uses `border-t-2 border-dashed` — matches. But footer has `|` pipe separators between links which the design does NOT show — design uses plain spacing.

## Spec Compliance (vs spreadsheet requirements)

### Landing Page: ⚠️ (Partially Complete)
- ✅ Shows product introduction (hero, features, CTA)
- ✅ "Bắt đầu miễn phí" and "Xem demo" buttons link to home
- ❌ **DOUBLE NAVIGATION BUG**: Landing page renders BOTH the app TopNavBar (with Dashboard, Mindmap links) AND its own public nav (Features, How it Works, Pricing). This is a critical layout bug — the landing page needs its own layout.tsx or the root layout needs to exclude it.
- ⚠️ Hero illustration is emoji-only (📚🧠✨) — looks cheap for a demo video. Need actual graphics or at least a styled mockup.

### Trang Dự Án (Home Page): ✅ (Mostly Complete)
- ✅ Shows existing projects with progress
- ✅ "Dự án mới" button opens CreateProjectModal
- ✅ Modal Step 1: name + description + upload files
- ✅ Modal Step 2: AI chat for document search with streaming
- ✅ Modal Step 3: Confirm → asks "đã đủ chưa?" and creates project
- ✅ After creation, redirects to Roadmap
- ⚠️ "Courses shared with me" section exists but shared courses link to /learn (generic) instead of project-specific routes

### Roadmap: ✅ (Well Implemented)
- ✅ Graph with draggable nodes
- ✅ Right-click context menu: edit name, delete node
- ✅ "+" buttons between edges to add nodes
- ✅ "Lập Plan" button with pulse animation (spec: "nút lớn nổi bật có animation" ✅)
- ✅ Popup survey: 4 questions (time, level, style, goals)
- ✅ Gen plan as streaming text
- ✅ Modify plan via prompt input
- ✅ After plan OK → button changes to "Xem lịch học" → navigates to Schedule
- ❌ **Missing "connect calendar"** option in survey (spec requires it)
- ⚠️ Roadmap is "dạng đồ thị" (graph) — implemented, but vertical layout doesn't feel as polished as a proper DAG visualization

### Trang Học Tập (Learn Page): ⚠️ (Core is There, But Key Features Missing)
- ✅ Mindmap canvas with root node and 7 child nodes
- ✅ Click node → sidebar opens with document list + checkboxes
- ✅ Apply → generates content nodes on the mindmap
- ✅ Click content node → opens document viewer
- ✅ **Two node types: Text (NodeTextViewer) + Video (NodeVideoViewer)** — both implemented
- ✅ Text viewer: full text display → "AI hỏi đáp" button → split screen with chat
- ✅ Video viewer: fake video player with play/pause, progress, speed selector, transcript
- ✅ "Ôn tập" button → NodeReview with Quiz, Flashcard, Essay, Teach AI — ALL 4 modes working
- ✅ ChatBox (bottom-right): group chat with avatars, "Mời bạn bè" button
- ✅ Right-click canvas: context menu shows "Thêm Unit" with nearby units list
- ✅ FloatingNote: appears after 3 seconds with tip

**Missing from spec:**
- ❌ **2 cách vào**: Can enter from Roadmap node (✅), but NO entry from Dashboard calendar (❌). Dashboard calendar just shows sessions with no click-through to learn page.
- ❌ **Node tóm tắt**: Spec says each main node should have a summary. The sidebar shows documents but no summary text per node (only `node.subtitle` which is brief).
- ❌ **Node tổng hợp**: Spec says "merge nhiều node từ nhiều workflow" — completely unimplemented.
- ❌ **ChatBox permissions**: Spec says "set quyền, chat nhóm" — the "Mời bạn bè" button does nothing, no permission management.
- ❌ **Right-click on nodes**: Spec says "right-click → add unit, scroll units gần nhất" — right-click on canvas works but right-click on individual nodes triggers browser context menu (only canvas right-click works).
- ⚠️ **MindmapCanvas dark theme**: Design shows dark background. Implementation is light. Major visual difference.

### Dashboard: ⚠️ (Good Structure, Missing Interactivity)
- ✅ Per-project view with breadcrumb navigation
- ✅ Circular progress bar (units đạt/tổng) — beautiful animation
- ✅ Stats cards: Phân tích, Tổng hợp, Phản biện, Phỏng vấn — with progress bars
- ✅ Calendar section: mini week view with study sessions
- ✅ "Phân tích sâu" button → AI streaming analysis text
- ❌ **Calendar NOT clickable**: Spec says you can enter "Trang Học Tập" from calendar. Calendar items have no click handler — they're display-only.
- ❌ **Index page**: `/dashboard` shows a bare list of projects. No overview stats, no aggregate data. Feels unfinished.
- ⚠️ Analysis text is hardcoded. For demo, this is acceptable if you don't interact with it.

## Missing Features (critical for demo)

1. **Landing page double nav** — Renders both app nav AND landing nav. Immediately visible, immediately embarrassing.
2. **Dashboard → Learn navigation** — No way to click a calendar item and go to the learn page. This is a core user flow from the spec.
3. **Mindmap dark canvas** — Design shows dark background with purple connections. Implementation is bright/flat. The mindmap is the HERO feature — it needs to look stunning.
4. **Content node tag badges** ("AI hỏi đáp", "Ôn tập") — Missing from content nodes on the mindmap. Design shows them prominently.
5. **Connect Calendar** in plan survey — Spec requires it; not implemented.
6. **Node tổng hợp** — Spec says "merge nhiều node từ nhiều workflow." Completely absent.
7. **Landing page illustration** — Emoji stack (📚🧠✨) looks amateur. Need something visual.

## UI/UX Issues

1. **Logo font inconsistency**: Landing page correctly uses `Georgia, serif, italic` for "omilearn." TopNavBar uses `text-2xl font-medium` without italic or serif. They should match.
2. **Footer pipe separators**: Design doesn't show `|` between Privacy/Terms/Help Center. Remove them — use spacing only.
3. **Home page hero**: The dark card with emoji book is generic. The Figma shows a more interesting composition with overlapping shapes.
4. **Workspace page AI chat background**: Should be warm cream/yellow per Figma, not gray #F1F1EC.
5. **CreateProjectModal**: Step 2 AI chat area uses `bg-white` but the design shows cream/yellow for AI panels.
6. **Schedule page**: The "Tuần hiện tại" text appears inside the dark header. The design shows PREV/NEXT buttons more prominently. Minor.
7. **NodeVideoViewer**: The fake video player shows monospace terminal text — this works for the OS/Linux project but is very placeholder-looking. For a demo, consider showing a thumbnail image.
8. **Zoom indicator on MindmapCanvas**: Shows percentage bottom-left. Not in the design. Minor but adds visual noise.
9. **No loading states**: Pages load instantly (static data), but there are no skeleton screens. For a demo this is fine, but if any network latency is shown, empty states will flash.
10. **Mobile responsiveness**: TopNavBar hides nav links on mobile (`hidden md:flex`), but the mindmap canvas has a fixed 900x660 canvas size that won't scale. Schedule grid is also fixed. Mobile demo would be rough.

## What Works Well

1. **CreateProjectModal is genuinely impressive** — 3-step wizard with AI chat search, file upload, streaming responses, document selection with checkboxes. This is demo-ready as-is.
2. **NodeReview system is complete** — Quiz (with progress, explanations, score), Flashcard (flip animation, remember/forget tracking), Essay (with AI feedback), Teach AI (reverse explanation). All four modes work and feel polished.
3. **AIStreamText component** — Realistic typing with variable speed at punctuation, cursor animation. Professional touch.
4. **Roadmap → Plan flow** — Survey → generate plan → modify by prompt → confirm → redirect to schedule. The full loop works. Animation on the "Lập Plan" button is eye-catching.
5. **Group ChatBox** — Floating chat in bottom-right with avatar bubbles, invitation button, badge count. Feels real.
6. **Document Sidebar** — Smooth slide-in animation, checkbox selection, "Apply" button state management (shows count, changes color). Well thought out.
7. **Schedule page** — Near-perfect Figma fidelity. The grid layout with color-coded pills and legend is clean and readable.
8. **Color palette consistency** — The warm beige (#F5F0EB), burgundy (#6B2D3E), charcoal (#2D2D2D) palette is maintained across all pages. Feels cohesive.
9. **Framer Motion animations** — Card entrances, modal transitions, tab switches all feel smooth and intentional.
10. **Vietnamese localization** — All UI text is in Vietnamese. Mock data is Vietnamese. Project names, dates, chat messages — everything. This shows care.

## Priority Fix List (ordered)

1. **🔴 Fix landing page double navigation** — Either create a separate `app/landing/layout.tsx` that doesn't include TopNavBar/Footer, or conditionally hide them in the root layout when pathname is `/landing`. This is a 5-minute fix. Do it first.

2. **🔴 Make Dashboard calendar items clickable** — Add `onClick` handlers to study sessions that navigate to `/learn?topic={session.title}`. Spec requires Dashboard → Learn as a primary entry point.

3. **🟠 Darken the mindmap canvas** — Change MindmapCanvas background from `bg-[#F5F0EB]` to `bg-[#1A1A2E]` or similar dark color. Update node colors to match design (light green nodes on dark canvas). Adjust edge colors. This is the hero screen — it must match the Figma.

4. **🟠 Add tag badges to content nodes** — When content nodes appear on the mindmap, show "AI hỏi đáp" and "Ôn tập" pill badges. This is visible in the MindmapContainer@2x design and makes the feature look complete.

5. **🟠 Fix TopNavBar logo** — Add `style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}` to the logo span. Match the landing page's logo styling.

6. **🟡 Add "Connect Calendar" option** to PlanSurveyModal — Add a step or option in Q4 (or add Q5) asking about calendar connection. Can be a checkbox with Google Calendar icon.

7. **🟡 Remove footer pipe separators** — Change `<span className="text-[#CCCCCC]">|</span>` between links to just `gap-6` spacing. Match the design.

8. **🟡 Improve landing page illustration** — Replace emoji stack with a styled component, illustration, or at minimum a more interesting visual composition. The current version looks like a placeholder.

9. **🟡 Dashboard index page** — The `/dashboard` page is just a list. Add a summary card or redirect to the first project. For demo, could just redirect to `/dashboard/os-linux`.

10. **🟢 Workspace AI chat background** — Change the right panel background from `bg-[#F1F1EC]` to a warmer cream tone like `bg-[#FFF8EC]` to match the Figma.

11. **🟢 Right-click on nodes** — Add `onContextMenu` handler to individual mindmap child nodes for "add unit" functionality.

12. **🟢 MindmapCanvas content node video/PDF cards** — Make them more visually rich (thumbnail preview, colored header bar) to match the Figma design's Video/PDF cards.

## Verdict

Would Steve ship this? **Not yet, but he wouldn't throw it away either.**

Here's the truth: the engineering work is impressive. The CreateProjectModal flow, the NodeReview system (all 4 modes!), the PlanSurveyModal with streaming — these are genuinely well-built features. The team clearly understands the product vision.

But the product has a critical bug (double nav on landing) and several visible gaps between the Figma designs and the implementation. The mindmap — which is literally the hero feature of this entire product — uses a light background when the design clearly shows a dark, dramatic canvas. That's like painting the Mona Lisa and getting the background wrong.

**For the demo video specifically:**

If you fix items #1-5 from the priority list (2-3 hours of work), you have a demo-ready product. The flow would be:

1. Landing page (without double nav) → 
2. Home page (show projects) → 
3. Create new project (impressive modal flow) → 
4. Roadmap (drag nodes, create plan) → 
5. Schedule (beautiful grid) →
6. Learn page (dark mindmap, select docs, open text/video, do quiz) →
7. Dashboard (progress, analysis)

That's a compelling 3-5 minute demo. The bones are here. Fix the skin.

**Rating breakdown:**
- Engineering quality: 8/10
- Design fidelity: 5/10
- Spec compliance: 6/10
- Demo readiness: 6/10
- Overall UX feel: 7/10

**Final score: 6.5/10** — Good foundation, needs targeted fixes before camera rolls.
