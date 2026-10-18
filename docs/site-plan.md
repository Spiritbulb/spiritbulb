# Spiritbulb Website Rebuild Plan

Plan for Claude Code. Rewrite and rebuild the Spiritbulb main site (spiritb.uk) first, then reuse the same foundation for the other sites.

## 0. How to use this file

1. Read this whole file before touching code.
2. Inspect the existing repo first: framework, routing, styling approach, content location, deploy setup. Summarize what you find and propose how this plan maps onto it before making changes.
3. Never invent facts about the products. If something is marked TBD or is not in this file, ask the owner. Placeholder copy must be visibly marked, e.g. `{{TBD: ...}}`, and listed in the final report.
4. Work in the phases in section 9. Stop at the end of each phase for review.

## 1. Ground rules (truthfulness comes first)

- Every claim on the site must be true today. If it is not live yet, it is labelled **Preview**, **Waitlist**, **Coming**, or **On request**.
- Buttons promise only what works. Waitlist and contact buttons are never styled as sign-up buttons.
- "Made for East Africa" is a claim about fit (local billing, pricing in local currency, product shaped for local businesses and schools). It is NOT a claim about where servers are. Current servers are international.
- Kenyan hosting is available **on request only** and is not on the dashboard. It appears only on the MCloud page and the Contact flow, worded like "Need your data hosted in Kenya? Talk to us." It never appears on the homepage and is never implied to be self-serve.
- Do not use the phrase "intelligent infrastructure" anywhere. If AI is meant, say what the AI is.
- Do not call the library "open". It is a **connected library**: everything starts private, and the owner chooses what to share.

## 2. Messaging foundation

**What Spiritbulb is:** the platform for East African businesses and institutions to sell, host, gather, and teach, with AI built in, local billing, and clean-energy infrastructure you can run with us or on your own servers.

**Hero:** *Sell. Host. Gather. Teach.*
**Subline:** *One platform for East African businesses and institutions, with AI built in.*

**Core idea:** one platform, four doors, with AI as a layer running through all of them (not a fifth door). MCloud is the thread underneath: shops, learning, and events can run on it, or on the customer's own servers.

**The four doors**

| Verb | Product | What it is |
|---|---|---|
| Sell | Reach | Build storefronts and sell on the Reach marketplace |
| Host | MCloud | Managed infrastructure, easy local billing, clean renewable energy; also hosts AI models |
| Gather | Tufike | Events with seamless ticketing and pre/post-event experiences that keep an audience hooked |
| Teach | Nuru | Fine-tuned AI model built for learning; notes, questions, and a connected library; links to LMSs |

**Threads every page can return to**

1. **One platform, not four tools.** Shops, events, courses, and AI share infrastructure and customers.
2. **Made for East Africa.** Local billing, pricing in your currency, a product shaped by how businesses and schools here work. Say "made for", never "hosted in".
3. **AI you can use or own.** Open-source models hosted for you, fine-tuned models like Nuru, or bring your own and run it on MCloud.
4. **Clean energy underneath.** Running on renewable energy is part of the infrastructure, not a footnote.
5. **No lock-in.** Run on MCloud or your own servers. Share from your connected library only what you choose.

## 3. Product status (source of truth for badges and buttons)

| Door | Product | Status | Badge | Primary button |
|---|---|---|---|---|
| Sell | Reach | Live | Live | Start selling |
| Host | MCloud | Live | Live | Get started |
| Teach | Nuru | Preview | Preview | Try the preview |
| Gather | Tufike | Waitlist | Waitlist | Join the waitlist |

Put status in one config file (e.g. `site.config` / a JSON or TS module) and read it everywhere. When a product's status changes, one edit should update badges, buttons, pricing columns, and the homepage scenario.

## 4. Voice

