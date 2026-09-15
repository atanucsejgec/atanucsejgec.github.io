# Changelog

All notable changes to the atanu.tech portfolio. Times are IST (UTC+5:30).

## [2.1.0] — 2026-09-15 21:45 IST

Favicon suite, PWA manifest, and structured assets folder.

### Added
- Multi-format favicon and browser tab icon suite (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, Android Chrome icons).
- Web application manifest (`site.webmanifest`).
- Dedicated `assets/` structure: `assets/icons/` for brand icons and `assets/frames/` for canvas animation frames.

### Changed
- Reorganized image assets into `assets/frames/` and `assets/icons/`.
- Updated asset paths across `index.html`, `script.js`, and `site.webmanifest`.

## [2.0.0] — 2026-09-15 20:45 IST

Design and animation overhaul, new sections, real project data.

### Fixed
- Skill tiles and project cards never appeared: both grids were `kinetic-group`s with no `scroll-in-out-trigger`, so their children stayed at opacity 0.
- Footer never revealed (it sat inside the observer's bottom dead-zone); reveal removed from the footer.
- Dev-only grid inspector (`grid-overlay.js` / `grid-overlay.css`) was shipping on the live site; no longer loaded.
- Hero CTA read "Découvrir mon CV / Projects"; now "See my projects".
- Unused Plus Jakarta Sans font request removed.
- Navbar only appeared while scrolling up; it now shows whenever you are past the hero.
- Hero text was unreadable on phones where the photo's dark cutout sat behind it; hero blocks now get a frosted white panel under 960px.

### Added
- Reading progress bar (lime → coral) fixed to the top of the page.
- Section dot navigation on the right edge (desktop) with hover labels and active state.
- Back-to-top button (appears after one viewport of scroll).
- Stats strip under About with scroll-triggered count-up: 2+ years, 278 GATE score, 57 public repos, 6 core domains.
- `#experience` timeline section: scroll-filled line, alternating cards on desktop, single left rail on mobile. Five entries: Crontel Technologies, Smart Class Connect, GATE CS 2026, JGEC, Bongaon High School.
- Two-row tech marquee scrolling in opposite directions (pauses on hover), replacing the static badge strip.
- Projects section rebuilt with six real repositories from github.com/atanucsejgec: NetPulse, YouTube Downloader, NotiSync (Sender + Receiver), Markdown to Printable, LinkedIn Banner Designer, AutoPilot. Each card has Code/Live links, language colour, and a filter bar (All / Android / Web / Python) with an empty state.
- "See all 57 repositories on GitHub" link below the projects grid.
- Hamburger menu and slide-down drawer under 640px.
- Contact form now submits via Formspree (`fetch`) with inline validation, sending/success/error states and a honeypot field. Falls back to a `mailto:` link until `FORMSPREE_ID` is set in `script.js`.
- Scroll hint at the bottom of the hero.
- `#experience` anchor added to `sitemap.xml`.
- `theme-color` meta and preload hint for the first canvas frame.

### Changed
- Section headings are large display type ending in a coral period (e.g. "Who am I**.**"), echoing the hero's "Atanu Biswas." to tie the light hero and dark sections together. Pill backgrounds and all-caps removed.
- Palette bridged: coral now appears in dark sections (GATE stat tile, timeline node, "Disciplines" label, Live button); lime remains the primary action colour. Tokens renamed to `--lime` / `--coral` with legacy aliases kept.
- Hero arrow draws itself on load (`stroke-dasharray` animation); magnetic hover on the CTA and social buttons; skill icons tip on hover.
- Project cards have a subtle 3D tilt on hover, driven by CSS variables.
- Reveal system moved from per-frame `getBoundingClientRect` over every element to an `IntersectionObserver` (same in/out choreography, far cheaper on mobile).
- Hover lifts compose through `--lift` / `--grow` variables instead of `!important` transform overrides.
- Credentials tab filter and project filter toggle a class instead of writing inline styles.
- Skill tiles gained a one-line sub-label (e.g. "Jetpack Compose, Room, Coroutines").
- `prefers-reduced-motion` now also disables the marquee, tilt, magnetic hover, count-up and arrow animation.
- CSS and JS links carry a `?v=` cache-buster; bump it when deploying.
- Footer copy updated.

### Removed
- Static "Infrastructure & Ecosystem" badge list (replaced by the marquee).
- Placeholder project cards (PulseFit, CloudScale, NeuralInference).
- `alert()` on contact form submit.

## [1.1.0] — 2026-09-12

- Added technical SEO: JSON-LD Person/WebSite schema, Open Graph and Twitter meta, `robots.txt`, `sitemap.xml`.
- Grid inspector overlay set to off by default.
- `CNAME` for atanu.tech.

## [1.0.0] — 2026-09-11

- Initial portfolio: scroll-scrubbed 50-frame canvas background, editorial hero with credentials hub, About, Skills, Projects and Contact sections, kinetic typography and scroll in/out reveals.
