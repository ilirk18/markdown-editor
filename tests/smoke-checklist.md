# Smoke Test Checklist

Run this checklist after each phase.

## Core Flows

- Open a `.md` file from the file panel.
- Save the current document as `.md`.
- Create a new document and confirm unsaved warning appears when expected.
- Switch view modes: Edit, Split, Preview.
- Open find (`Ctrl+F`) and replace (`Ctrl+H`) and perform one replacement.
- Open PDF export modal, close it, then export HTML and Word.

## Draft Recovery

- Enable auto-save draft, type content, reload page, and restore draft.
- Discard restore prompt and verify previous snapshot fallback remains available.

## Accessibility

- Navigate outline items using keyboard and activate with Enter/Space.
- Toggle mobile panels and confirm `aria-expanded` updates correctly.
- Focus each panel resizer and resize with Arrow keys.

## Security/Rendering

- Paste markdown with raw HTML (`<script>`, `onerror`) and verify no script executes.
- Verify regular markdown still renders correctly in preview and exports.
