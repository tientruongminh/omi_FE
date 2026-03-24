# Steve Jobs Reviews the OmiLearn Landing Page

---

## Gut Reaction

I opened this page and my first feeling was: **this was designed by someone who's read every SaaS landing page playbook ever written.** Every trick is here. The FOMO headline. The before/after comparison. The social proof badge. The pulsing CTA. The fake count-up animation. The stats bar. The three-step "how it works." The testimonials with five gold stars.

And that's the problem.

It feels like a **template**. Like someone took a conversion-rate-optimization checklist and executed every item on it competently. The craft is decent. The taste is absent.

When I loaded this page, I didn't feel *anything*. I felt like I'd seen it before. Because I have. A hundred times.

The biggest sin in design isn't making something ugly. It's making something **forgettable**.

---

## The 3-Second Test

The first thing my eye hits: **"Bạn bè bạn đang dùng AI để học. Còn bạn?"**

Okay. Let me sit with this.

The headline is playing the FOMO card *immediately*. Before I even know what this product IS, you're telling me I'm behind. Before you've given me a reason to care, you're trying to make me feel inadequate.

Here's what Steve Jobs would never do: **lead with fear.**

The iPod wasn't "Everyone else has portable music. Why don't you?" It was "1,000 songs in your pocket." The iPhone wasn't "Your friends have smartphones and you're still using a flip phone." It was "This is a widescreen iPod, a revolutionary mobile phone, and a breakthrough internet communicator."

You lead with **vision**. You lead with **what's now possible**. Fear is a short-term motivator. Vision is what makes people fall in love.

This headline makes me feel defensive, not excited. It's clever copywriting, but it's not great communication.

---

## The Story

Let me walk through the page as a story:

**Chapter 1 (Hero):** "You're behind. Everyone else uses AI to study. What about you?" — Anxiety.

**Chapter 2 (Comparison):** "You're in the loser column. Want to be in the winner column?" — More anxiety, plus shame.

**Chapter 3 (Features):** "Here are the secret weapons of 4.0 students" — You're not one of them yet.

**Chapter 4 (Steps):** "It's so easy even you can do it" — Condescension wrapped in simplicity.

**Chapter 5 (Stats):** "47,293 students, 12 universities, +0.7 GPA" — Social proof.

**Chapter 6 (Testimonials):** "These specific people got these specific results" — Proof.

**Chapter 7 (FAQ):** "We know you're making excuses. Let us dismantle them." — Objection handling.

**Chapter 8 (Final CTA):** "The AI era has begun. Start today or fall behind." — Fear again.

You see the pattern? **The emotional arc is: fear → shame → hope → fear.** It starts negative, briefly goes positive in the middle, then returns to fear at the close.

That's not a story. That's a guilt trip.

A great landing page tells a story that goes: **curiosity → understanding → desire → action.** The user should feel progressively MORE excited, not progressively more anxious.

---

## The Craft

### Typography
The hierarchy is *acceptable*. `font-black` everywhere creates a kind of monotonous boldness. When everything screams, nothing whispers. There's no contrast in typographic weight. The headlines are black, the body is regular, but there's no playful tension between them. It's functional, not beautiful.

The 52px headline on desktop is appropriately large, but the line-height of 1.15 with the line breaks feels a bit cramped. The text doesn't breathe. It's readable, but it doesn't *sing*.

### White Space
Decent but not generous. The sections have `pb-24` between them, which is fine. But within sections, things feel slightly compressed. The hero gap between headline and subtitle (mb-5) is tight. Great design lets things float. This design packs things in.

### Color
`#F5F0EB` as a background — warm, neutral, inoffensive. `#E8887A` as the accent — a nice coral. `#3DBE7A` for the positive/green elements. `#2D2D2D` for text and dark CTAs.

The palette is *fine*. It's pleasant. It's also completely safe. There's nothing here that makes you remember it. Nothing that says "this is OmiLearn and it could be nothing else." Swap the logo and this could be any ed-tech product.

The 🤖 emoji robot mascot on a tilted white card with sparkle emojis... this is the hero visual. The primary visual representation of the product. And it's a Unicode emoji on a CSS card.

This is a product that supposedly helps tens of thousands of students learn better, and the best visual you can show me is... an emoji robot? Where's the product? Where's a screenshot? Where's a real representation of what I'll actually use?

When we launched the iPhone, we showed the iPhone. We didn't show a 📱 emoji on a tilted card.

### Animations
The `fadeLeft`, `fadeRight`, `fadeUp` animations are standard scroll-triggered reveals. They're smooth. They're also completely interchangeable with any other SaaS site.

But here's the thing that actually concerns me: the **pulsing CTA button** in the final section. A button that pulses with `scale: [1, 1.05, 1]` on infinite repeat. This is the design equivalent of a used-car-lot inflatable waving tube man. It screams desperation. It says "PLEASE CLICK ME." A confident product doesn't need to make its button breathe.

The floating robot with `y: [0, -12, 0]` infinite animation — cute, but cute isn't a strategy. What does a bouncing robot emoji communicate about the product's value?

