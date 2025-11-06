# Book Club Platform – Design Guidelines (v2.0)

## 1. Overall Aesthetic

**Theme:** Whimsical, bookish, and introspective. The design should evoke a cozy
reading nook—digital but tactile. **Mood:** Calm, intimate, and introspective.
The aesthetic is defined by **soft candlelight warmth**, suggesting a quiet,
late-night reading session. **Color Palette:**

- **Primary:** Indigo (#4F46E5) – evokes creativity and focus.

- **Secondary:** Zinc gray variants (#18181B → #E4E4E7) – for modern depth and
  contrast.

- **Accent:** Soft cream (#F5F5F4) or parchment texture for subtle warmth.

- **Highlights (Interaction):** Lavender (#A78BFA) for hover states, selection,
  and active elements.

- **Candlelight Glow (Atmosphere):** Muted gold/Amber (#D4AF37) used exclusively
  for the fixed background radial gradient and key non-interactive icons.

## 2. Typography

**Primary Font:** serif (e.g., Lora or Merriweather) – classic literary feel.
Used for titles and section headers. **Secondary Font:** sans-serif (e.g., Inter
or Nunito) – Used for UI elements, buttons, and body text. **Styling:**

- Titles and section headers use serif fonts with slight letter spacing.

- Paragraphs have comfortable line height (1.6–1.8) and soft text color
  (#D1D5DB).

- UI labels and buttons use sans-serif for legibility.

## 3. Layout & Components

**Focused List View (New Primary Layout):**

- The primary layout (e.g., Voting/Activity feeds) uses a **single-column,
  full-width list view** rather than a card grid for a focused, document-like
  feel.

- **Book Items:** Items maintain soft rounded corners (1.5–2rem radius) and use
  a semi-transparent dark overlay with blur (`backdrop-blur-lg`). Items should
  stack with generous vertical spacing (e.g., `space-y-6`).

**Buttons:**

- Rounded-pill or soft-rounded edges.

- Primary: Indigo background, white text.

- Secondary: Zinc-gray background with text that darkens slightly on hover.

- **Motion:** Small hover lift (translate-y-[-2px]) and glow on active.

**Inputs:**

- Dark background with subtle inset shadows.

- Text color: near-white (#E4E4E7).

- Placeholder: muted gray (#71717A).

## 4. Motion & Whimsy

**Framer Motion Elements:** Floating icons (feathers, stars, pages) moving
slowly upward or across the peripheral background. **Speed & Style:**

- Never abrupt. Use easing curves: `easeInOut` or `easeOut`.

- Duration 10–20s for background loops; 0.3s–0.5s for button and card
  interactions.

## 5. Visual Motifs

**Icons:**

- Use literary symbols: open books, quills, ink bottles, and bookmarks (Lucide
  icons preferred).

- Keep outlines fine and minimal.

**Lighting & Warmmth:**

- **Mandatory:** Implement a fixed, soft **radial gradient** centered on the
  screen. The gradient must transition subtly from a low-opacity amber/muted
  gold (#D4AF37) at the center to the dark background (#0F0F10) at the edges.
  This creates the atmospheric "candlelight vignette" effect.

- Avoid pure black; use **#0F0F10** or **#18181B** as true backgrounds.

## 6. Accessibility

- Maintain a minimum contrast ratio of 4.5:1 for all text.

- Avoid overly animated motion in form fields; background whimsy should remain
  peripheral.

- Focus outlines should be visible (use indigo or soft gold outlines).

## 7. Tone & Messaging

**Voice:** Warm, inviting, slightly poetic. Example: “Welcome back, reader.”
**Microcopy:** Avoid corporate tone. Use phrases like “Welcome to the club” or
“Cast Vote” instead of generic “Login/Submit.”
