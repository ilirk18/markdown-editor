# Markdown Editor

A client-side markdown editor that runs in the browser. Write markdown and see a live preview, with support for saving, exporting, and customizable settings.

**Created by [Ilir Krasniqi](https://ilir.netlify.app/)**

---

## Features

- **Live preview** — Edit / Split / Preview view modes
- **File actions** — Open `.md` files, save as markdown, new document
- **Export** — Download as HTML, PDF, or Word; copy as HTML or Markdown; print
- **Outline** — Document outline from headings in a side panel
- **Format toolbar** — Bold, italic, strikethrough, code, headings, lists, blockquote, tasks, tables, links, images
- **Find & replace** — In-editor find (Ctrl+F) and replace (Ctrl+H)
- **Settings** — Auto-save draft, font size, reduced motion, focus mode, zen mode, word count goal, scroll lock
- **Themes** — Dark and light interface themes (stored in the browser)
- **Resizable panels** — Drag dividers to resize the file panel, editor, and outline

---

## Getting started

1. Clone the repo:
   ```bash
   git clone https://github.com/ilirk18/markdown-editor.git
   cd markdown-editor
   ```
2. Open `index.html` in a browser, or serve the folder with any static server (e.g. `npx serve .`).

No build step required — it uses vanilla HTML, CSS, and JavaScript with [marked](https://github.com/markedjs/marked) and [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) from CDNs.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save as .md |
| `Ctrl+N` | New document |
| `Ctrl+O` | Open file |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+V` | Paste as plain text |

---

## Project structure

```
markdown-editor/
├── index.html          # Main app and layout
├── app.js              # Editor logic, preview, file/export, settings
├── style.css           # Base styles
├── theme-light.css     # Light theme overrides
├── favicon.svg         # Dark theme favicon
├── favicon-light.svg   # Light theme favicon
├── docs/
│   └── SYNTAX_HIGHLIGHTING_OPTIONS.md  # Notes on adding syntax highlighting
└── README.md
```

---

## License

Use and modify as you like. No warranty.