### Copy
The copy is *sharp*. Whoever wrote it understands Vietnamese university students. "Không ngại hỏi ngu, không sợ bị đánh giá" is genuinely empathetic. The FAQ section with objections phrased as the user's actual thoughts — "Nhưng mình tự học cũng được mà?" — that's smart.

But the good copy is undermined by the manipulative framing. "Trong khi bạn đọc 200 trang trong 2 ngày, người khác đã để AI tóm tắt trong 5 phút" — this is loss aversion disguised as a value proposition. It works. It also makes me distrust you.

---

## The Bullshit Detector

### "47,293 sinh viên"
This number appears THREE times on the page. Hero badge, social proof below CTA, and the stats bar. The specificity (not 47,000 — exactly 47,293) is a textbook persuasion technique. "Specific numbers feel more credible." But it backfires here because:

1. It appears in a constant called `FAKE_AVATARS`. The variable is literally called `FAKE_AVATARS`. I'm looking at the source code. You named it that.
2. The number doesn't change. It's hardcoded. A real counter would be dynamic.
3. "47,293 sinh viên đã chuyển đổi" — "converted." Converted from what? This isn't a religious movement. Real users don't "convert." They sign up.

If this number is real, prove it differently. If it's not real, remove it. A single honest number is worth more than a thousand impressive lies.

### "GPA +0.7"
An average GPA increase of 0.7 from a study tool? On a 4.0 scale, that's the difference between a C+ and a B+. From a study aid. That's an *extraordinary* claim, and you present it with zero evidence. No methodology, no study, no asterisk, no sample size. Just "+0.7" floating in a dark stats bar between emoji-avatar students and a 98% recommendation rate.

If this is real, it's your most powerful weapon. Build the entire page around proving it. If it's not real, it poisons everything else on the page.

### "98% muốn giới thiệu bạn bè"
This is either an NPS-adjacent metric or fiction. Either way, without context it means nothing. 98% of how many people? Over what time period? Self-selected survey respondents? If 50 people used it and 49 said they'd recommend it, that's 98%. It's also meaningless.

### The Testimonials
"Nguyễn Minh Anh — Bách Khoa Hà Nội, Khóa K67" — score went from 6.5 to 8.7. That's a 34% improvement in one subject. Possible? Sure. Attributable entirely to a study tool? Suspicious.

"Trần Hoàng Nam — GPA từ 2.8 lên 3.5" — that's the 0.7 bump from the stats bar! Same number. This feels like the stat was reverse-engineered from the testimonial, or vice versa. Real data doesn't align this neatly.

"Lê Thu Hà — Điểm đồ án nhóm được 9.5" — a *group* project score. How do you attribute a group project outcome to a personal study tool?

These testimonials read like they were written by the marketing team, not by students. Real student testimonials are messy, specific in weird ways, and slightly awkward. These are clean, on-message, and perfectly structured.

---

## The Figma vs. Reality Problem

I looked at the Figma reference designs. They show a completely different product — a design/project management tool with "My Projects," cards showing "Sustainable Branding" and "Urban Oasis 2024," course sharing features. The header has "Features, How it Works, Pricing" navigation with a completely different visual language — thin borders, hand-drawn dashed lines, a muted editorial aesthetic.

The landing page I'm reviewing has NONE of this. Different product language, different visual system, different content structure. Either the Figma designs are from a different product entirely, or the landing page has drifted so far from the original design that they're unrecognizable as the same product.

This is a fundamental problem. If you have a Figma, the implementation should feel like the same product at a glance. The Figma has a refined, editorial, almost typographic identity. The landing page is a generic SaaS funnel with emoji-heavy decoration.

Pick one identity. Be one thing.

---

## The Verdict

This page is a **B+**. Which means it's forgettable. The best and worst things are equally bad — it has no sharp edges, no strong opinions, no moments that make someone stop and think "wait, this is different."

It's competently assembled from proven conversion patterns. It would probably convert at an acceptable rate. And no one would remember it tomorrow.

The core problem: **this page is about what the page wants from the user (sign up), not about what the user wants from the product (to learn better).** Every section exists to push toward conversion. No section exists to genuinely make the user imagine what their life looks like with this product.

---

## Here's What I Would Do.

### 1. Kill the FOMO Headline. Lead with Vision.
**Current:** "Bạn bè bạn đang dùng AI để học. Còn bạn?"
**Change to something like:** "Upload bài giảng. AI tạo lộ trình. Bạn chỉ cần học."

**Why:** Stop making people feel bad. Make them feel excited. Show them the *possibility*, not the threat. The product's actual value — upload documents, get a personalized study plan — is genuinely compelling. Lead with that. The current headline could work as a supporting line further down, but as the FIRST thing someone reads, it puts them on the defensive.

### 2. Replace the Emoji Robot with a Real Product Screenshot or Demo.
**Current:** A 🤖 emoji bouncing on a tilted card with ✨ sparkles.
**Change to:** An actual screenshot or animated GIF of the product. Show a real document being uploaded, a real study plan being generated, a real flashcard quiz. Even a stylized mockup on a laptop/phone screen.

