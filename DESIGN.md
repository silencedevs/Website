---
name: Silence
description: A factual game script catalogue built around the supplied red Silence artwork.
colors:
  ground: "#0b0b0c"
  surface: "#151516"
  raised: "#202022"
  ink: "#f5f5f5"
  muted: "#b8b7b5"
  accent: "#df2033"
  link: "#ff6b78"
  accent-ink: "#fff"
  action-hover: "#d91f30"
  secondary-hover: "#303032"
  copy-hover: "#363638"
  field-border: "#505052"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(56px,5.5vw,80px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(40px,5vw,72px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "ui-monospace, monospace"
    fontSize: "16px"
    lineHeight: 1.8
rounded:
  control: "14px"
spacing:
  gutter: "clamp(20px,4vw,64px)"
  small: "8px"
  compact: "12px"
  control: "16px"
  list: "20px"
  panel: "24px"
  group: "32px"
  mobile-section: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  search:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "48px"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  filter-selected:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
  game-entry:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "24px"
  copy-button:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    padding: "8px 16px"
  faq:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 24px"
---

# Design System: Silence

## Overview

**Creative North Star: "Independent game publisher catalogue"**

The supplied red Silence artwork anchors a black catalogue with compact headings and readable descriptions. Large game covers identify the actual entries; restrained controls support finding games, checking status and inspecting source-backed features.

This records the implemented independent game publisher catalogue direction. The visual identity belongs to the supplied artwork, the condensed heading voice and the red action field. It does not establish publication readiness.

**Key Characteristics:**
- Black tonal surfaces with a vivid red action accent.
- Condensed bold headings paired with regular local body type.
- Actual supplied artwork and game covers, without added decorative grids or glow.
- Flat, compact controls and progressively enhanced catalogue tools.

## Colors

A near-black tonal palette gives the supplied red artwork and game covers a clear setting. The sidecar tonal ramps are synthesized preview metadata required by the documentation format, not additional implemented palette steps.

### Primary

- **Vivid action red** (`accent`): primary controls, community invitation, selection and focus outlines.
- **Readable rose link** (`link`): inline source and legal links, navigation hover and outdated status text. This semantic text role is distinct from the action background.
- **Action hover red** (`action-hover`): primary button and community hover.

### Neutral

- **Ground black** (`ground`): page canvas and inset code surface.
- **Panel charcoal** (`surface`): game entries, FAQ details, notices and loader band.
- **Raised charcoal** (`raised`): secondary controls, selected filters and artwork fallback.
- **Reading white** (`ink`): main text and interactive labels.
- **Quiet grey** (`muted`): supporting copy, metadata and placeholders.
- **Action white** (`accent-ink`): labels on red actions.
- **Secondary hover charcoal** (`secondary-hover`) and **copy hover charcoal** (`copy-hover`): distinct implemented control states.
- **Field outline grey** (`field-border`): the visible search boundary.

**The Red Role Rule.** Use accent for action backgrounds and focus outlines. Use link for inline links, navigation hover and outdated status so those text roles remain readable on dark surfaces.

## Typography

**Display Font:** locally hosted Inter bold, registered as `Fira Condensed`, with sans-serif fallback.

**Body Font:** locally hosted Inter regular, registered as `Fira`, with sans-serif fallback.

**Label/Mono Font:** body type for labels; system monospace for actual loader code.

The condensed face makes game titles compact and prominent. Regular body type keeps feature descriptions and instructions readable. Paragraphs use a maximum of 65ch; game descriptions narrow to 58ch.

### Hierarchy

- **Display:** the primary title scale in frontmatter; the hero becomes 12vw at 1000px and below, then 18vw with line-height 1 at 650px and below. The community title uses the same desktop size and 18vw on mobile.
- **Headline:** section headings use the frontmatter headline scale.
- **Title:** catalogue headings use the final 36px override, becoming 28px on mobile. The introductory lead shares those sizes in the regular body face with line-height 1.2. The brand also shares those sizes, with its narrow-header exception described below.
- **Body:** final cascade is 18px on desktop, 16px at 650px and below; descriptions follow the same responsive values.
- **Label:** supporting metadata, result counts and footer copy use 16px. Code also uses 16px, with its own monospace face and line-height.

The five primary reading tiers are display, headline, title, body and label. Supporting routes retain observed exceptions: page titles use `clamp(52px,7vw,96px)` and become 52px on mobile; legal subheadings are 32px, then 30px. Feature cells use 16px. Do not reinstate earlier overridden stylesheet values such as the initial 17px body or 32px catalogue heading.

**The Local Type Rule.** Keep Inter regular for reading and Inter bold for headings. Reserve monospace for genuine code.

## Layout

The centered frame has a maximum width of 1440px, including responsive inline gutters. The opening uses a 1:1.1 split, while loader and FAQ layouts use 1:1.25. Their desktop gaps are 7%. Game entries align a cover, copy and action in three columns, with the cover track at `minmax(180px,30%)`; covers retain a 16:9 ratio. Detail pages use two equal columns.

Spacing is structural: sections use 80px vertical padding on desktop and 48px on mobile; entries and code panels use 24px padding, becoming 16px and 20px respectively on mobile. Native FAQ rows use 24px inline padding, becoming 20px.

### Responsive rules

- **At 1600px and above:** hero top padding increases to 56px and artwork maximum width to 590px.
- **At 1000px and below:** navigation gaps become 20px. Game entries become `29% 1fr`; the action moves below the copy while the cover spans both rows. Loader and FAQ gaps become 40px; feature cells become one column.
- **At 650px and below:** header height becomes at least 88px, source navigation is hidden, brand artwork becomes 30px square and navigation uses 16px gaps. Hero, catalogue, loader, FAQ and detail content become single-column. Header action height becomes at least 44px. Search stretches to the available width, catalogue actions stretch across their entry, and footer groups stack. Feature cells return to two columns. Hero artwork uses a 1.4 aspect ratio with `object-fit:contain` to preserve the supplied image.
- **At 380px and below:** the header gap is 8px, brand text is 24px, navigation gap is 10px and the Discord button has 10px inline padding with `white-space:nowrap`. Preserve this fix so the brand, Games link and Join Discord stay distinct at 320px.

## Elevation & Depth

The system uses flat tonal layering rather than shadows. No box-shadow vocabulary is implemented. The supplied raster may contain its own light and gradient; it does not authorize additional interface glow. Hovering a button moves it up 2px, and its active state moves it down 1px.

**The Tonal Surface Rule.** Separate areas with ground, surface and raised. Do not add card shadows to create hierarchy.

## Shapes

Controls, game entries, code panels and FAQ details have nearly square corners using the control radius. Artwork crops are rectangular. Search has a 1px field outline; cards and actions use tonal boundaries without added decorative borders. The copy button remains square.

## Components

### Buttons

Primary actions use red with white text; secondary actions use raised charcoal with reading white. Both are inline flex controls, have a 16px content gap and use the frontmatter dimensions as minimum heights rather than fixed clipping heights. Hover and active transforms communicate action. Background and transform transitions run for .2s; the transform uses the shared easing curve. External arrow SVGs are 18px.

### Search and filters

The outlined search field is transparent, with quiet placeholder text and a red caret. Its label remains available to assistive technology. Filters are flat buttons with `aria-pressed`; selection changes the background to raised charcoal and text to reading white. Hover uses surface charcoal and reading white. Tools appear only when JavaScript is available, leaving all entries readable otherwise.

### Game entries

A tonal row pairs 16:9 game artwork with title, textual status, summary and a dedicated link. The action uses raised charcoal; hover reverses it to reading white with ground-black text. Outdated status uses the readable rose link token and remains explicit in text. Entries reflow according to Layout rather than truncating their content.

### Loader panel

A ground-black inset presents genuine code, a square copy control and a reserved live feedback line. The code wraps and permits long fragments to break. The copy button uses raised charcoal, its own hover neutral and a minimum 44px height. Instructions remain body type.

### FAQ details

Native details elements use surface charcoal and nearly square corners. Summaries have a minimum height of 72px, a pointer cursor and a plus indicator that changes to a multiplication sign when open. Answer text is muted; inline links use the readable rose role.

### Navigation

The header is a single flex row with a linked emblem and wordmark, a Games link, a Source link and a secondary Discord action. The Source link hides on mobile; navigation hover uses the rose link role while button hover keeps its button text treatment. Footer links wrap and have a minimum height of 44px.

### Community invitation and shared states

The community invitation is an actual full-width red link with a large condensed heading, white text and an inline arrow. It uses the action hover red with a .25s background transition. All focus-visible elements have a 3px red outline offset by 6px. A keyboard skip link becomes visible on focus.

Entry motion uses the shared `cubic-bezier(.16,1,.3,1)` easing: content rises 18px over .8s, with .08s stagger increments where applied; the `enter` variant runs .65s. Artwork rises 24px over 1.3s. Reduced motion removes these animations, smooth scrolling and relevant transitions, and suppresses button transforms.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied Silence image and use actual game artwork to identify catalogue entries.
- **Do** retain visible keyboard focus, labelled search, pressed filter states and native details behavior.
- **Do** use professional English and factual, source-backed status and feature copy.
- **Do** retain the narrow header spacing fix and check the brand and Join Discord at 320px.

### Don't:

- **Don't** add emoji or dash punctuation to site prose.
- **Don't** add decorative glow or grids outside the supplied raster artwork.
- **Don't** invent catalogue entries, metrics, gameplay footage or compatibility claims.
- **Don't** treat the five primary reading sizes as a ban on responsive, legal-page or genuine-code exceptions.


## Current operator references

Inter is the current locally hosted interface face, 400 for body text and 800 for the hero. The hero uses a single word Silence, a supplied logo and rotating red operator supplied copy. Main actions use the provided ShinyButton with black fill and red sweep/glow. All controls and panels use 14px corners. Secondary buttons use #8a000024 fill, #ff343466 border and 12px backdrop blur. The navigation CTA uses compact 14px text and 10.4px by 16px padding. Docked navigation has no fill, border, blur or shadow; floating navigation uses #180909b8 with a thin red border. White official brand icons identify destinations. The reference shader retains its geometry and has equivalent WebGL1 syntax as a compatibility path. See docs/qa.md for the actual verification scope.


Grey content glass uses --glass-neutral rgba(42,42,46,.42), --glass-neutral-border rgba(255,255,255,.16), an 18px blur and a fine inset highlight. This applies to games, stats, FAQ and the code window. Red glass remains the action material. Opaque neutral fallbacks preserve usability when blur is unsupported or reduced transparency is requested.