Confident, energetic, plain-spoken, a little playful (the owner's own phrase is "throw banger events"). Short sentences. Concrete nouns. East African context over generic examples.

Never sounds like enterprise cloud jargon. Avoid: "leverage", "synergy", "next-generation", "end-to-end", "empower", "intelligent infrastructure".

Typographic rule: if a line would look at home on a big enterprise cloud vendor's site, rewrite it.

## 5. Site map

Home, Reach, MCloud, Tufike, Nuru, Models, Pricing, About, Contact.

## 6. Page specs

### 6.1 Home (top to bottom)

1. **Hero.** Headline and subline from section 2. Primary button **Get started** (to Reach or MCloud signup). Secondary **See how it fits together** (scrolls to section 3 below). Do not put the waitlist in the hero.
2. **The four doors.** Four cards using the table in section 3. Badge on each card. Reach and MCloud get more visual weight; Nuru and Tufike read as early access.
   - Reach: *Build a storefront and sell on the marketplace.*
   - MCloud: *Managed infrastructure with local billing, running on clean energy.*
   - Tufike: *Ticketing plus the before and after that keeps your audience hooked.*
   - Nuru: *AI built for learning. Upload what you study, get notes and questions, and keep a library you control.*
3. **One platform.** Anchor the scenario in what is live: a Reach storefront running on MCloud with local billing. Add one line: *"Soon: sell tickets with Tufike and bring in Nuru."* Do not present the full future scenario as current.
4. **AI, plainly.** Three lines: open-source models hosted for you; fine-tuned models like Nuru; or bring your own and run it on MCloud. Before writing this section, confirm with the owner whether hosted open-source models are self-serve today. If not, label them **On request** or **Preview**.
5. **Made for East Africa.** Local billing, pricing that fits how people here pay, product shaped by local businesses and schools. Never "hosted in".
6. **Your infrastructure, your terms.** One strip: clean energy and no lock-in (MCloud or your own servers; you decide what to share).
7. **Closing CTA** and footer.

Cut from the homepage: feature lists (they live on product pages), "intelligent infrastructure", anything implying Kenyan servers are self-serve.

### 6.2 Reach
Storefronts plus the marketplace. Live. Lead with what a seller can do in the first session. Details beyond "storefronts and marketplace" are TBD, so ask the owner: `{{TBD: Reach feature list, onboarding steps, fees}}`. Show Reach running on MCloud with local billing.

### 6.3 MCloud
Managed infrastructure, easy local billing, clean renewable energy. Live. Runs shops, can host AI models, and customers can alternatively use their own servers. Include a clearly separate block: **"Need your data hosted in Kenya? Talk to us."** linking to Contact. Pricing details: `{{TBD}}`.

### 6.4 Tufike (waitlist)
Short, vivid page built around the waitlist form. Describe the experience: seamless ticketing, pre-event and post-event experiences that keep an audience engaged. Who it is for: organizers who want events people keep talking about. One form, as few fields as possible (email, plus optionally what kind of events). Badge: Waitlist. Line: *Waitlist members hear first.* Do not show pricing or a launch date unless the owner provides one.

### 6.5 Nuru (preview)

- **Badge:** Preview
- **Headline:** *Upload what you're learning. Nuru turns it into notes, questions, and a library that's yours.*
- **Subline:** *Chat with Nuru, share what you make, and let anyone you choose ask Nuru about it.*
- **Button:** **Try the preview**, with small text underneath: *Free daily messages, so you can try Nuru on real work.* The exact limit goes in the FAQ and the in-app counter, not the headline.
- **Visual:** the loop as one graphic: file goes in, notes and questions come out, they land in a private library, one item gets a share link.

**How it works (three steps)**
1. **Chat and upload.** Give Nuru your files and talk to it about them.
2. **Nuru makes the study material.** It writes notes and questions and files them in your private library.
3. **Share one thing.** Make the notes public, and anyone who opens the link can ask Nuru about them. Give this its own demo: a shared notes link with a chat box beside it.

**Live vs coming**

| In the preview now | Coming with the full platform |
|---|---|
| Chat with Nuru | Institution accounts with full access |
| Upload files | Partners connected to the library |
| Notes and questions | LMS linking |
| Private library | Wider sharing across institutions |
| Share one item publicly | Free and paid personal accounts |
| Daily message limit (lower for generating content) | |

**Two audiences, two paths**
- *For students:* **Try the preview** button.
- *For schools and partners:* **Talk to us** button, plus a line about institution accounts and the connected library coming.

**Library wording:** "connected library you control". Sharing options: private, public link, partner institutions (partner institutions are coming, label accordingly).

**FAQ:** include the daily limit, what happens at the limit (shows when it resets), what files are supported `{{TBD}}`, and data/privacy answers `{{TBD: owner to provide}}`.

### 6.6 Models
Lists only what a customer can use today. Open-source models hosted by Spiritbulb (status per the owner), fine-tuned models, with Nuru marked Preview. `{{TBD: model catalog, names, access method}}`. Do not list models that are not available.

### 6.7 Pricing
Reach and MCloud only, with real numbers `{{TBD: owner}}`. Nuru and Tufike rows:

| | Preview (now) | Personal (coming) | Institution (coming) |
|---|---|---|---|
| Access | Open to everyone | Free and paid options | Full access with institution accounts |
| Limits | Daily message limit, lower for generating content | Higher limits | Set with the institution |
| Price | Free | Pricing soon | Talk to us |

Style the "coming" columns visibly as coming. Tufike row: *Waitlist members hear first.* Do not invent tiers.

### 6.8 About and Contact
About: Spiritbulb, registered in 2024, building one platform for East African businesses and institutions. Founder story `{{TBD: owner}}`. Contact: a form with a topic selector that includes "Kenyan hosting", "Institution / school", "Partnership", and "General".

## 7. Graphics direction

- One idea per graphic. Each of the four verbs gets its own visual identity, with one shared element (a line, a glow, a shape) marking MCloud as the thread underneath.
- AI is a layer, not a fifth icon: show it running through the four doors.
- Real East African context: local shops, schools, events. No generic stock scenes.
- Same voice as the copy: confident, plain, a bit playful.
- Build graphics as inline SVG or components that read colors from the same design tokens as the site, so they work in light and dark mode and can be reused across the other sites.
- Needed first: hero graphic, four door icons or illustrations, "one platform" diagram (Reach on MCloud), Nuru loop graphic, Tufike waitlist visual. `{{TBD: logo and brand colors from owner or existing site}}`

## 8. Shared assets to extract for the other sites

After the main site is done, move these into a reusable form (shared package, or a documented folder to copy):
- Design tokens (color, type, spacing)
- Status config and badge/button components
- Copy blocks: one-liner, hero, four door descriptions, five threads
- Graphic components
- This file's "claims" rules (section 1) as a checklist for reviewing every other site

## 9. Execution phases

**Phase 1: Audit (no changes).** Inspect the repo, list current pages and copy, identify what maps to the new site map, flag anything on the current site that contradicts section 1. Report back with a proposed file/route plan.

**Phase 2: Foundation.** Add the status config, design tokens, shared components (badge, door card, status-aware button, section layouts), and the navigation for the new site map. No page copy yet beyond placeholders.

**Phase 3: Homepage.** Build section 6.1 with real copy from this file. Mark TBDs. Review.

**Phase 4: Product pages.** Reach, MCloud (with the Kenyan hosting block), Nuru, Tufike, in that order. Wire the Tufike waitlist form to the owner's chosen backend `{{TBD}}` and the Nuru button to the preview app URL `{{TBD}}`.

**Phase 5: Models, Pricing, About, Contact.**

**Phase 6: Graphics.** Replace placeholders with the graphics in section 7.

**Phase 7: QA and accessibility.** Mobile first (many visitors will be on phones and slower connections): performance budget, image weight, readable contrast in light and dark mode, keyboard navigation, alt text, correct meta titles and descriptions, sitemap, open graph images.

**Phase 8: Extract shared assets** per section 8, then repeat for the next site.

## 10. Questions the owner still needs to answer

1. Is hosted open-source model access self-serve today, or on request?
2. Reach: feature list, onboarding, fees, marketplace details.
3. MCloud: plans and prices, what "own servers" setup involves.
4. Preview app URL for Nuru; where the Tufike waitlist should store signups.
5. Supported file types and privacy answers for Nuru.
6. Logo, brand colors, fonts: keep the existing ones or change?
7. What do the other sites cover, and which one is next after the main site?

## 11. Definition of done

- Every claim on every page passes the section 1 rules.
- Every badge and button comes from the status config.
- No remaining TBD markers, or all remaining ones are listed in the final report.
- "Intelligent infrastructure" and "open library" appear nowhere.
- Kenyan hosting appears only on MCloud and Contact.
- Mobile and desktop both reviewed in light and dark mode.
- Shared assets extracted and documented for the next site.

## Answers so far

Recorded from the owner during phases 1 and 2 (October 2026).

- **Hosted open-source models:** on request.
- **Running on your own servers:** dropped (October 2026). Nothing is offered that way today; Nuru may support it after the preview. This replaces the "No lock-in" thread and the own-servers parts of §2, §6.1 and §6.3. Thread 5 is now "Your data, your call": the connected library starts private and you choose what to share.
- **Trading apps:** being scrapped; not on the site.
- **Clean energy:** true today. MCloud runs on UpCloud's green infrastructure. That is why Kenyan hosting stays on request while the local option is worked out; it is still available if you talk to us.
- **Reach sign-up:** goes to app.mcloud.co.ke (the MCloud store app) until Reach has its own web app.
- **Reach:** a themed storefront where you add products, set up payments, edit the design, share the link and manage orders. Free plan to try it. The marketplace is for paid plans only and by approval, reviewed on a rolling basis, requested from the dashboard. Listed stores reach buyers in their delivery zone, with orders and deliveries tracked together. Plans and prices: mcloud's packages/merchant/src/plans.ts.
- **Hosting:** everything moves to UpCloud over time. Today UpCloud runs MCloud's servers; storefronts are still on Vercel.
- **Naming providers:** the site never names infrastructure providers; there will be more than one. Say "green infrastructure". (Pinned in lib/products.test.ts.)
- **Nuru preview:** web only. It will be built on the Nuru page, using MCloud's existing Nuru APIs through new partner endpoints for spiritbulb. The Android app is closed to existing users; access on request.
- **Tufike waitlist:** stored through `/api/waitlist`, MCloud's partner waitlist.
- **About:** registered 2024; founders Bentley Busienei, Stephanie Kanji, Nelly Miano. Headcount is not mentioned.
- **Logo:** the lotus stays, redrawn as `public/lotus.svg` (gold). Per-product petal colours stay.