**Why:** The emoji mascot communicates nothing about the product. It's decoration. When someone lands on this page, they need to SEE what they're getting within 3 seconds. The hero visual is the most valuable real estate on the entire page and you've spent it on a Unicode character. Show the product. SHOW it. A 15-second looping video of "drop a PDF → see the study plan appear" would be worth more than every word on this page combined.

### 3. Kill the Pulsing CTA Button.
**Current:** `animate={{ scale: [1, 1.05, 1] }}` — an infinitely pulsing call-to-action.
**Change to:** A static, confident button. Maybe a subtle hover effect. No pulse.

**Why:** Pulsing buttons are the "CLICK HERE!!!" of modern web design. They signal desperation. Apple's buttons don't pulse. Stripe's buttons don't pulse. The most confident products in the world present their CTAs calmly because they trust that the value proposition does the selling, not the animation. If your button needs to pulse to get clicks, your page isn't doing its job.

### 4. Rebuild the Social Proof to Be Honest — or Remove It.
**Current:** "47,293" hardcoded, variable called `FAKE_AVATARS`, GPA +0.7 with no source, 98% recommendation with no context.
**Change to:** Either use real, verifiable numbers with sources ("Based on a survey of 312 students across 5 universities, Fall 2025"), or remove the stats entirely and let the product speak for itself. If you're early-stage, say "Join 500+ students from Bách Khoa who are already studying smarter." Honest small numbers beat impressive fake ones.

**Why:** Sophisticated users (and Vietnamese university students ARE sophisticated) can smell inflated numbers instantly. The moment someone doubts one number, they doubt everything. A single honest metric builds more trust than five impressive-sounding fabrications. And for the love of God, rename `FAKE_AVATARS` even if users can't see the source code — the naming reveals the mindset.

### 5. Consolidate the CTAs — One Message, Repeated Simply.
**Current:** "Bắt đầu" (navbar) → "Bắt đầu miễn phí — 30 giây" (hero) → "Tôi muốn học đúng cách →" (comparison) → "Bắt đầu ngay — miễn phí →" (steps) → "Bắt đầu miễn phí — không cần thẻ" (final). Five different CTA labels for the same action.

**Change to:** Pick ONE phrase. Use it everywhere. "Bắt đầu miễn phí" — clean, simple, consistent. No variations. No "30 giây" or "không cần thẻ" add-ons. One button. One message.

**Why:** Every variation introduces cognitive friction. The user thinks "wait, is this the same thing? Is this a different plan? What's the difference between free-30-seconds and free-no-card?" Consistency builds confidence. One message, repeated with conviction, is more powerful than five clever variations.

### 6. Make the "Before vs After" Section Show, Not Tell.
**Current:** Two text columns with emoji bullet points listing "old way" vs "new way."
**Change to:** A visual side-by-side. Left side: a cluttered desk, scattered notes, a stressed student (illustration or photo). Right side: a clean interface, a study plan, a calm student. Or better yet — LEFT: screenshot of a 200-page PDF. RIGHT: screenshot of that same content as a structured study plan in OmiLearn. Show the transformation *visually*.

**Why:** The comparison section is the strongest conceptual idea on the page. But it's executed as two lists of text. Text comparing text. The whole POINT is that OmiLearn replaces the painful way with a better way — SHOW it. A visual comparison is worth ten text comparisons. The user should FEEL the relief of the right side, not read about it.

### 7. Align the Landing Page with a Real Design System.
**Current:** The Figma designs show an editorial, typographic, refined visual language. The landing page is a different product with a different aesthetic — emoji-heavy, badge-heavy, generic SaaS funnel vibes.
**Change to:** Audit the Figma designs. Extract the real design tokens — the muted palette, the thin-border card style, the editorial typography. Rebuild the landing page to feel like it belongs to the same family as the actual product. When someone clicks "Bắt đầu" and lands in the app, it shouldn't feel like they've teleported to a different website.

**Why:** Brand coherence isn't a nice-to-have. It's trust. If the landing page feels like a high-energy sales pitch and the product feels like a calm editorial tool, users feel deceived. The transition from marketing to product should be seamless. Every pixel of the landing page should whisper: "this is what the product feels like."

---

## Final Word

The bones are decent. The copy has moments of genuine empathy. The technical execution is clean — the code is well-organized, the animations are smooth, the responsive layout works.

But this page doesn't have a soul. It has a conversion funnel.

The question I'd ask the team: **If you strip away every persuasion technique — every FOMO trigger, every social proof badge, every pulsing button — is there enough genuine value in your product to make someone want to use it?**

If yes, then trust that value. Show the product. Tell the truth. Let the work speak.

If no, then no amount of landing page optimization will save you.

I think the answer is yes. The core idea — upload your course material, get an AI-generated study plan with flashcards and quizzes — is genuinely useful. It solves a real problem for real students.

So stop selling so hard. Start showing.

*The best products don't need to convince you. They need to show you.*

— Steve
