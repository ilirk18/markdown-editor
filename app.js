(function () {
  "use strict";

  const THEME_KEY = "ilirTheme";
  const CONTROLS_WIDTH_KEY = "mdEditorControlsWidth";
  const LAYERS_PANEL_WIDTH_KEY = "mdEditorLayersPanelWidth";
  const DRAFT_KEY = "mdEditorDraft";
  const DRAFT_HISTORY_KEY = "mdEditorDraftHistory";
  const AUTO_SAVE_DRAFT_KEY = "mdEditorAutoSaveDraft";
  const WORD_GOAL_KEY = "mdEditorWordGoal";
  const FONT_SIZE_KEY = "mdEditorFontSize";
  const REDUCED_MOTION_KEY = "mdEditorReducedMotion";
  const FOCUS_MODE_KEY = "mdEditorFocusMode";
  const ZEN_MODE_KEY = "mdEditorZenMode";
  const PREVIEW_LIGHT_KEY = "mdEditorPreviewLight";
  const SCROLL_LOCK_KEY = "mdEditorScrollLock";
  const CONTROLS_WIDTH_MIN = 200;
  const CONTROLS_WIDTH_MAX = 480;
  const LAYERS_WIDTH_MIN = 180;
  const LAYERS_WIDTH_MAX = 420;
  const DRAFT_SAVE_INTERVAL_MS = 2000;
  const PREVIEW_DEBOUNCE_MS = 120;
  const DRAFT_HISTORY_LIMIT = 5;

  const THEMES = ["dark", "light", "prishtina"];

  function getTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return THEMES.includes(v) ? v : "dark";
    } catch (e) {
      return "dark";
    }
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) theme = "dark";
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    document.body.classList.add("theme-switching");
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-prishtina", theme === "prishtina");
    var fav = document.getElementById("favicon");
    if (fav) fav.href = theme === "light" ? "favicon-light.svg" : "favicon.svg";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove("theme-switching");
      });
    });
  }

  function getStoredPanelWidths() {
    try {
      const c = parseInt(localStorage.getItem(CONTROLS_WIDTH_KEY), 10);
      const l = parseInt(localStorage.getItem(LAYERS_PANEL_WIDTH_KEY), 10);
      return {
        controls: (!isNaN(c) && c >= CONTROLS_WIDTH_MIN && c <= CONTROLS_WIDTH_MAX) ? c : 260,
        layers: (!isNaN(l) && l >= LAYERS_WIDTH_MIN && l <= LAYERS_WIDTH_MAX) ? l : 220
      };
    } catch (e) {
      return { controls: 260, layers: 220 };
    }
  }

  function applyPanelWidths(controlsW, layersW) {
    if (controlsW != null) document.documentElement.style.setProperty("--controls-width", String(controlsW) + "px");
    if (layersW != null) document.documentElement.style.setProperty("--layers-panel-width", String(layersW) + "px");
    updateResizerA11y();
  }

  function updateResizerA11y() {
    var resizerLeft = document.getElementById("resizerLeft");
    var resizerRight = document.getElementById("resizerRight");
    if (!resizerLeft || !resizerRight) return;
    var currentLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--controls-width"), 10) || 260;
    var currentRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--layers-panel-width"), 10) || 220;
    resizerLeft.setAttribute("aria-valuemin", String(CONTROLS_WIDTH_MIN));
    resizerLeft.setAttribute("aria-valuemax", String(CONTROLS_WIDTH_MAX));
    resizerLeft.setAttribute("aria-valuenow", String(currentLeft));
    resizerRight.setAttribute("aria-valuemin", String(LAYERS_WIDTH_MIN));
    resizerRight.setAttribute("aria-valuemax", String(LAYERS_WIDTH_MAX));
    resizerRight.setAttribute("aria-valuenow", String(currentRight));
  }

  function setupPanelResizers() {
    const resizerLeft = document.getElementById("resizerLeft");
    const resizerRight = document.getElementById("resizerRight");
    if (!resizerLeft || !resizerRight) return;

    const widths = getStoredPanelWidths();
    applyPanelWidths(widths.controls, widths.layers);

    function onLeftMove(e) {
      const dx = e.clientX - (resizerLeft._startX || 0);
      let w = Math.round((resizerLeft._startWidth || 260) + dx);
      w = Math.max(CONTROLS_WIDTH_MIN, Math.min(CONTROLS_WIDTH_MAX, w));
      applyPanelWidths(w, null);
    }

    function onLeftUp() {
      resizerLeft.classList.remove("resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onLeftMove);
      document.removeEventListener("mouseup", onLeftUp);
      const w = document.documentElement.style.getPropertyValue("--controls-width");
      if (w) try { localStorage.setItem(CONTROLS_WIDTH_KEY, parseInt(w, 10)); } catch (err) {}
    }

    resizerLeft.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      resizerLeft._startX = e.clientX;
      resizerLeft._startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--controls-width"), 10) || 260;
      resizerLeft.classList.add("resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onLeftMove);
      document.addEventListener("mouseup", onLeftUp);
    });

    function onRightMove(e) {
      const dx = e.clientX - (resizerRight._startX || 0);
      let w = Math.round((resizerRight._startWidth || 220) - dx);
      w = Math.max(LAYERS_WIDTH_MIN, Math.min(LAYERS_WIDTH_MAX, w));
      applyPanelWidths(null, w);
    }

    function onRightUp() {
      resizerRight.classList.remove("resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onRightMove);
      document.removeEventListener("mouseup", onRightUp);
      const w = document.documentElement.style.getPropertyValue("--layers-panel-width");
      if (w) try { localStorage.setItem(LAYERS_PANEL_WIDTH_KEY, parseInt(w, 10)); } catch (err) {}
    }

    resizerRight.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      resizerRight._startX = e.clientX;
      resizerRight._startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--layers-panel-width"), 10) || 220;
      resizerRight.classList.add("resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onRightMove);
      document.addEventListener("mouseup", onRightUp);
    });
    function onResizerKeyDown(e, isLeft) {
      var step = e.shiftKey ? 20 : 10;
      var handled = true;
      var left = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--controls-width"), 10) || 260;
      var right = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--layers-panel-width"), 10) || 220;
      if (e.key === "ArrowLeft") {
        if (isLeft) left -= step;
        else right += step;
      } else if (e.key === "ArrowRight") {
        if (isLeft) left += step;
        else right -= step;
      } else {
        handled = false;
      }
      if (!handled) return;
      e.preventDefault();
      left = Math.max(CONTROLS_WIDTH_MIN, Math.min(CONTROLS_WIDTH_MAX, left));
      right = Math.max(LAYERS_WIDTH_MIN, Math.min(LAYERS_WIDTH_MAX, right));
      applyPanelWidths(left, right);
      try {
        localStorage.setItem(CONTROLS_WIDTH_KEY, String(left));
        localStorage.setItem(LAYERS_PANEL_WIDTH_KEY, String(right));
      } catch (err) {}
    }
    resizerLeft.addEventListener("keydown", function (e) { onResizerKeyDown(e, true); });
    resizerRight.addEventListener("keydown", function (e) { onResizerKeyDown(e, false); });
    updateResizerA11y();
  }

  function setupSettingsPanel() {
    /* Other settings (draft, editor options, etc.) are bound elsewhere */
  }

  function setupLeftPanelAccordion() {
    var controls = document.getElementById("controlsPanel");
    if (!controls) return;
    var panels = controls.querySelectorAll("details.control-panel");
    panels.forEach(function (details) {
      details.addEventListener("toggle", function () {
        if (!details.open) return;
        panels.forEach(function (other) {
          if (other !== details) other.removeAttribute("open");
        });
      });
    });
  }

  function setupThemeSwitch() {
    const buttons = document.querySelectorAll(".theme-select-btn");
    if (!buttons.length) return;

    function updateThemeButtons() {
      const t = getTheme();
      buttons.forEach(function (btn) {
        const active = btn.dataset.theme === t;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-checked", String(active));
      });
    }
    updateThemeButtons();

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTheme(btn.dataset.theme);
        updateThemeButtons();
      });
    });
  }

  function getStoredFontSize() {
    try {
      const v = parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
      return (!isNaN(v) && v >= 12 && v <= 24) ? v : 14;
    } catch (e) { return 14; }
  }
  function applyFontSize(px) {
    document.documentElement.style.setProperty("--editor-font-size", px + "px");
    var ta = document.getElementById("editor");
    var previewEl = document.getElementById("preview");
    if (ta) ta.style.fontSize = px + "px";
    if (previewEl) previewEl.style.fontSize = px + "px";
  }
  function getReducedMotion() {
    try { return localStorage.getItem(REDUCED_MOTION_KEY) === "true"; } catch (e) { return false; }
  }
  function setReducedMotion(on) {
    try { localStorage.setItem(REDUCED_MOTION_KEY, on ? "true" : "false"); } catch (e) {}
    document.body.classList.toggle("reduced-motion", on);
  }
  function getFocusMode() {
    try { return localStorage.getItem(FOCUS_MODE_KEY) === "true"; } catch (e) { return false; }
  }
  function setFocusMode(on) {
    try { localStorage.setItem(FOCUS_MODE_KEY, on ? "true" : "false"); } catch (e) {}
    document.body.classList.toggle("focus-mode", on);
  }
  function getZenMode() {
    try { return localStorage.getItem(ZEN_MODE_KEY) === "true"; } catch (e) { return false; }
  }
  function setZenMode(on) {
    try { localStorage.setItem(ZEN_MODE_KEY, on ? "true" : "false"); } catch (e) {}
    document.body.classList.toggle("zen-mode", on);
  }
  function getPreviewLight() {
    try { return localStorage.getItem(PREVIEW_LIGHT_KEY) === "true"; } catch (e) { return false; }
  }
  function setPreviewLight(on) {
    try { localStorage.setItem(PREVIEW_LIGHT_KEY, on ? "true" : "false"); } catch (e) {}
    document.body.classList.toggle("preview-light", on);
  }
  function getScrollLock() {
    try { return localStorage.getItem(SCROLL_LOCK_KEY) !== "false"; } catch (e) { return true; }
  }
  function setScrollLock(on) {
    try { localStorage.setItem(SCROLL_LOCK_KEY, on ? "true" : "false"); } catch (e) {}
    window.__mdEditorScrollLock = on;
  }

  setTheme(getTheme());
  setupPanelResizers();
  setupSettingsPanel();
  setupLeftPanelAccordion();
  setupThemeSwitch();
  applyFontSize(getStoredFontSize());
  setReducedMotion(getReducedMotion());

  var settingFontSizeEl = document.getElementById("settingFontSize");
  if (settingFontSizeEl) {
    settingFontSizeEl.value = getStoredFontSize();
    settingFontSizeEl.addEventListener("change", function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 12 && v <= 24) {
        try { localStorage.setItem(FONT_SIZE_KEY, v); } catch (e) {}
        applyFontSize(v);
      }
    });
  }
  var settingReducedMotionEl = document.getElementById("settingReducedMotion");
  if (settingReducedMotionEl) {
    settingReducedMotionEl.checked = getReducedMotion();
    settingReducedMotionEl.addEventListener("change", function () { setReducedMotion(this.checked); });
  }
  var settingFocusModeEl = document.getElementById("settingFocusMode");
  if (settingFocusModeEl) {
    settingFocusModeEl.checked = getFocusMode();
    settingFocusModeEl.addEventListener("change", function () { setFocusMode(this.checked); });
  }
  setFocusMode(getFocusMode());
  var settingZenModeEl = document.getElementById("settingZenMode");
  if (settingZenModeEl) {
    settingZenModeEl.checked = getZenMode();
    settingZenModeEl.addEventListener("change", function () { setZenMode(this.checked); });
  }
  setZenMode(getZenMode());
  setPreviewLight(getPreviewLight());
  window.__mdEditorScrollLock = getScrollLock();
  var settingPreviewLightEl = document.getElementById("settingPreviewLight");
  if (settingPreviewLightEl) {
    settingPreviewLightEl.checked = getPreviewLight();
    settingPreviewLightEl.addEventListener("change", function () { setPreviewLight(this.checked); });
  }
  var settingScrollLockEl = document.getElementById("settingScrollLock");
  if (settingScrollLockEl) {
    settingScrollLockEl.checked = getScrollLock();
    settingScrollLockEl.addEventListener("change", function () { setScrollLock(this.checked); });
  }
  var settingWordGoalEl = document.getElementById("settingWordGoal");
  if (settingWordGoalEl) {
    try { var g = localStorage.getItem(WORD_GOAL_KEY); if (g) settingWordGoalEl.value = g; } catch (e) {}
    settingWordGoalEl.addEventListener("change", function () {
      try { localStorage.setItem(WORD_GOAL_KEY, this.value); } catch (e) {}
      updateStatus();
    });
  }
  var openInNewTabLink = document.getElementById("openInNewTabLink");
  if (openInNewTabLink) openInNewTabLink.href = window.location.href;

  setupWelcomeModal();

  function getFocusables(container) {
    if (!container) return [];
    var sel = "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";
    return Array.prototype.slice.call(container.querySelectorAll(sel)).filter(function (el) {
      return !el.hasAttribute("disabled") && el.offsetParent !== null;
    });
  }

  function trapFocus(container, e) {
    if (e.key !== "Tab" || !container || !container.contains(document.activeElement)) return;
    var focusables = getFocusables(container);
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function setupWelcomeModal() {
    const WELCOME_DISMISSED_KEY = "mdEditorWelcomeDismissed";
    const modal = document.getElementById("welcomeModal");
    const btn = document.getElementById("welcomeModalBtn");
    const checkbox = document.getElementById("welcomeModalDontShowAgain");
    const backdrop = modal && modal.querySelector(".welcome-modal-backdrop");
    if (!modal || !btn) return;

    try {
      if (localStorage.getItem(WELCOME_DISMISSED_KEY) === "true") {
        modal.classList.add("hidden");
        return;
      }
    } catch (e) {}

    setTimeout(function () { if (!modal.classList.contains("hidden")) btn.focus(); }, 0);

    function closeWelcome() {
      modal.classList.add("hidden");
      try {
        if (checkbox && checkbox.checked) localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
      } catch (e) {}
    }

    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeWelcome(); e.preventDefault(); return; }
      trapFocus(modal, e);
    });
    btn.addEventListener("click", closeWelcome);
    if (backdrop) backdrop.addEventListener("click", closeWelcome);
  }

  function setupMobilePanels() {
    var btnToggleFile = document.getElementById("btnToggleFile");
    var btnToggleOutline = document.getElementById("btnToggleOutline");
    var panelBackdrop = document.getElementById("panelBackdrop");
    var btnCloseFile = document.getElementById("btnCloseFilePanel");
    var btnCloseOutline = document.getElementById("btnCloseOutlinePanel");

    function syncMobilePanelA11y() {
      var fileOpen = document.body.classList.contains("panel-file-open");
      var outlineOpen = document.body.classList.contains("panel-outline-open");
      if (btnToggleFile) btnToggleFile.setAttribute("aria-expanded", fileOpen ? "true" : "false");
      if (btnToggleOutline) btnToggleOutline.setAttribute("aria-expanded", outlineOpen ? "true" : "false");
    }
    function closeFilePanel() {
      document.body.classList.remove("panel-file-open");
      syncMobilePanelA11y();
      if (btnToggleFile) btnToggleFile.focus();
    }
    function closeOutlinePanel() {
      document.body.classList.remove("panel-outline-open");
      syncMobilePanelA11y();
      if (btnToggleOutline) btnToggleOutline.focus();
    }
    function closeBothPanels() {
      document.body.classList.remove("panel-file-open", "panel-outline-open");
      syncMobilePanelA11y();
    }

    if (btnToggleFile) {
      btnToggleFile.addEventListener("click", function () {
        document.body.classList.toggle("panel-file-open");
        if (document.body.classList.contains("panel-file-open")) document.body.classList.remove("panel-outline-open");
        syncMobilePanelA11y();
      });
    }
    if (btnToggleOutline) {
      btnToggleOutline.addEventListener("click", function () {
        document.body.classList.toggle("panel-outline-open");
        if (document.body.classList.contains("panel-outline-open")) document.body.classList.remove("panel-file-open");
        syncMobilePanelA11y();
      });
    }
    if (panelBackdrop) panelBackdrop.addEventListener("click", closeBothPanels);
    if (btnCloseFile) btnCloseFile.addEventListener("click", closeFilePanel);
    if (btnCloseOutline) btnCloseOutline.addEventListener("click", closeOutlinePanel);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (document.body.classList.contains("panel-file-open") || document.body.classList.contains("panel-outline-open")) {
        closeBothPanels();
        e.preventDefault();
      }
    });
    syncMobilePanelA11y();
  }
  setupMobilePanels();

  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const outline = document.getElementById("outline");
  const openFile = document.getElementById("openFile");
  const saveFilename = document.getElementById("saveFilename");
  const editorSplit = document.getElementById("editorSplit");
  const editorStatus = document.getElementById("editorStatus");
  const previewWrap = document.querySelector(".preview-content-wrap");
  const appToast = document.getElementById("appToast");
  var statusTimer = null;
  var renderTimer = null;

  // Configure marked for safe output
  if (typeof marked !== "undefined") {
    marked.setOptions({ gfm: true, breaks: true });
  }

  function showStatus(message, kind) {
    if (editorStatus) editorStatus.textContent = message;
    if (!appToast) return;
    appToast.textContent = message;
    appToast.classList.remove("hidden", "is-error", "is-success");
    if (kind === "error") appToast.classList.add("is-error");
    if (kind === "success") appToast.classList.add("is-success");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      appToast.classList.add("hidden");
      updateStatus();
    }, 2000);
  }
  function showError(message) { showStatus(message, "error"); }

  function markdownToHtml(markdownText) {
    if (window.MarkdownRendering && typeof window.MarkdownRendering.markdownToHtml === "function") {
      return window.MarkdownRendering.markdownToHtml(markdownText);
    }
    var parsed = typeof marked !== "undefined" ? marked.parse(markdownText || "") : escapeHtml(markdownText || "").replace(/\n/g, "<br>");
    if (typeof DOMPurify !== "undefined") {
      return DOMPurify.sanitize(parsed, { USE_PROFILES: { html: true } });
    }
    return parsed;
  }

  function countWords(text) {
    const t = text.trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  function getWordGoal() {
    try {
      const v = parseInt(document.getElementById("settingWordGoal").value, 10);
      return (!isNaN(v) && v > 0) ? v : 0;
    } catch (e) { return 0; }
  }

  function updateStatus() {
    if (!editorStatus) return;
    const text = editor.value;
    const lines = text ? text.split(/\n/).length : 0;
    const words = countWords(text);
    const chars = text ? text.length : 0;
    const goal = getWordGoal();
    let status = words + " word" + (words !== 1 ? "s" : "") + " · " + lines + " line" + (lines !== 1 ? "s" : "") + " · " + chars + " char" + (chars !== 1 ? "s" : "");
    if (words > 0) status += " · ~" + Math.max(1, Math.round(words / 200)) + " min read";
    if (document.activeElement === editor) {
      var pos = editor.selectionStart || 0;
      var before = text.slice(0, pos);
      status += " · Ln " + before.split("\n").length + ", Col " + (pos - before.lastIndexOf("\n"));
      if (editor.selectionStart !== editor.selectionEnd) {
        var selWords = countWords(text.slice(editor.selectionStart, editor.selectionEnd));
        status += " · " + selWords + " selected";
      }
    }
    if (goal > 0) status += " · " + words + " / " + goal;
    editorStatus.textContent = status;
    var goalWrap = document.getElementById("editorStatusGoalWrap");
    var goalBar = document.getElementById("editorStatusGoalBar");
    if (goalWrap && goalBar) {
      if (goal > 0) {
        goalWrap.classList.remove("hidden");
        goalWrap.setAttribute("aria-hidden", "false");
        var pct = Math.min(100, Math.round((words / goal) * 100));
        goalBar.style.width = pct + "%";
        goalBar.setAttribute("aria-valuenow", pct);
      } else {
        goalWrap.classList.add("hidden");
        goalWrap.setAttribute("aria-hidden", "true");
        goalBar.style.width = "0%";
      }
    }
  }

  var outlineItems = []; // { index, line, outlineIndex } for scroll sync
  var outlineIgnoreScrollUntil = 0; // skip scroll→outline sync for a moment after outline click

  function renderPreview() {
    const raw = editor.value.trim();
    if (!raw) {
      preview.innerHTML = '<span class="preview-empty">Preview will appear here.</span>';
      outlineItems = [];
      updateOutline();
      updateStatus();
      scheduleOverlay();
      return;
    }
    try {
      preview.innerHTML = markdownToHtml(raw);
      // Add outline-0, outline-1, ... to headings for scroll-to and scroll sync
      var headings = preview.querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (var i = 0; i < headings.length; i++) headings[i].id = "outline-" + i;
      highlightCodeIn(preview);
      renderMermaidBlocks(preview);
      renderMathIn(preview);
      setupTaskCheckboxes(preview);
      setupCodeCopyButtons(preview);
    } catch (e) {
      preview.innerHTML = '<span class="preview-empty">Parse error.</span>';
      outlineItems = [];
    }
    updateOutline();
    updateStatus();
    scheduleOverlay();
  }
  function scheduleRenderPreview() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, PREVIEW_DEBOUNCE_MS);
  }

  // ----- Code highlighting (highlight.js) in preview and exports -----
  function highlightCodeIn(container) {
    if (!window.hljs || !container) return;
    container.querySelectorAll("pre code").forEach(function (block) {
      if (block.classList.contains("language-mermaid")) return;
      try { hljs.highlightElement(block); } catch (e) {}
    });
  }

  function highlightHtmlString(html) {
    if (!window.hljs) return html;
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    highlightCodeIn(tmp);
    return tmp.innerHTML;
  }

  // Token colors for exported HTML (dark pre background)
  var EXPORT_HLJS_CSS = "pre code .hljs-keyword,pre code .hljs-selector-tag,pre code .hljs-meta{color:#c678dd}pre code .hljs-string,pre code .hljs-addition{color:#98c379}pre code .hljs-number,pre code .hljs-literal{color:#d19a66}pre code .hljs-comment,pre code .hljs-quote{color:#7f848e;font-style:italic}pre code .hljs-title,pre code .hljs-name,pre code .hljs-section{color:#61afef}pre code .hljs-attr,pre code .hljs-attribute,pre code .hljs-variable,pre code .hljs-deletion{color:#e06c75}pre code .hljs-built_in,pre code .hljs-type{color:#56b6c2}";

  // ----- Mermaid diagrams: ```mermaid fences render as SVG. The library is
  // large, so it is loaded lazily the first time a diagram appears. -----
  var mermaidLoading = null;
  var mermaidSeq = 0;
  var mermaidSvgCache = {};
  var mermaidCacheCount = 0;

  function loadMermaid() {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (mermaidLoading) return mermaidLoading;
    mermaidLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "vendor/mermaid.min.js";
      s.onload = function () { resolve(window.mermaid); };
      s.onerror = function () { mermaidLoading = null; reject(new Error("mermaid failed to load")); };
      document.head.appendChild(s);
    });
    return mermaidLoading;
  }

  function currentMermaidTheme() {
    if (document.body.classList.contains("preview-light")) return "default";
    if (document.body.classList.contains("theme-light")) return "default";
    return "dark";
  }

  function renderMermaidBlocks(container) {
    var blocks = container.querySelectorAll("pre code.language-mermaid");
    if (!blocks.length) return;
    var theme = currentMermaidTheme();
    var jobs = [];
    blocks.forEach(function (block) {
      var src = block.textContent;
      var holder = document.createElement("div");
      holder.className = "mermaid-diagram";
      block.parentElement.replaceWith(holder);
      jobs.push({ src: src, holder: holder });
    });
    loadMermaid().then(function (mermaid) {
      mermaid.initialize({ startOnLoad: false, theme: theme, securityLevel: "strict" });
      jobs.forEach(function (job) {
        var key = theme + "|" + job.src;
        if (mermaidSvgCache[key]) {
          job.holder.innerHTML = mermaidSvgCache[key];
          return;
        }
        mermaid.render("mermaid-d" + (++mermaidSeq), job.src).then(function (out) {
          if (mermaidCacheCount > 40) { mermaidSvgCache = {}; mermaidCacheCount = 0; }
          mermaidSvgCache[key] = out.svg;
          mermaidCacheCount++;
          job.holder.innerHTML = out.svg;
        }).catch(function (err) {
          job.holder.className = "mermaid-diagram mermaid-error";
          job.holder.textContent = "Mermaid: " + (err && err.message ? String(err.message).split("\n")[0] : "invalid diagram");
        });
      });
    }).catch(function () {
      jobs.forEach(function (job) {
        job.holder.className = "mermaid-diagram mermaid-error";
        job.holder.textContent = "Mermaid library could not be loaded.";
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function updateOutline() {
    const text = editor.value;
    const headingRe = /^(#{1,6})\s+(.+)$/gm;
    const items = [];
    var m;
    while ((m = headingRe.exec(text)) !== null) {
      var line = text.slice(0, m.index).split("\n").length - 1;
      if (line < 0) line = 0;
      items.push({ level: m[1].length, text: m[2].trim(), index: m.index, line: line });
    }
    outlineItems = items;
    outline.innerHTML = "";
    if (items.length === 0) {
      outline.innerHTML = '<li class="outline-empty">No headings yet.</li>';
      return;
    }
    items.forEach(function (item, outlineIndex) {
      var li = document.createElement("li");
      li.className = "outline-h" + item.level;
      li.dataset.outlineIndex = String(outlineIndex);
      li.draggable = true;
      li.title = "Drag to move this section";
      var button = document.createElement("button");
      button.type = "button";
      button.className = "outline-item-btn";
      button.textContent = item.text;
      button.dataset.index = String(item.index);
      button.dataset.outlineIndex = String(outlineIndex);
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        scrollSyncLock = true;
        outlineIgnoreScrollUntil = Date.now() + 600;
        var isEditorVisible = !editorSplit.classList.contains("preview-only");
        if (isEditorVisible) {
          editor.focus();
          editor.setSelectionRange(item.index, item.index);
          var style = getComputedStyle(editor);
          var lineHeight = parseInt(style.lineHeight, 10);
          if (isNaN(lineHeight) || lineHeight <= 0) lineHeight = Math.round(parseInt(style.fontSize, 10) * 1.5) || 20;
          editor.scrollTop = Math.max(0, item.line * lineHeight - 80);
        }
        var headingEl = preview.querySelector("#outline-" + outlineIndex);
        if (headingEl) {
          headingEl.scrollIntoView({ block: "start", behavior: "smooth", inline: "nearest" });
        }
        setOutlineCurrent(outlineIndex);
        setTimeout(function () { scrollSyncLock = false; }, 150);
      });
      li.appendChild(button);
      outline.appendChild(li);
    });
  }

  function setOutlineCurrent(outlineIndex) {
    var list = outline.querySelectorAll("li[data-outline-index]");
    for (var i = 0; i < list.length; i++) {
      list[i].classList.toggle("current", parseInt(list[i].dataset.outlineIndex, 10) === outlineIndex);
    }
    var currentLi = outline.querySelector('li[data-outline-index="' + outlineIndex + '"]');
    if (currentLi) currentLi.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function syncOutlineFromEditorScroll() {
    if (outlineItems.length === 0) return;
    if (Date.now() < outlineIgnoreScrollUntil) return;
    var style = getComputedStyle(editor);
    var lineHeight = parseInt(style.lineHeight, 10);
    if (isNaN(lineHeight) || lineHeight <= 0) lineHeight = Math.round(parseInt(style.fontSize, 10) * 1.5) || 20;
    var lineAtTop = editor.scrollTop / lineHeight;
    var current = 0;
    for (var i = 0; i < outlineItems.length; i++) {
      if (outlineItems[i].line <= lineAtTop) current = i;
    }
    setOutlineCurrent(current);
  }

  function syncOutlineFromPreviewScroll() {
    if (outlineItems.length === 0) return;
    if (Date.now() < outlineIgnoreScrollUntil) return;
    if (!previewWrap) return;
    var wrap = previewWrap;
    var wrapRect = wrap.getBoundingClientRect();
    var visibleTop = wrapRect.top + 80;
    var headings = preview.querySelectorAll("[id^='outline-']");
    var current = 0;
    for (var i = 0; i < headings.length; i++) {
      var r = headings[i].getBoundingClientRect();
      if (r.top <= visibleTop) current = i;
    }
    setOutlineCurrent(current);
  }

  function throttle(fn, ms) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn();
      } else if (!timer) {
        timer = setTimeout(function () { timer = null; last = Date.now(); fn(); }, ms);
      }
    };
  }

  var onEditorScroll = throttle(syncOutlineFromEditorScroll, 100);
  var onPreviewScroll = throttle(syncOutlineFromPreviewScroll, 100);

  var scrollSyncLock = false;
  function isSplitView() {
    return editorSplit && !editorSplit.classList.contains("editor-only") && !editorSplit.classList.contains("preview-only");
  }
  function syncPreviewToEditor() {
    if (scrollSyncLock || !isSplitView() || !window.__mdEditorScrollLock) return;
    scrollSyncLock = true;
    var wrap = previewWrap;
    if (wrap) {
      var editorMax = editor.scrollHeight - editor.clientHeight;
      var wrapMax = wrap.scrollHeight - wrap.clientHeight;
      if (editorMax > 0 && wrapMax > 0) {
        var ratio = editor.scrollTop / editorMax;
        wrap.scrollTop = ratio * wrapMax;
      }
    }
    setTimeout(function () { scrollSyncLock = false; }, 0);
  }
  function syncEditorToPreview() {
    if (scrollSyncLock || !isSplitView() || !window.__mdEditorScrollLock) return;
    scrollSyncLock = true;
    var wrap = previewWrap;
    if (wrap) {
      var editorMax = editor.scrollHeight - editor.clientHeight;
      var wrapMax = wrap.scrollHeight - wrap.clientHeight;
      if (editorMax > 0 && wrapMax > 0) {
        var ratio = wrap.scrollTop / wrapMax;
        editor.scrollTop = ratio * editorMax;
      }
    }
    setTimeout(function () { scrollSyncLock = false; }, 0);
  }

  var isDirty = false;
  function getDocDisplayName() {
    return (saveFilename.value || "document").replace(/\.md$/i, "").trim() || "document";
  }
  function getExportBaseName() {
    var raw = (saveFilename.value || "document").trim() || "document";
    return raw.replace(/\.[^.]+$/, "") || "document";
  }
  function updateDocumentTitle() {
    var name = getDocDisplayName();
    document.title = (isDirty ? name + " (unsaved)" : name) + " – Markdown Editor";
  }
  function setDirty(dirty) {
    isDirty = !!dirty;
    document.body.classList.toggle("has-unsaved", isDirty);
    updateDocumentTitle();
  }
  editor.addEventListener("input", function () { scheduleRenderPreview(); updateStatus(); setDirty(true); });
  var PASTE_IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
  editor.addEventListener("paste", function (e) {
    if (e.shiftKey && e.clipboardData) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain") || "";
      var start = editor.selectionStart, end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
      editor.setSelectionRange(start + text.length, start + text.length);
      setDirty(true);
      scheduleRenderPreview();
      updateStatus();
      return;
    }
    // Pasting a URL over selected text turns the selection into a link
    var pastedText = e.clipboardData ? (e.clipboardData.getData("text/plain") || "").trim() : "";
    if (pastedText && /^https?:\/\/\S+$/.test(pastedText) && editor.selectionStart !== editor.selectionEnd) {
      var sel = editor.value.slice(editor.selectionStart, editor.selectionEnd);
      if (!/[\[\]()]/.test(sel)) {
        e.preventDefault();
        insertAtCursor("[" + sel + "](" + pastedText + ")");
        return;
      }
    }
    var files = e.clipboardData && e.clipboardData.files;
    if (files && files.length > 0) {
      var file = files[0];
      if (file.type && file.type.indexOf("image/") === 0) {
        e.preventDefault();
        insertImageFile(file);
        return;
      }
    }
    setTimeout(function () { scheduleRenderPreview(); updateStatus(); setDirty(true); }, 0);
  });
  editor.addEventListener("scroll", function () {
    onEditorScroll();
    syncPreviewToEditor();
  });

  if (previewWrap) {
    previewWrap.addEventListener("scroll", function () {
      onPreviewScroll();
      syncEditorToPreview();
    });
  }

  // ----- Linked file (File System Access API, Chromium): Ctrl+S saves
  // straight back to the opened file instead of downloading a copy. -----
  var linkedFileHandle = null;

  function updateLinkedFileHint() {
    var hint = document.getElementById("docFilenameHint");
    if (!hint) return;
    if (linkedFileHandle) {
      hint.textContent = "Linked to " + linkedFileHandle.name + " — Save writes directly to it";
      hint.classList.add("doc-filename-hint-linked");
    } else {
      hint.textContent = "Used when saving or exporting";
      hint.classList.remove("doc-filename-hint-linked");
    }
  }

  function loadOpenedText(text, displayName) {
    editor.value = text;
    saveFilename.value = displayName || "document";
    updateLinkedFileHint();
    updateDocumentTitle();
    resetUndoStack();
    setDirty(false);
    renderPreview();
    updateStatus();
    restoreDocState();
  }

  function doNew() {
    if (isDirty && !confirm("You have unsaved changes. Discard and start a new document?")) return;
    editor.value = "";
    saveFilename.value = "document";
    linkedFileHandle = null;
    updateLinkedFileHint();
    resetUndoStack();
    setDirty(false);
    renderPreview();
    updateStatus();
  }

  function doOpen() {
    if (isDirty && !confirm("You have unsaved changes. Discard and open another file?")) return;
    if (window.showOpenFilePicker) {
      window.showOpenFilePicker({
        types: [{ description: "Markdown", accept: { "text/markdown": [".md", ".markdown"], "text/plain": [".txt"] } }],
        multiple: false
      }).then(function (handles) {
        var handle = handles && handles[0];
        if (!handle) return;
        return handle.getFile().then(function (file) {
          return file.text();
        }).then(function (text) {
          linkedFileHandle = handle;
          loadOpenedText(text, handle.name.replace(/\.(md|markdown|txt)$/i, "") || "document");
        });
      }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        openFile.click();
      });
      return;
    }
    openFile.click();
  }

  function downloadMarkdown() {
    const name = (saveFilename.value || "document").replace(/\.md$/i, "") + ".md";
    const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    setDirty(false);
  }

  function doSave() {
    if (!linkedFileHandle) {
      downloadMarkdown();
      return;
    }
    linkedFileHandle.queryPermission({ mode: "readwrite" }).then(function (p) {
      if (p === "granted") return "granted";
      return linkedFileHandle.requestPermission({ mode: "readwrite" });
    }).then(function (p) {
      if (p !== "granted") throw new Error("denied");
      return linkedFileHandle.createWritable();
    }).then(function (writable) {
      return writable.write(editor.value).then(function () { return writable.close(); });
    }).then(function () {
      setDirty(false);
      showStatus("Saved to " + linkedFileHandle.name, "success");
    }).catch(function () {
      showError("Could not save to the linked file — downloading a copy instead.");
      downloadMarkdown();
    });
  }

  // File: New
  document.getElementById("btnNew").addEventListener("click", doNew);

  // File: Open (file picker when available, hidden input as fallback)
  var btnOpen = document.getElementById("btnOpen");
  if (btnOpen) btnOpen.addEventListener("click", doOpen);
  openFile.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      linkedFileHandle = null;
      loadOpenedText(reader.result, file.name.replace(/\.(md|markdown)$/i, "") || "document");
    };
    reader.onerror = function () {
      showError("Could not read selected file.");
    };
    reader.readAsText(file);
    openFile.value = "";
  });
  if (saveFilename) {
    saveFilename.addEventListener("input", updateDocumentTitle);
    saveFilename.addEventListener("change", updateDocumentTitle);
  }

  // File: Save
  document.getElementById("btnSave").addEventListener("click", doSave);

  // Export as HTML
  document.getElementById("btnExportHtml").addEventListener("click", function () {
    var baseName = getExportBaseName();
    const html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><title>" + escapeHtml(baseName) + "</title>\n<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:20px;line-height:1.6;color:#333}code{background:#f0f0f0;padding:2px 6px;border-radius:4px}pre{background:#1e1e1e;color:#e0e0e0;padding:12px;border-radius:4px;overflow-x:auto}pre code{background:none;padding:0}a{color:#0d7acc}" + EXPORT_HLJS_CSS + "</style>\n</head>\n<body>\n" + highlightHtmlString(markdownToHtml(editor.value)) + "\n</body>\n</html>";
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = getExportBaseName() + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Export as PDF: open preview modal, then save from visible content
  var pdfPreviewModal = document.getElementById("pdfPreviewModal");
  var pdfPreviewContent = document.getElementById("pdfPreviewContent");
  var pdfPreviewFilename = document.getElementById("pdfPreviewFilename");
  var pdfPreviewSaveBtn = document.getElementById("pdfPreviewSave");
  var pdfPreviewCancelBtn = document.getElementById("pdfPreviewCancel");
  var pdfPreviewBackdrop = pdfPreviewModal && pdfPreviewModal.querySelector(".pdf-preview-modal-backdrop");

  var btnExportPdfEl = document.getElementById("btnExportPdf");
  btnExportPdfEl.addEventListener("click", function () {
    if (typeof html2pdf === "undefined") { showError("PDF export library not loaded."); return; }
    var contentHtml = markdownToHtml(editor.value);
    if (!contentHtml || contentHtml.trim() === "") {
      contentHtml = "<p>No content to export.</p>";
    }
    if (pdfPreviewContent) {
      pdfPreviewContent.innerHTML = contentHtml;
      highlightCodeIn(pdfPreviewContent);
      renderMathIn(pdfPreviewContent);
    }
    if (pdfPreviewFilename) pdfPreviewFilename.value = getExportBaseName();
    if (pdfPreviewModal) pdfPreviewModal.classList.remove("hidden");
    setTimeout(function () { if (pdfPreviewFilename) pdfPreviewFilename.focus(); }, 0);
  });

  function closePdfPreviewModal() {
    if (pdfPreviewModal) pdfPreviewModal.classList.add("hidden");
    if (btnExportPdfEl) btnExportPdfEl.focus();
  }

  if (pdfPreviewModal) {
    pdfPreviewModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePdfPreviewModal(); e.preventDefault(); return; }
      trapFocus(pdfPreviewModal, e);
    });
  }

  if (pdfPreviewSaveBtn) {
    pdfPreviewSaveBtn.addEventListener("click", function () {
      if (typeof html2pdf === "undefined") return;
      var name = (pdfPreviewFilename && pdfPreviewFilename.value ? pdfPreviewFilename.value.replace(/\.[^.]+$/, "") : getExportBaseName()) + ".pdf";
      pdfPreviewSaveBtn.disabled = true;
      html2pdf().set({
        margin: [15, 12, 15, 12],
        filename: name,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["pre", "table", "img", "h2", "h3", "blockquote"] }
      }).from(pdfPreviewContent).save().then(function () {
        pdfPreviewSaveBtn.disabled = false;
        closePdfPreviewModal();
      }).catch(function (err) {
        pdfPreviewSaveBtn.disabled = false;
        console.error(err);
        showError("PDF export failed. Try Print and Save as PDF.");
      });
    });
  }
  if (pdfPreviewCancelBtn) pdfPreviewCancelBtn.addEventListener("click", closePdfPreviewModal);
  if (pdfPreviewBackdrop) pdfPreviewBackdrop.addEventListener("click", closePdfPreviewModal);

  // Export as Word (HTML format that Word can open as .doc)
  document.getElementById("btnExportWord").addEventListener("click", function () {
    var bodyHtml = markdownToHtml(editor.value);
    bodyHtml = bodyHtml.replace(/<table>/gi, "<table border=\"1\" cellpadding=\"4\" cellspacing=\"0\">");
    var wordHtml = [
      "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:word\" xmlns=\"http://www.w3.org/TR/REC-html40\">",
      "<head><meta charset=\"UTF-8\"/>",
      "<style>",
      "body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;color:#000}",
      "h1{font-size:18pt}h2{font-size:14pt}h3{font-size:12pt}",
      "code{background:#f0f0f0;padding:1px 4px}pre{background:#f5f5f5;padding:10px;overflow-x:auto}",
      "a{color:#0563c1;text-decoration:underline}",
      "table{border-collapse:collapse;width:100%;margin:0.5em 0}",
      "table, th, td{border:1px solid #000}",
      "th, td{padding:4px 8px;text-align:left}",
      "th{font-weight:bold;background:#e8e8e8}",
      "</style></head><body>",
      bodyHtml,
      "</body></html>"
    ].join("");
    var blob = new Blob(["\ufeff" + wordHtml], { type: "application/msword;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = getExportBaseName() + ".doc";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // View mode: Edit / Split / Preview
  function setViewMode(mode) {
    editorSplit.classList.remove("editor-only", "preview-only");
    document.querySelectorAll(".editor-toolbar .view-mode-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });
    if (mode === "edit") {
      editorSplit.classList.add("editor-only");
      document.getElementById("btnEditOnly").classList.add("active");
    } else if (mode === "preview") {
      editorSplit.classList.add("preview-only");
      document.getElementById("btnPreviewOnly").classList.add("active");
    } else {
      document.getElementById("btnSplit").classList.add("active");
    }
  }

  document.getElementById("btnEditOnly").addEventListener("click", function () { setViewMode("edit"); });
  document.getElementById("btnSplit").addEventListener("click", function () { setViewMode("split"); });
  document.getElementById("btnPreviewOnly").addEventListener("click", function () { setViewMode("preview"); });

  // On small screens, split mode is hidden – switch to edit if currently split
  var splitModeMedia = window.matchMedia("(max-width: 768px)");
  function enforceViewModeOnSmallScreen() {
    if (splitModeMedia.matches && !editorSplit.classList.contains("editor-only") && !editorSplit.classList.contains("preview-only")) {
      setViewMode("edit");
    }
  }
  splitModeMedia.addEventListener("change", enforceViewModeOnSmallScreen);
  window.addEventListener("resize", enforceViewModeOnSmallScreen);
  enforceViewModeOnSmallScreen();

  // Undo / Redo (simple history stack so buttons work reliably in textarea)
  var undoStack = [];
  var redoStack = [];
  var undoStackMax = 100;
  var lastSavedValue = editor.value;
  var undoRedoInProgress = false;
  function pushUndo() {
    if (undoRedoInProgress) return;
    var v = editor.value;
    if (v === lastSavedValue) return;
    undoStack.push(lastSavedValue);
    if (undoStack.length > undoStackMax) undoStack.shift();
    lastSavedValue = v;
    redoStack = [];
  }
  editor.addEventListener("input", pushUndo);
  function triggerUndo() {
    if (undoStack.length === 0) return;
    undoRedoInProgress = true;
    redoStack.push(editor.value);
    lastSavedValue = undoStack.pop();
    editor.value = lastSavedValue;
    undoRedoInProgress = false;
    editor.focus();
    setDirty(true);
    renderPreview();
    updateStatus();
  }
  function triggerRedo() {
    if (redoStack.length === 0) return;
    undoRedoInProgress = true;
    undoStack.push(editor.value);
    lastSavedValue = redoStack.pop();
    editor.value = lastSavedValue;
    undoRedoInProgress = false;
    editor.focus();
    setDirty(true);
    renderPreview();
    updateStatus();
  }
  function resetUndoStack() {
    undoStack = [];
    redoStack = [];
    lastSavedValue = editor.value;
  }
  var btnUndo = document.getElementById("btnUndo");
  var btnRedo = document.getElementById("btnRedo");
  if (btnUndo) btnUndo.addEventListener("click", triggerUndo);
  if (btnRedo) btnRedo.addEventListener("click", triggerRedo);

  // Unsaved changes: confirm before leaving
  window.addEventListener("beforeunload", function (e) {
    if (isDirty) e.preventDefault();
  });

  // Shared formatting: wrap selection, prefix line, or insert template (used by toolbar and shortcuts)
  function applyFormatting(opts) {
    var wrap = opts.wrap, prefix = opts.prefix, insertType = opts.insertType, insertTemplate = opts.insertTemplate;
    var start = editor.selectionStart, end = editor.selectionEnd;
    var text = editor.value;
    var selected = text.slice(start, end);
    var newText, newStart, newEnd;
    if (insertType === "hr") {
      saveUndoBeforeProgrammaticChange();
      var hr = "\n\n---\n\n";
      newText = text.slice(0, start) + hr + text.slice(end);
      newStart = newEnd = start + hr.length;
    } else if (insertType === "table") {
      saveUndoBeforeProgrammaticChange();
      // Blank line before table so GFM table is recognized by marked
      var table = "\n\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n";
      newText = text.slice(0, start) + table + text.slice(end);
      newStart = newEnd = start + table.length;
    } else if (wrap) {
      if (wrap.length === 1) {
        newText = text.slice(0, start) + wrap + selected + wrap + text.slice(end);
        newStart = start + 1; newEnd = newStart + selected.length;
      } else if (wrap === "[]()" || wrap === "![]()") {
        var templ = insertTemplate || (wrap === "![]()" ? "![alt](url)" : "[selected text](url)");
        newText = text.slice(0, start) + templ + text.slice(end);
        if (wrap === "[]()") { newStart = start + 1; newEnd = start + 14; }
        else { newStart = start + 2; newEnd = start + 5; }
      } else {
        var left = wrap.slice(0, wrap.length / 2), right = wrap.slice(wrap.length / 2);
        newText = text.slice(0, start) + left + selected + right + text.slice(end);
        newStart = start + left.length; newEnd = newStart + selected.length;
      }
    } else if (prefix) {
      var lineStart = text.slice(0, start).lastIndexOf("\n") + 1;
      newText = text.slice(0, lineStart) + prefix + text.slice(lineStart);
      newStart = start + prefix.length; newEnd = end + prefix.length;
    } else return;
    editor.value = newText;
    editor.setSelectionRange(newStart, newEnd);
    editor.focus();
    setDirty(true);
    renderPreview();
    updateStatus();
  }

  function getCurrentLineRange() {
    var text = editor.value;
    var pos = editor.selectionStart;
    var lineStart = text.slice(0, pos).lastIndexOf("\n") + 1;
    var lineEnd = text.indexOf("\n", pos);
    if (lineEnd === -1) lineEnd = text.length;
    return { lineStart: lineStart, lineEnd: lineEnd, line: text.slice(lineStart, lineEnd) };
  }
  function saveUndoBeforeProgrammaticChange() {
    if (undoRedoInProgress) return;
    var v = editor.value;
    undoStack.push(v);
    if (undoStack.length > undoStackMax) undoStack.shift();
    redoStack = [];
  }
  function duplicateCurrentLine() {
    var r = getCurrentLineRange();
    if (!r.line && r.lineStart === r.lineEnd) return;
    saveUndoBeforeProgrammaticChange();
    var text = editor.value;
    var insert = "\n" + r.line;
    var newText = text.slice(0, r.lineEnd) + insert + text.slice(r.lineEnd);
    editor.value = newText;
    lastSavedValue = newText;
    editor.setSelectionRange(r.lineEnd + 1, r.lineEnd + 1);
    setDirty(true);
    renderPreview();
    updateStatus();
  }
  function deleteCurrentLine() {
    var r = getCurrentLineRange();
    var text = editor.value;
    var afterLine = r.lineEnd < text.length && text[r.lineEnd] === "\n" ? r.lineEnd + 1 : r.lineEnd;
    var newText = text.slice(0, r.lineStart) + text.slice(afterLine);
    saveUndoBeforeProgrammaticChange();
    editor.value = newText;
    lastSavedValue = newText;
    editor.setSelectionRange(r.lineStart, r.lineStart);
    setDirty(true);
    renderPreview();
    updateStatus();
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    var inFind = document.getElementById("findInput") && document.getElementById("findInput").matches(":focus");
    var inReplace = document.getElementById("replaceInput") && document.getElementById("replaceInput").matches(":focus");
    if (e.key === "Escape") {
      var cmdPaletteEl = document.getElementById("cmdPalette");
      if (cmdPaletteEl && !cmdPaletteEl.classList.contains("hidden")) {
        closePalette();
        e.preventDefault();
        return;
      }
      if (getZenMode()) {
        setZenMode(false);
        if (settingZenModeEl) settingZenModeEl.checked = false;
        e.preventDefault();
        return;
      }
      var welcomeModal = document.getElementById("welcomeModal");
      if (welcomeModal && !welcomeModal.classList.contains("hidden")) {
        welcomeModal.querySelector(".welcome-modal-btn") && welcomeModal.querySelector(".welcome-modal-btn").click();
        e.preventDefault();
        return;
      }
      var pdfModal = document.getElementById("pdfPreviewModal");
      if (pdfModal && !pdfModal.classList.contains("hidden")) {
        if (typeof closePdfPreviewModal === "function") closePdfPreviewModal();
        e.preventDefault();
        return;
      }
      if (findBar && !findBar.classList.contains("hidden")) {
        setFindPopoverOpen(false);
        editor.focus();
        e.preventDefault();
        return;
      }
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        openPalette();
        return;
      }
      // Ctrl+Alt+1..6: set heading level (Ctrl+digit alone is browser tab switching)
      if (e.altKey && e.key >= "1" && e.key <= "6" && document.activeElement === editor) {
        e.preventDefault();
        setHeadingLevel(parseInt(e.key, 10));
        return;
      }
      if (e.key === "f") {
        e.preventDefault();
        showFindBar(false);
        return;
      }
      if (e.key === "h") {
        e.preventDefault();
        showFindBar(true);
        return;
      }
      if (!inFind && !inReplace) {
        if (e.key === "s") { e.preventDefault(); doSave(); return; }
        if (e.key === "n") { e.preventDefault(); doNew(); return; }
        if (e.key === "o") { e.preventDefault(); doOpen(); return; }
        if (document.activeElement === editor) {
          if (e.key === "b") { e.preventDefault(); applyFormatting({ wrap: "**" }); return; }
          if (e.key === "i") { e.preventDefault(); applyFormatting({ wrap: "*" }); return; }
          if (e.key === "k" && !e.shiftKey) { e.preventDefault(); applyFormatting({ wrap: "[]()", insertTemplate: "[selected text](url)" }); return; }
          if (e.key === "d") { e.preventDefault(); duplicateCurrentLine(); return; }
          if (e.key === "K" && e.shiftKey) { e.preventDefault(); deleteCurrentLine(); return; }
        }
      }
      return;
    }
  });

  // ----- Find in document (Ctrl+F) and Find & Replace (Ctrl+H) – floating popover like Settings -----
  var findBar = document.getElementById("findReplaceBar");
  var findInput = document.getElementById("findInput");
  var replaceInput = document.getElementById("replaceInput");
  var findCountEl = document.getElementById("findCount");
  var findPrevBtn = document.getElementById("findPrev");
  var findNextBtn = document.getElementById("findNext");
  var findCloseBtn = document.getElementById("findClose");
  var btnReplaceOne = document.getElementById("btnReplaceOne");
  var btnReplaceAll = document.getElementById("btnReplaceAll");
  var findReplaceRowEl = document.getElementById("findReplaceRow");
  var findToggleReplaceBtn = document.getElementById("findToggleReplace");

  function setFindPopoverOpen(open, showReplace) {
    if (!findBar) return;
    findBar.classList.toggle("hidden", !open);
    if (open && findReplaceRowEl) findReplaceRowEl.classList.toggle("hidden", !showReplace);
    if (open && findToggleReplaceBtn) findToggleReplaceBtn.classList.toggle("find-widget-toggle-open", !!showReplace);
    if (open) {
      findInput.focus();
      findInput.select();
      runFind();
    }
  }

  function showFindBar(showReplace) {
    if (!findBar || !findInput) return;
    setFindPopoverOpen(true, showReplace !== false);
  }

  function runFind() {
    var needle = findInput.value;
    if (!findCountEl) return;
    if (!needle) {
      findCountEl.textContent = "";
      return;
    }
    var text = editor.value;
    var re = new RegExp(escapeRegExp(needle), "gi");
    var matches = text.match(re);
    var n = matches ? matches.length : 0;
    findCountEl.textContent = n ? n + " match" + (n !== 1 ? "es" : "") : "No matches";
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findNext(forward) {
    var needle = findInput.value;
    if (!needle) return;
    var text = editor.value;
    var start = editor.selectionStart;
    var re = new RegExp(escapeRegExp(needle), "gi");
    var match;
    if (forward) {
      re.lastIndex = start;
      match = re.exec(text);
      if (!match && start > 0) { re.lastIndex = 0; match = re.exec(text); }
    } else {
      var before = text.slice(0, start);
      var allMatches = [];
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) allMatches.push(m);
      for (var i = allMatches.length - 1; i >= 0; i--) {
        if (allMatches[i].index < start) { match = allMatches[i]; break; }
      }
      if (!match && allMatches.length) match = allMatches[allMatches.length - 1];
    }
    if (match) {
      editor.setSelectionRange(match.index, match.index + match[0].length);
      editor.focus();
    }
    runFind();
  }

  function doReplaceOne() {
    var needle = findInput.value;
    var repl = replaceInput ? replaceInput.value : "";
    if (!needle) return;
    var start = editor.selectionStart, end = editor.selectionEnd;
    var text = editor.value;
    var selected = text.slice(start, end);
    if (selected.toLowerCase() === needle.toLowerCase()) {
      editor.value = text.slice(0, start) + repl + text.slice(end);
      editor.setSelectionRange(start, start + repl.length);
      setDirty(true);
      renderPreview();
      updateStatus();
    }
    findNext(true);
  }

  function doReplaceAll() {
    var needle = findInput.value;
    var repl = replaceInput ? replaceInput.value : "";
    if (!needle) return;
    var re = new RegExp(escapeRegExp(needle), "gi");
    var newText = editor.value.replace(re, repl);
    if (newText !== editor.value) {
      editor.value = newText;
      setDirty(true);
      renderPreview();
      updateStatus();
    }
    runFind();
  }

  if (findInput) findInput.addEventListener("input", runFind);
  if (findInput) findInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); findNext(true); }
  });
  if (findPrevBtn) findPrevBtn.addEventListener("click", function () { findNext(false); });
  if (findNextBtn) findNextBtn.addEventListener("click", function () { findNext(true); });
  if (findCloseBtn) findCloseBtn.addEventListener("click", function () {
    setFindPopoverOpen(false);
    editor.focus();
  });
  var btnFindInBar = document.getElementById("btnFindInBar");
  var btnReplaceInBar = document.getElementById("btnReplaceInBar");
  if (btnFindInBar) btnFindInBar.addEventListener("click", function () { showFindBar(false); });
  if (btnReplaceInBar) btnReplaceInBar.addEventListener("click", function () { showFindBar(true); });
  if (findToggleReplaceBtn) findToggleReplaceBtn.addEventListener("click", function () {
    if (!findReplaceRowEl) return;
    var isHidden = findReplaceRowEl.classList.toggle("hidden");
    findToggleReplaceBtn.setAttribute("title", isHidden ? "Show Replace" : "Hide Replace");
    findToggleReplaceBtn.classList.toggle("find-widget-toggle-open", !isHidden);
  });
  if (btnReplaceOne) btnReplaceOne.addEventListener("click", doReplaceOne);
  if (btnReplaceAll) btnReplaceAll.addEventListener("click", doReplaceAll);

  // ----- Format bar: show only when editing (editor focused or format bar focused, editor pane visible) -----
  var editorFormatBar = document.getElementById("editorFormatBar");
  function updateFormatBarVisibility() {
    if (!editorFormatBar) return;
    var editorPaneVisible = !editorSplit.classList.contains("preview-only");
    var active = document.activeElement;
    var editorOrFormatFocused = active === editor || (editorFormatBar && editorFormatBar.contains(active));
    var visible = editorPaneVisible && editorOrFormatFocused;
    editorFormatBar.classList.toggle("visible", visible);
    editorFormatBar.setAttribute("aria-hidden", !visible);
    if (visible && typeof updateFormatBarArrows === "function") setTimeout(updateFormatBarArrows, 50);
  }
  if (editor) {
    editor.addEventListener("focus", updateFormatBarVisibility);
    editor.addEventListener("blur", updateFormatBarVisibility);
  }
  if (editorFormatBar) {
    editorFormatBar.addEventListener("focusin", updateFormatBarVisibility);
    editorFormatBar.addEventListener("focusout", updateFormatBarVisibility);
  }
  // Update when view mode changes
  document.getElementById("btnPreviewOnly").addEventListener("click", function () {
    setTimeout(updateFormatBarVisibility, 0);
  });
  document.getElementById("btnEditOnly").addEventListener("click", function () {
    setTimeout(updateFormatBarVisibility, 0);
  });
  document.getElementById("btnSplit").addEventListener("click", function () {
    setTimeout(updateFormatBarVisibility, 0);
  });
  updateFormatBarVisibility();

  // ----- Format bar carousel (small screens): prev/next scroll the track -----
  var formatBarTrack = document.getElementById("editorFormatBarTrack");
  var formatBarPrev = editorFormatBar && editorFormatBar.querySelector(".editor-format-bar-prev");
  var formatBarNext = editorFormatBar && editorFormatBar.querySelector(".editor-format-bar-next");
  function updateFormatBarArrows() {
    if (!formatBarTrack || !formatBarPrev || !formatBarNext || !editorFormatBar) return;
    var scrollLeft = formatBarTrack.scrollLeft;
    var maxScroll = formatBarTrack.scrollWidth - formatBarTrack.clientWidth;
    var hasOverflow = maxScroll > 1;
    editorFormatBar.classList.toggle("format-bar-has-overflow", hasOverflow);
    formatBarPrev.disabled = !hasOverflow || scrollLeft <= 0;
    formatBarNext.disabled = !hasOverflow || scrollLeft >= maxScroll - 1;
  }
  if (formatBarPrev) {
    formatBarPrev.addEventListener("click", function () {
      if (!formatBarTrack) return;
      formatBarTrack.scrollBy({ left: -formatBarTrack.clientWidth * 0.8, behavior: "smooth" });
    });
  }
  if (formatBarNext) {
    formatBarNext.addEventListener("click", function () {
      if (!formatBarTrack) return;
      formatBarTrack.scrollBy({ left: formatBarTrack.clientWidth * 0.8, behavior: "smooth" });
    });
  }
  if (formatBarTrack) {
    formatBarTrack.addEventListener("scroll", updateFormatBarArrows);
  }
  window.addEventListener("resize", updateFormatBarArrows);
  setTimeout(updateFormatBarArrows, 0);

  // ----- Formatting toolbar -----
  document.querySelectorAll(".fmt-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.dataset.wrap;
      var prefix = btn.dataset.prefix;
      var insertType = btn.dataset.insertType;
      if (!wrap && !prefix && !insertType) return;
      var opts = {};
      if (insertType) opts.insertType = insertType;
      if (wrap) opts.wrap = wrap;
      if (prefix) opts.prefix = prefix;
      if (wrap === "[]()") opts.insertTemplate = "[selected text](url)";
      if (wrap === "![]()") opts.insertTemplate = "![alt](url)";
      applyFormatting(opts);
    });
  });

  // Copy as HTML
  var btnCopyHtml = document.getElementById("btnCopyHtml");
  if (btnCopyHtml) btnCopyHtml.addEventListener("click", function () {
    var raw = editor.value.trim();
    var html = markdownToHtml(raw);
    if (!html) html = "";
    navigator.clipboard.writeText(html).then(function () {
      var label = btnCopyHtml && btnCopyHtml.querySelector(".doc-export-btn-text");
      if (label) { label.textContent = "Copied!"; setTimeout(function () { label.textContent = "Copy as HTML"; }, 1500); }
    }).catch(function () { showError("Copy as HTML failed."); });
  });

  // Copy as Markdown
  var btnCopyMd = document.getElementById("btnCopyMd");
  if (btnCopyMd) btnCopyMd.addEventListener("click", function () {
    var raw = editor.value;
    navigator.clipboard.writeText(raw).then(function () {
      var label = btnCopyMd && btnCopyMd.querySelector(".doc-export-btn-text");
      if (label) { label.textContent = "Copied!"; setTimeout(function () { label.textContent = "Copy as Markdown"; }, 1500); }
    }).catch(function () { showError("Copy as Markdown failed."); });
  });

  // Print
  var btnPrint = document.getElementById("btnPrint");
  if (btnPrint) btnPrint.addEventListener("click", function () {
    var w = window.open("", "_blank");
    if (!w) {
      showError("Popup blocked. Allow popups to print.");
      return;
    }
    var raw = editor.value.trim();
    var html = markdownToHtml(raw);
    w.document.write("<!DOCTYPE html><html><head><title>Print</title><style>body{font-family:Segoe UI,sans-serif;max-width:720px;margin:20px auto;line-height:1.6;color:#333}code{background:#f0f0f0;padding:2px 6px}pre{background:#2b2b2b;color:#e0e0e0;padding:12px;overflow-x:auto}a{color:#0d7acc}</style></head><body>" + html + "</body></html>");
    w.document.close();
    w.focus();
    w.setTimeout(function () { w.print(); w.close(); }, 250);
  });

  // Back to top
  var btnBackToTop = document.getElementById("btnBackToTop");
  function updateBackToTopVisibility() {
    if (!btnBackToTop) return;
    var wrap = previewWrap;
    var editorScroll = editor.scrollTop > 80;
    var previewScroll = wrap && wrap.scrollTop > 80;
    btnBackToTop.classList.toggle("hidden", !editorScroll && !previewScroll);
  }
  if (btnBackToTop) btnBackToTop.addEventListener("click", function () {
    editor.scrollTop = 0;
    var wrap = previewWrap;
    if (wrap) wrap.scrollTop = 0;
    updateBackToTopVisibility();
  });
  editor.addEventListener("scroll", updateBackToTopVisibility);
  if (previewWrap) previewWrap.addEventListener("scroll", updateBackToTopVisibility);

  // Auto-save draft: saves editor content to localStorage 2 sec after you stop typing.
  // Enable in Settings → Draft → "Auto-save draft". On reload, "Restore previous session?" appears if a draft exists.
  function isAutoSaveDraftEnabled() {
    try {
      var v = localStorage.getItem(AUTO_SAVE_DRAFT_KEY);
      return v === "true" || v === null; // default ON so it works without opening Settings
    } catch (e) { return true; }
  }
  function setAutoSaveDraftEnabled(enabled) {
    try { localStorage.setItem(AUTO_SAVE_DRAFT_KEY, enabled ? "true" : "false"); } catch (e) {}
  }
  function saveDraft() {
    if (!isAutoSaveDraftEnabled()) return;
    try {
      localStorage.setItem(DRAFT_KEY, editor.value);
      var historyRaw = localStorage.getItem(DRAFT_HISTORY_KEY);
      var history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({ ts: Date.now(), value: editor.value });
      localStorage.setItem(DRAFT_HISTORY_KEY, JSON.stringify(history.slice(0, DRAFT_HISTORY_LIMIT)));
    } catch (e) {}
    showDraftSavedFeedback();
    renderDraftHistory();
  }
  function loadDraft() {
    try {
      const s = localStorage.getItem(DRAFT_KEY);
      if (s != null && s !== "") { editor.value = s; return true; }
    } catch (e) {}
    return false;
  }

  var draftSavedFeedbackTimer = null;
  function showDraftSavedFeedback() {
    if (!editorStatus) return;
    var original = editorStatus.textContent;
    editorStatus.textContent = "Draft saved";
    editorStatus.classList.add("draft-saved");
    clearTimeout(draftSavedFeedbackTimer);
    draftSavedFeedbackTimer = setTimeout(function () {
      editorStatus.classList.remove("draft-saved");
      updateStatus();
    }, 2000);
  }

  var draftTimer = null;
  editor.addEventListener("input", function () {
    if (!isAutoSaveDraftEnabled()) return;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, DRAFT_SAVE_INTERVAL_MS);
  });

  var autoSaveCheckbox = document.getElementById("settingAutoSaveDraft");
  if (autoSaveCheckbox) {
    autoSaveCheckbox.checked = isAutoSaveDraftEnabled();
    autoSaveCheckbox.addEventListener("change", function () {
      setAutoSaveDraftEnabled(autoSaveCheckbox.checked);
      if (autoSaveCheckbox.checked) saveDraft();
    });
  }

  // Optional "Restore draft?" banner when draft exists and editor is empty
  var restoreDraftBanner = document.getElementById("restoreDraftBanner");
  var restoreDraftYes = document.getElementById("restoreDraftYes");
  var restoreDraftNo = document.getElementById("restoreDraftNo");
  try {
    var hasDraft = localStorage.getItem(DRAFT_KEY);
    if (hasDraft != null && hasDraft !== "" && (!editor.value || !editor.value.trim())) {
      if (restoreDraftBanner) restoreDraftBanner.classList.remove("hidden");
    }
  } catch (e) {}
  if (restoreDraftYes) restoreDraftYes.addEventListener("click", function () {
    loadDraft();
    resetUndoStack();
    if (restoreDraftBanner) restoreDraftBanner.classList.add("hidden");
    renderPreview();
    updateStatus();
  });
  if (restoreDraftNo) restoreDraftNo.addEventListener("click", function () {
    try {
      var historyRaw = localStorage.getItem(DRAFT_HISTORY_KEY);
      var history = historyRaw ? JSON.parse(historyRaw) : [];
      if (history.length > 1) localStorage.setItem(DRAFT_KEY, history[1].value || "");
      else localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    if (restoreDraftBanner) restoreDraftBanner.classList.add("hidden");
  });

  // Drag & drop file
  var editorWrapper = document.querySelector(".editor-wrapper");
  if (editorWrapper) {
    editorWrapper.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      editorWrapper.classList.add("drop-over");
    });
    editorWrapper.addEventListener("dragleave", function () {
      editorWrapper.classList.remove("drop-over");
    });
    editorWrapper.addEventListener("drop", function (e) {
      e.preventDefault();
      editorWrapper.classList.remove("drop-over");
      var file = e.dataTransfer.files[0];
      if (file && file.type && file.type.indexOf("image/") === 0) {
        insertImageFile(file);
        return;
      }
      if (!file || (!/\.(md|markdown)$/i.test(file.name) && !file.type.match(/^text\//))) return;
      if (isDirty && !confirm("Replace current document with the dropped file? Unsaved changes will be lost.")) return;
      var name = file.name.replace(/\.(md|markdown)$/i, "");
      saveFilename.value = name || "document";
      updateDocumentTitle();
      var reader = new FileReader();
      reader.onload = function () {
        editor.value = reader.result;
        resetUndoStack();
        setDirty(false);
        renderPreview();
        updateStatus();
      };
      reader.onerror = function () {
        showError("Could not read dropped file.");
      };
      reader.readAsText(file);
    });
  }

  // ----- Shared programmatic insertion (keeps the custom undo stack intact) -----
  function insertAtCursor(str) {
    saveUndoBeforeProgrammaticChange();
    var start = editor.selectionStart, end = editor.selectionEnd;
    var text = editor.value;
    editor.value = text.slice(0, start) + str + text.slice(end);
    lastSavedValue = editor.value;
    editor.setSelectionRange(start + str.length, start + str.length);
    setDirty(true);
    scheduleRenderPreview();
    updateStatus();
  }

  function insertImageFile(file) {
    if (file.size > PASTE_IMAGE_MAX_SIZE) {
      showError("Image too large (max 2 MB).");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var alt = (file.name || "image").replace(/\.[^.]+$/, "");
      insertAtCursor("![" + alt + "](" + reader.result + ")");
      editor.focus();
    };
    reader.onerror = function () { showError("Could not read image."); };
    reader.readAsDataURL(file);
  }

  // ----- Smart lists: Enter continues -, 1., - [ ]; Tab indents; Enter on an
  // empty item ends the list. Tab falls through to normal focus behavior
  // outside lists and tables. -----
  var LIST_RE = /^(\s*)([-*+]|\d+[.)])(\s+\[[ xX]\])?(\s+)(.*)$/;

  function handleListEnter() {
    if (editor.selectionStart !== editor.selectionEnd) return false;
    var r = getCurrentLineRange();
    var m = r.line.match(LIST_RE);
    if (!m) return false;
    var contentStart = r.lineStart + m[1].length + m[2].length + (m[3] || "").length + m[4].length;
    if (editor.selectionStart < contentStart) return false;
    if (!m[5].trim()) {
      // Empty item: end the list by clearing the marker
      saveUndoBeforeProgrammaticChange();
      var text = editor.value;
      editor.value = text.slice(0, r.lineStart) + text.slice(r.lineEnd);
      lastSavedValue = editor.value;
      editor.setSelectionRange(r.lineStart, r.lineStart);
      setDirty(true);
      scheduleRenderPreview();
      updateStatus();
      return true;
    }
    var marker = m[2];
    if (/^\d+[.)]$/.test(marker)) {
      marker = (parseInt(marker, 10) + 1) + marker.charAt(marker.length - 1);
    }
    insertAtCursor("\n" + m[1] + marker + (m[3] ? " [ ]" : "") + " ");
    return true;
  }

  function handleListIndent(outdent) {
    var r = getCurrentLineRange();
    if (!LIST_RE.test(r.line)) return false;
    saveUndoBeforeProgrammaticChange();
    var text = editor.value;
    var pos = editor.selectionStart;
    var newLine, delta;
    if (outdent) {
      var lead = r.line.match(/^ {1,2}/);
      if (!lead) return true; // consume Tab so focus does not jump mid-list
      newLine = r.line.slice(lead[0].length);
      delta = -lead[0].length;
    } else {
      newLine = "  " + r.line;
      delta = 2;
    }
    editor.value = text.slice(0, r.lineStart) + newLine + text.slice(r.lineEnd);
    lastSavedValue = editor.value;
    var np = Math.max(r.lineStart, pos + delta);
    editor.setSelectionRange(np, np);
    setDirty(true);
    scheduleRenderPreview();
    updateStatus();
    return true;
  }

  // ----- Tables: Tab moves between cells, plus a format action that aligns
  // every pipe in the table block around the cursor. -----
  function getTableBlockRange() {
    var text = editor.value;
    var r = getCurrentLineRange();
    if (!/^\s*\|/.test(r.line)) return null;
    var start = r.lineStart;
    while (start > 0) {
      var prevStart = text.lastIndexOf("\n", start - 2) + 1;
      var prevLine = text.slice(prevStart, start - 1);
      if (!/^\s*\|/.test(prevLine)) break;
      start = prevStart;
    }
    var end = r.lineEnd;
    while (end < text.length) {
      var nextEnd = text.indexOf("\n", end + 1);
      if (nextEnd === -1) nextEnd = text.length;
      var nextLine = text.slice(end + 1, nextEnd);
      if (!/^\s*\|/.test(nextLine)) break;
      end = nextEnd;
    }
    return { start: start, end: end };
  }

  function isTableSeparatorLine(line) {
    return /^\s*\|?[\s:\-|]+\|?\s*$/.test(line) && line.indexOf("-") !== -1;
  }

  function handleTableTab(back) {
    var block = getTableBlockRange();
    if (!block) return false;
    var text = editor.value;
    var pos = editor.selectionStart;
    var starts = [];
    var lineStart = block.start;
    while (lineStart <= block.end) {
      var lineEnd = text.indexOf("\n", lineStart);
      if (lineEnd === -1 || lineEnd > block.end) lineEnd = block.end;
      var line = text.slice(lineStart, lineEnd);
      if (!isTableSeparatorLine(line)) {
        for (var i = 0; i < line.length; i++) {
          if (line.charAt(i) !== "|") continue;
          var cs = lineStart + i + 1;
          if (text.charAt(cs) === " ") cs++;
          if (cs < lineEnd) starts.push(cs);
        }
      }
      lineStart = lineEnd + 1;
      if (lineEnd >= block.end) break;
    }
    if (!starts.length) return false;
    var target = null;
    if (back) {
      for (var j = starts.length - 1; j >= 0; j--) { if (starts[j] < pos) { target = starts[j]; break; } }
    } else {
      for (var k = 0; k < starts.length; k++) { if (starts[k] > pos) { target = starts[k]; break; } }
    }
    if (target == null) return false;
    editor.setSelectionRange(target, target);
    updateStatus();
    return true;
  }

  function formatTableAtCursor() {
    var block = getTableBlockRange();
    if (!block) { showError("Place the cursor inside a table first."); return; }
    var text = editor.value;
    var lines = text.slice(block.start, block.end).split("\n");
    var rows = lines.map(function (line) {
      return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
    });
    var isSep = lines.map(isTableSeparatorLine);
    var cols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var widths = [];
    for (var c = 0; c < cols; c++) {
      var w = 3;
      rows.forEach(function (r, ri) { if (!isSep[ri] && r[c]) w = Math.max(w, r[c].length); });
      widths.push(w);
    }
    var out = lines.map(function (line, ri) {
      var cells = [];
      for (var c2 = 0; c2 < cols; c2++) {
        var cell = rows[ri][c2] || "";
        if (isSep[ri]) {
          var left = /^:/.test(cell), right = /:$/.test(cell);
          var body = new Array(Math.max(3, widths[c2] - (left ? 1 : 0) - (right ? 1 : 0)) + 1).join("-");
          cell = (left ? ":" : "") + body + (right ? ":" : "");
          while (cell.length < widths[c2]) cell += "-";
        } else {
          while (cell.length < widths[c2]) cell += " ";
        }
        cells.push(cell);
      }
      return "| " + cells.join(" | ") + " |";
    });
    saveUndoBeforeProgrammaticChange();
    editor.value = text.slice(0, block.start) + out.join("\n") + text.slice(block.end);
    lastSavedValue = editor.value;
    editor.setSelectionRange(block.start, block.start);
    editor.focus();
    setDirty(true);
    renderPreview();
    updateStatus();
    showStatus("Table formatted", "success");
  }

  var btnFormatTable = document.getElementById("btnFormatTable");
  if (btnFormatTable) btnFormatTable.addEventListener("click", formatTableAtCursor);

  editor.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter" && !e.shiftKey) {
      if (handleListEnter()) e.preventDefault();
      return;
    }
    if (e.key === "Tab") {
      if (handleTableTab(e.shiftKey) || handleListIndent(e.shiftKey)) e.preventDefault();
    }
  });

  // ----- Document library (localStorage) -----
  var DOCS_KEY = "mdEditorDocs";

  function getLibraryDocs() {
    try { return JSON.parse(localStorage.getItem(DOCS_KEY)) || []; } catch (e) { return []; }
  }

  function setLibraryDocs(docs) {
    try { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)); return true; }
    catch (e) { showError("Could not save — browser storage is full."); return false; }
  }

  function renderLibrary() {
    var list = document.getElementById("libraryList");
    if (!list) return;
    var query = "";
    var searchEl = document.getElementById("librarySearch");
    if (searchEl) query = searchEl.value.trim().toLowerCase();
    var docs = getLibraryDocs().filter(function (d) {
      if (!query) return true;
      return d.name.toLowerCase().indexOf(query) !== -1 || d.content.toLowerCase().indexOf(query) !== -1;
    }).sort(function (a, b) { return b.updated - a.updated; });
    list.innerHTML = "";
    if (!docs.length) {
      list.innerHTML = '<li class="library-empty">' + (query ? "No documents match." : "No saved documents yet.") + "</li>";
      return;
    }
    docs.forEach(function (doc) {
      var li = document.createElement("li");
      li.className = "library-item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "library-item-btn";
      btn.title = 'Load "' + doc.name + '"';
      var nameSpan = document.createElement("span");
      nameSpan.className = "library-item-name";
      nameSpan.textContent = doc.name;
      var dateSpan = document.createElement("span");
      dateSpan.className = "library-item-date";
      dateSpan.textContent = new Date(doc.updated).toLocaleDateString() + " · " + countWords(doc.content) + " words";
      btn.appendChild(nameSpan);
      btn.appendChild(dateSpan);
      btn.addEventListener("click", function () { loadLibraryDoc(doc.id); });
      var del = document.createElement("button");
      del.type = "button";
      del.className = "library-item-delete";
      del.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">delete</span>';
      del.setAttribute("aria-label", 'Delete "' + doc.name + '" from library');
      del.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!confirm('Delete "' + doc.name + '" from the library?')) return;
        setLibraryDocs(getLibraryDocs().filter(function (d) { return d.id !== doc.id; }));
        renderLibrary();
      });
      li.appendChild(btn);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function saveToLibrary() {
    var name = getDocDisplayName();
    var docs = getLibraryDocs();
    var existing = null;
    for (var i = 0; i < docs.length; i++) { if (docs[i].name === name) { existing = docs[i]; break; } }
    if (existing) {
      if (!confirm('"' + name + '" already exists in the library. Overwrite it?')) return;
      existing.content = editor.value;
      existing.updated = Date.now();
    } else {
      docs.push({ id: "doc-" + Date.now() + "-" + Math.floor(Math.random() * 1e6), name: name, content: editor.value, updated: Date.now() });
    }
    if (setLibraryDocs(docs)) {
      renderLibrary();
      showStatus('Saved "' + name + '" to library', "success");
    }
  }

  function loadLibraryDoc(id) {
    var doc = null;
    getLibraryDocs().forEach(function (d) { if (d.id === id) doc = d; });
    if (!doc) return;
    if (isDirty && !confirm('You have unsaved changes. Load "' + doc.name + '" anyway?')) return;
    linkedFileHandle = null;
    loadOpenedText(doc.content, doc.name);
  }

  var btnLibSave = document.getElementById("btnLibSave");
  if (btnLibSave) btnLibSave.addEventListener("click", saveToLibrary);
  renderLibrary();

  // ----- Command palette (Ctrl+Shift+P) -----
  var cmdPalette = document.getElementById("cmdPalette");
  var cmdInput = document.getElementById("cmdPaletteInput");
  var cmdList = document.getElementById("cmdPaletteList");
  var cmdActions = [];
  var cmdFiltered = [];
  var cmdIndex = 0;
  var cmdReturnFocus = null;

  function applyThemeChoice(t) {
    setTheme(t);
    document.querySelectorAll(".theme-select-btn").forEach(function (btn) {
      var active = btn.dataset.theme === t;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-checked", String(active));
    });
    renderPreview();
  }

  function toggleSettingCheckbox(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.checked = !el.checked;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function buildPaletteActions() {
    return [
      { label: "New document", hint: "Ctrl+N", run: doNew },
      { label: "Open file…", hint: "Ctrl+O", run: doOpen },
      { label: "Save", hint: "Ctrl+S", run: doSave },
      { label: "Save current to library", run: saveToLibrary },
      { label: "Export as HTML", run: function () { document.getElementById("btnExportHtml").click(); } },
      { label: "Export as PDF", run: function () { document.getElementById("btnExportPdf").click(); } },
      { label: "Export as Word", run: function () { document.getElementById("btnExportWord").click(); } },
      { label: "Copy as HTML", run: function () { document.getElementById("btnCopyHtml").click(); } },
      { label: "Copy as Markdown", run: function () { document.getElementById("btnCopyMd").click(); } },
      { label: "Print", run: function () { document.getElementById("btnPrint").click(); } },
      { label: "View: edit only", run: function () { setViewMode("edit"); } },
      { label: "View: split", run: function () { setViewMode("split"); } },
      { label: "View: preview only", run: function () { setViewMode("preview"); } },
      { label: "Theme: dark", run: function () { applyThemeChoice("dark"); } },
      { label: "Theme: light", run: function () { applyThemeChoice("light"); } },
      { label: "Theme: prishtina", run: function () { applyThemeChoice("prishtina"); } },
      { label: "Toggle focus mode", run: function () { toggleSettingCheckbox("settingFocusMode"); } },
      { label: "Toggle zen mode", run: function () { toggleSettingCheckbox("settingZenMode"); } },
      { label: "Toggle preview always light", run: function () { toggleSettingCheckbox("settingPreviewLight"); } },
      { label: "Toggle markdown highlighting", run: function () { toggleSettingCheckbox("settingEditorHighlight"); } },
      { label: "Toggle scroll lock", run: function () { toggleSettingCheckbox("settingScrollLock"); } },
      { label: "Toggle auto-save draft", run: function () { toggleSettingCheckbox("settingAutoSaveDraft"); } },
      { label: "Insert table", run: function () { applyFormatting({ insertType: "table" }); } },
      { label: "Format table at cursor", run: formatTableAtCursor },
      { label: "Find", hint: "Ctrl+F", run: function () { showFindBar(false); } },
      { label: "Find and replace", hint: "Ctrl+H", run: function () { showFindBar(true); } },
      { label: "Copy share link", run: copyShareLink },
      { label: "Export library backup", run: exportLibraryBackup },
      { label: "Import library backup", run: function () { document.getElementById("libImportFile").click(); } },
      { label: "Toggle typewriter mode", run: function () { toggleSettingCheckbox("settingTypewriter"); } },
      { label: "Heading 1", hint: "Ctrl+Alt+1", run: function () { setHeadingLevel(1); } },
      { label: "Heading 2", hint: "Ctrl+Alt+2", run: function () { setHeadingLevel(2); } },
      { label: "Heading 3", hint: "Ctrl+Alt+3", run: function () { setHeadingLevel(3); } },
      { label: "Back to top", run: function () { editor.scrollTop = 0; if (previewWrap) previewWrap.scrollTop = 0; } }
    ];
  }

  function fuzzyScore(query, label) {
    query = query.toLowerCase();
    label = label.toLowerCase();
    if (!query) return 1;
    var qi = 0, score = 0, streak = 0;
    for (var i = 0; i < label.length && qi < query.length; i++) {
      if (label.charAt(i) === query.charAt(qi)) {
        qi++;
        streak++;
        score += 1 + streak + (i === 0 || label.charAt(i - 1) === " " ? 3 : 0);
      } else {
        streak = 0;
      }
    }
    return qi === query.length ? score : 0;
  }

  function openPalette() {
    if (!cmdPalette || !cmdInput) return;
    cmdReturnFocus = document.activeElement;
    cmdActions = buildPaletteActions();
    cmdPalette.classList.remove("hidden");
    cmdInput.value = "";
    filterPalette();
    cmdInput.focus();
  }

  function closePalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add("hidden");
    if (cmdReturnFocus && cmdReturnFocus.focus) cmdReturnFocus.focus();
  }

  function filterPalette() {
    var q = cmdInput.value.trim();
    cmdFiltered = cmdActions
      .map(function (a) { return { action: a, score: fuzzyScore(q, a.label) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (x) { return x.action; });
    cmdIndex = 0;
    renderPaletteList();
  }

  function renderPaletteList() {
    if (!cmdList) return;
    cmdList.innerHTML = "";
    if (!cmdFiltered.length) {
      var empty = document.createElement("li");
      empty.className = "cmd-palette-empty";
      empty.textContent = "No matching commands.";
      cmdList.appendChild(empty);
      return;
    }
    cmdFiltered.forEach(function (a, i) {
      var li = document.createElement("li");
      li.className = "cmd-palette-item" + (i === cmdIndex ? " selected" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === cmdIndex));
      var label = document.createElement("span");
      label.textContent = a.label;
      li.appendChild(label);
      if (a.hint) {
        var hint = document.createElement("span");
        hint.className = "cmd-palette-hint";
        hint.textContent = a.hint;
        li.appendChild(hint);
      }
      li.addEventListener("click", function () { runPaletteAction(a); });
      cmdList.appendChild(li);
    });
    var sel = cmdList.querySelector(".selected");
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }

  function runPaletteAction(a) {
    closePalette();
    setTimeout(function () { a.run(); }, 0);
  }

  if (cmdInput) {
    cmdInput.addEventListener("input", filterPalette);
    cmdInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { cmdIndex = Math.min(cmdFiltered.length - 1, cmdIndex + 1); renderPaletteList(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { cmdIndex = Math.max(0, cmdIndex - 1); renderPaletteList(); e.preventDefault(); }
      else if (e.key === "Enter") { if (cmdFiltered[cmdIndex]) runPaletteAction(cmdFiltered[cmdIndex]); e.preventDefault(); }
      else if (e.key === "Escape") { closePalette(); e.preventDefault(); e.stopPropagation(); }
    });
  }
  var cmdBackdrop = document.getElementById("cmdPaletteBackdrop");
  if (cmdBackdrop) cmdBackdrop.addEventListener("click", closePalette);
  var btnCmdPalette = document.getElementById("btnCmdPalette");
  if (btnCmdPalette) btnCmdPalette.addEventListener("click", openPalette);

  // ----- Editor markdown highlighting: a <pre> overlay painted behind the
  // (transparent-text) textarea. Metrics are copied from the textarea so the
  // glyphs line up; large documents fall back to plain text. -----
  var HIGHLIGHT_KEY = "mdEditorHighlight";
  var HIGHLIGHT_MAX_CHARS = 80000;
  var editorHighlight = document.getElementById("editorHighlight");
  var overlayTimer = null;

  function isHighlightEnabled() {
    try { return localStorage.getItem(HIGHLIGHT_KEY) !== "false"; } catch (e) { return true; }
  }

  function escapeForOverlay(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightInline(escaped) {
    return escaped
      .replace(/(`+)([^`]+?)\1/g, '<span class="mdh-code">$1$2$1</span>')
      .replace(/(!?\[)([^\]]*)(\]\()([^)]*)(\))/g, '<span class="mdh-marker">$1</span><span class="mdh-link">$2</span><span class="mdh-marker">$3</span><span class="mdh-url">$4</span><span class="mdh-marker">$5</span>')
      .replace(/(\*\*|__)(?=\S)([^<>]*?\S)\1/g, '<span class="mdh-bold">$1$2$1</span>')
      .replace(/~~(?=\S)([^<>~]*?\S)~~/g, '<span class="mdh-del">~~$1~~</span>')
      .replace(/(^|[^*_\w])(\*|_)(?=\S)([^<>*_]*?\S)\2(?![\w*_])/g, '$1<span class="mdh-italic">$2$3$2</span>');
  }

  function buildOverlayHtml(text, activeLine) {
    var lines = text.split("\n");
    var out = [];
    var inFence = false;
    var inFrontmatter = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var esc = escapeForOverlay(line);
      var html = null;
      // YAML frontmatter: dim the whole block at the top of the document
      if (i === 0 && /^---\s*$/.test(line)) {
        inFrontmatter = true;
        html = '<span class="mdh-fence">' + esc + "</span>";
      } else if (inFrontmatter) {
        if (/^---\s*$/.test(line)) {
          inFrontmatter = false;
          html = '<span class="mdh-fence">' + esc + "</span>";
        } else {
          html = '<span class="mdh-frontmatter">' + esc + "</span>";
        }
      } else if (/^(\s*)(```|~~~)/.test(line)) {
        inFence = !inFence;
        html = '<span class="mdh-fence">' + esc + "</span>";
      } else if (inFence) {
        html = '<span class="mdh-codeblock">' + esc + "</span>";
      } else {
        var m;
        if ((m = line.match(/^(#{1,6})(\s+)(.*)$/))) {
          html = '<span class="mdh-heading"><span class="mdh-marker">' + m[1] + "</span>" + m[2] + highlightInline(escapeForOverlay(m[3])) + "</span>";
        } else if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
          html = '<span class="mdh-hr">' + esc + "</span>";
        } else if ((m = line.match(/^(\s*>+\s?)(.*)$/))) {
          html = '<span class="mdh-quote"><span class="mdh-marker">' + escapeForOverlay(m[1]) + "</span>" + highlightInline(escapeForOverlay(m[2])) + "</span>";
        } else if ((m = line.match(LIST_RE))) {
          html = m[1] + '<span class="mdh-list-marker">' + escapeForOverlay(m[2] + (m[3] || "")) + "</span>" + m[4] + highlightInline(escapeForOverlay(m[5]));
        } else if (/^\s*\|/.test(line)) {
          html = '<span class="mdh-table">' + esc.replace(/\|/g, '<span class="mdh-marker">|</span>') + "</span>";
        } else {
          html = highlightInline(esc);
        }
      }
      if (i === activeLine) {
        html = '<span class="mdh-active">' + (html === "" ? " " : html) + "</span>";
      }
      out.push(html);
    }
    return out.join("\n") + "\n";
  }

  function syncOverlayMetrics() {
    if (!editorHighlight) return;
    var cs = getComputedStyle(editor);
    ["fontFamily", "fontSize", "lineHeight", "letterSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].forEach(function (p) {
      editorHighlight.style[p] = cs[p];
    });
  }

  function syncOverlayScroll() {
    if (!editorHighlight) return;
    editorHighlight.scrollTop = editor.scrollTop;
    editorHighlight.scrollLeft = editor.scrollLeft;
  }

  var lastActiveLine = -1;

  function currentCaretLine() {
    if (document.activeElement !== editor) return -1;
    return editor.value.slice(0, editor.selectionStart).split("\n").length - 1;
  }

  function refreshOverlay() {
    if (!editorHighlight) return;
    var enabled = isHighlightEnabled() && editor.value.length <= HIGHLIGHT_MAX_CHARS;
    document.body.classList.toggle("editor-highlight-on", enabled);
    if (!enabled) {
      editorHighlight.innerHTML = "";
      return;
    }
    syncOverlayMetrics();
    lastActiveLine = currentCaretLine();
    editorHighlight.innerHTML = buildOverlayHtml(editor.value, lastActiveLine);
    syncOverlayScroll();
  }

  function scheduleOverlay() {
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(refreshOverlay, 30);
  }

  // Re-highlight the active line when the caret moves without typing
  function maybeRefreshActiveLine() {
    if (!document.body.classList.contains("editor-highlight-on")) return;
    if (currentCaretLine() !== lastActiveLine) scheduleOverlay();
  }

  editor.addEventListener("input", scheduleOverlay);
  editor.addEventListener("scroll", syncOverlayScroll);
  editor.addEventListener("keyup", maybeRefreshActiveLine);
  editor.addEventListener("click", maybeRefreshActiveLine);
  editor.addEventListener("focus", scheduleOverlay);
  editor.addEventListener("blur", scheduleOverlay);
  window.addEventListener("resize", scheduleOverlay);

  var settingEditorHighlightEl = document.getElementById("settingEditorHighlight");
  if (settingEditorHighlightEl) {
    settingEditorHighlightEl.checked = isHighlightEnabled();
    settingEditorHighlightEl.addEventListener("change", function () {
      try { localStorage.setItem(HIGHLIGHT_KEY, this.checked ? "true" : "false"); } catch (e) {}
      refreshOverlay();
    });
  }

  // Theme, font size, and preview-light changes affect overlay metrics and
  // mermaid colors — re-render on top of their existing handlers.
  document.querySelectorAll(".theme-select-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderPreview();
      scheduleOverlay();
    });
  });
  if (settingPreviewLightEl) settingPreviewLightEl.addEventListener("change", function () { renderPreview(); });
  if (settingFontSizeEl) settingFontSizeEl.addEventListener("change", scheduleOverlay);
  if (btnUndo) btnUndo.addEventListener("click", scheduleOverlay);
  if (btnRedo) btnRedo.addEventListener("click", scheduleOverlay);

  // Cursor position / selection stats in the status bar
  editor.addEventListener("keyup", updateStatus);
  editor.addEventListener("click", updateStatus);
  editor.addEventListener("select", updateStatus);
  editor.addEventListener("focus", updateStatus);
  editor.addEventListener("blur", updateStatus);

  // ----- KaTeX math (lazy: the library + fonts load only when a document
  // actually contains $...$ / $$...$$) -----
  var katexLoading = null;

  function loadKatex() {
    if (window.katex) return Promise.resolve(window.katex);
    if (katexLoading) return katexLoading;
    katexLoading = new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "vendor/katex/katex.min.css";
      document.head.appendChild(link);
      var s = document.createElement("script");
      s.src = "vendor/katex/katex.min.js";
      s.onload = function () { resolve(window.katex); };
      s.onerror = function () { katexLoading = null; reject(new Error("katex failed to load")); };
      document.head.appendChild(s);
    });
    return katexLoading;
  }

  function renderMathIn(container) {
    var nodes = container.querySelectorAll(".math-tex");
    if (!nodes.length) return;
    loadKatex().then(function (katex) {
      nodes.forEach(function (el) {
        var tex = el.getAttribute("data-tex") || "";
        try {
          katex.render(tex, el, { displayMode: el.classList.contains("math-display"), throwOnError: false });
        } catch (e) {
          el.textContent = tex;
        }
      });
    }).catch(function () {
      nodes.forEach(function (el) { el.textContent = el.getAttribute("data-tex") || ""; });
    });
  }

  // ----- Task checkboxes in the preview toggle the source -----
  function setupTaskCheckboxes(container) {
    var boxes = container.querySelectorAll('li > input[type="checkbox"]');
    boxes.forEach(function (box, i) {
      box.disabled = false;
      box.addEventListener("change", function () { toggleTaskInSource(i, box.checked); });
    });
  }

  function toggleTaskInSource(index, checked) {
    var re = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\])/gm;
    var text = editor.value;
    var m, i = 0;
    while ((m = re.exec(text)) !== null) {
      if (i === index) {
        saveUndoBeforeProgrammaticChange();
        var pos = m.index + m[1].length;
        editor.value = text.slice(0, pos) + (checked ? "x" : " ") + text.slice(pos + 1);
        lastSavedValue = editor.value;
        setDirty(true);
        scheduleRenderPreview();
        updateStatus();
        return;
      }
      i++;
    }
  }

  // ----- Copy button + language label on preview code blocks -----
  function setupCodeCopyButtons(container) {
    if (container !== preview) return; // preview only — not exports or PDF
    container.querySelectorAll("pre").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (!code || pre.querySelector(".code-copy-btn")) return;
      var lang = (code.className.match(/language-([\w+-]+)/) || [])[1];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      var idleLabel = lang ? lang + " · copy" : "copy";
      btn.textContent = idleLabel;
      btn.setAttribute("aria-label", "Copy code block");
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          btn.textContent = "copied!";
          setTimeout(function () { btn.textContent = idleLabel; }, 1200);
        }).catch(function () { showError("Copy failed."); });
      });
      pre.appendChild(btn);
    });
  }

  // ----- Auto-pair and wrap-selection -----
  var WRAP_PAIRS = { "*": "*", "_": "_", "`": "`", "~": "~", "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
  var AUTOCLOSE_PAIRS = { "(": ")", "[": "]", "{": "}" };

  editor.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var close = WRAP_PAIRS[e.key];
    if (!close) return;
    var start = editor.selectionStart, end = editor.selectionEnd;
    if (start !== end) {
      // Wrap the selection instead of replacing it
      e.preventDefault();
      saveUndoBeforeProgrammaticChange();
      var text = editor.value;
      editor.value = text.slice(0, start) + e.key + text.slice(start, end) + close + text.slice(end);
      lastSavedValue = editor.value;
      editor.setSelectionRange(start + 1, end + 1);
      setDirty(true);
      scheduleRenderPreview();
      updateStatus();
      return;
    }
    var autoClose = AUTOCLOSE_PAIRS[e.key];
    if (autoClose) {
      var nextCh = editor.value.charAt(start);
      if (nextCh === "" || /[\s)\]}.,;:!?]/.test(nextCh)) {
        e.preventDefault();
        saveUndoBeforeProgrammaticChange();
        var t = editor.value;
        editor.value = t.slice(0, start) + e.key + autoClose + t.slice(start);
        lastSavedValue = editor.value;
        editor.setSelectionRange(start + 1, start + 1);
        setDirty(true);
        scheduleRenderPreview();
        updateStatus();
      }
    }
  });

  // ----- Move line up/down (Alt+Arrow) -----
  function moveCurrentLine(dir) {
    var r = getCurrentLineRange();
    var text = editor.value;
    var col = editor.selectionStart - r.lineStart;
    var newText, np;
    if (dir < 0) {
      if (r.lineStart === 0) return;
      var prevStart = text.lastIndexOf("\n", r.lineStart - 2) + 1;
      var prevLine = text.slice(prevStart, r.lineStart - 1);
      saveUndoBeforeProgrammaticChange();
      newText = text.slice(0, prevStart) + r.line + "\n" + prevLine + text.slice(r.lineEnd);
      np = prevStart + Math.min(col, r.line.length);
    } else {
      if (r.lineEnd >= text.length) return;
      var nextEnd = text.indexOf("\n", r.lineEnd + 1);
      if (nextEnd === -1) nextEnd = text.length;
      var nextLine = text.slice(r.lineEnd + 1, nextEnd);
      saveUndoBeforeProgrammaticChange();
      newText = text.slice(0, r.lineStart) + nextLine + "\n" + r.line + text.slice(nextEnd);
      np = r.lineStart + nextLine.length + 1 + Math.min(col, r.line.length);
    }
    editor.value = newText;
    lastSavedValue = newText;
    editor.setSelectionRange(np, np);
    setDirty(true);
    scheduleRenderPreview();
    updateStatus();
    scheduleOverlay();
  }

  editor.addEventListener("keydown", function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === "ArrowUp") { e.preventDefault(); moveCurrentLine(-1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveCurrentLine(1); }
  });

  // ----- Heading level (Ctrl+Alt+1..6); same level again removes it -----
  function setHeadingLevel(level) {
    var r = getCurrentLineRange();
    saveUndoBeforeProgrammaticChange();
    var stripped = r.line.replace(/^#{1,6}\s+/, "");
    var newLine = new RegExp("^#{" + level + "}\\s").test(r.line)
      ? stripped
      : new Array(level + 1).join("#") + " " + stripped;
    var text = editor.value;
    editor.value = text.slice(0, r.lineStart) + newLine + text.slice(r.lineEnd);
    lastSavedValue = editor.value;
    var np = r.lineStart + newLine.length;
    editor.setSelectionRange(np, np);
    editor.focus();
    setDirty(true);
    scheduleRenderPreview();
    updateStatus();
  }

  // ----- Typewriter mode: keep the caret line vertically centered -----
  var TYPEWRITER_KEY = "mdEditorTypewriter";

  function isTypewriterEnabled() {
    try { return localStorage.getItem(TYPEWRITER_KEY) === "true"; } catch (e) { return false; }
  }

  function typewriterScroll() {
    if (!isTypewriterEnabled()) return;
    var style = getComputedStyle(editor);
    var lineHeight = parseInt(style.lineHeight, 10);
    if (isNaN(lineHeight) || lineHeight <= 0) lineHeight = Math.round(parseInt(style.fontSize, 10) * 1.5) || 20;
    var line = editor.value.slice(0, editor.selectionStart).split("\n").length - 1;
    editor.scrollTop = Math.max(0, line * lineHeight - editor.clientHeight / 2 + lineHeight);
  }

  editor.addEventListener("input", typewriterScroll);

  var settingTypewriterEl = document.getElementById("settingTypewriter");
  if (settingTypewriterEl) {
    settingTypewriterEl.checked = isTypewriterEnabled();
    settingTypewriterEl.addEventListener("change", function () {
      try { localStorage.setItem(TYPEWRITER_KEY, this.checked ? "true" : "false"); } catch (e) {}
      if (this.checked) typewriterScroll();
    });
  }

  // ----- Remember cursor & scroll position per document name -----
  var DOCSTATE_KEY = "mdEditorDocState";

  function saveDocState() {
    try {
      var all = JSON.parse(localStorage.getItem(DOCSTATE_KEY)) || {};
      all[getDocDisplayName()] = { cursor: editor.selectionStart, scroll: editor.scrollTop, ts: Date.now() };
      var keys = Object.keys(all);
      if (keys.length > 30) {
        keys.sort(function (a, b) { return (all[a].ts || 0) - (all[b].ts || 0); });
        keys.slice(0, keys.length - 30).forEach(function (k) { delete all[k]; });
      }
      localStorage.setItem(DOCSTATE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function restoreDocState() {
    try {
      var all = JSON.parse(localStorage.getItem(DOCSTATE_KEY)) || {};
      var st = all[getDocDisplayName()];
      if (!st) return;
      var pos = Math.min(st.cursor || 0, editor.value.length);
      editor.setSelectionRange(pos, pos);
      editor.scrollTop = st.scroll || 0;
    } catch (e) {}
  }

  var saveDocStateThrottled = throttle(saveDocState, 1500);
  editor.addEventListener("keyup", saveDocStateThrottled);
  editor.addEventListener("scroll", saveDocStateThrottled);
  window.addEventListener("beforeunload", saveDocState);

  // ----- Library search, backup and restore -----
  var librarySearchEl = document.getElementById("librarySearch");
  if (librarySearchEl) librarySearchEl.addEventListener("input", renderLibrary);

  function exportLibraryBackup() {
    var docs = getLibraryDocs();
    if (!docs.length) { showError("The library is empty — nothing to back up."); return; }
    var payload = { app: "markdown-editor", version: 1, exportedAt: new Date().toISOString(), docs: docs };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "markdown-library-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showStatus("Backup downloaded (" + docs.length + " documents)", "success");
  }

  function importLibraryBackup(file) {
    file.text().then(function (raw) {
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.docs)) throw new Error("bad format");
      var current = getLibraryDocs();
      var byName = {};
      current.forEach(function (d) { byName[d.name] = d; });
      var added = 0, updated = 0;
      data.docs.forEach(function (d, i) {
        if (!d || typeof d.content !== "string" || !d.name) return;
        var existing = byName[d.name];
        if (existing) {
          if ((d.updated || 0) > (existing.updated || 0)) {
            existing.content = d.content;
            existing.updated = d.updated;
            updated++;
          }
        } else {
          current.push({ id: "doc-" + Date.now() + "-" + i + "-" + Math.floor(Math.random() * 1e6), name: d.name, content: d.content, updated: d.updated || Date.now() });
          added++;
        }
      });
      if (setLibraryDocs(current)) {
        renderLibrary();
        showStatus("Imported: " + added + " new, " + updated + " updated", "success");
      }
    }).catch(function () {
      showError("Not a valid library backup file.");
    });
  }

  var btnLibExport = document.getElementById("btnLibExport");
  var btnLibImport = document.getElementById("btnLibImport");
  var libImportFile = document.getElementById("libImportFile");
  if (btnLibExport) btnLibExport.addEventListener("click", exportLibraryBackup);
  if (btnLibImport && libImportFile) {
    btnLibImport.addEventListener("click", function () { libImportFile.click(); });
    libImportFile.addEventListener("change", function () {
      if (this.files[0]) importLibraryBackup(this.files[0]);
      this.value = "";
    });
  }

  // ----- Draft history: surface the snapshots that auto-save already keeps -----
  function renderDraftHistory() {
    var list = document.getElementById("draftHistoryList");
    if (!list) return;
    var history = [];
    try { history = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY)) || []; } catch (e) {}
    list.innerHTML = "";
    if (!history.length) {
      list.innerHTML = '<li class="library-empty">No snapshots yet.</li>';
      return;
    }
    history.forEach(function (snap) {
      var li = document.createElement("li");
      li.className = "library-item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "library-item-btn";
      var nameSpan = document.createElement("span");
      nameSpan.className = "library-item-name";
      nameSpan.textContent = new Date(snap.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + new Date(snap.ts).toLocaleDateString();
      var dateSpan = document.createElement("span");
      dateSpan.className = "library-item-date";
      dateSpan.textContent = countWords(snap.value || "") + " words";
      btn.appendChild(nameSpan);
      btn.appendChild(dateSpan);
      btn.title = "Restore this snapshot";
      btn.addEventListener("click", function () {
        if (isDirty && !confirm("Replace the current document with this snapshot?")) return;
        saveUndoBeforeProgrammaticChange();
        editor.value = snap.value || "";
        lastSavedValue = editor.value;
        setDirty(true);
        renderPreview();
        updateStatus();
        showStatus("Snapshot restored", "success");
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }
  renderDraftHistory();

  // ----- Share as link: the whole document, compressed into the URL hash.
  // No server involved — the link IS the document. -----
  function copyShareLink() {
    if (typeof LZString === "undefined") { showError("Share is unavailable (library missing)."); return; }
    var packed = LZString.compressToEncodedURIComponent(JSON.stringify({ n: getDocDisplayName(), c: editor.value }));
    if (packed.length > 12000) { showError("Document too large to share as a link — export a file instead."); return; }
    var url = location.origin + location.pathname + "#share=" + packed;
    navigator.clipboard.writeText(url).then(function () {
      showStatus("Share link copied to clipboard", "success");
    }).catch(function () { showError("Could not copy the link."); });
  }

  var btnShareLink = document.getElementById("btnShareLink");
  if (btnShareLink) btnShareLink.addEventListener("click", copyShareLink);

  function loadSharedFromHash() {
    if (location.hash.indexOf("#share=") !== 0 || typeof LZString === "undefined") return false;
    try {
      var payload = JSON.parse(LZString.decompressFromEncodedURIComponent(location.hash.slice(7)));
      if (!payload || typeof payload.c !== "string") return false;
      editor.value = payload.c;
      saveFilename.value = payload.n || "shared-document";
      history.replaceState(null, "", location.pathname + location.search);
      linkedFileHandle = null;
      resetUndoStack();
      setDirty(true);
      updateDocumentTitle();
      var banner = document.getElementById("restoreDraftBanner");
      if (banner) banner.classList.add("hidden");
      showStatus("Opened shared document — save to keep a copy", "success");
      return true;
    } catch (e) {
      return false;
    }
  }

  // ----- Outline: drag a heading to move its whole section -----
  function sectionRange(i) {
    var startChar = outlineItems[i].index;
    var level = outlineItems[i].level;
    var end = editor.value.length;
    for (var j = i + 1; j < outlineItems.length; j++) {
      if (outlineItems[j].level <= level) { end = outlineItems[j].index; break; }
    }
    return { start: startChar, end: end };
  }

  function moveSection(from, to) {
    if (from === to || !outlineItems[from] || !outlineItems[to]) return;
    var text = editor.value;
    var src = sectionRange(from);
    var chunk = text.slice(src.start, src.end);
    if (chunk.charAt(chunk.length - 1) !== "\n") chunk += "\n";
    var insertAt = sectionRange(to).start;
    if (insertAt >= src.start && insertAt <= src.end) return; // dropping into itself
    var rest = text.slice(0, src.start) + text.slice(src.end);
    if (insertAt > src.start) insertAt -= (src.end - src.start);
    saveUndoBeforeProgrammaticChange();
    editor.value = rest.slice(0, insertAt) + chunk + rest.slice(insertAt);
    lastSavedValue = editor.value;
    editor.setSelectionRange(insertAt, insertAt);
    setDirty(true);
    renderPreview();
    updateStatus();
    showStatus("Section moved", "success");
  }

  outline.addEventListener("dragstart", function (e) {
    var li = e.target.closest ? e.target.closest("li[data-outline-index]") : null;
    if (!li) return;
    e.dataTransfer.setData("text/plain", li.dataset.outlineIndex);
    e.dataTransfer.effectAllowed = "move";
    li.classList.add("dragging");
  });
  outline.addEventListener("dragend", function () {
    outline.querySelectorAll(".dragging, .drop-target").forEach(function (el) {
      el.classList.remove("dragging", "drop-target");
    });
  });
  outline.addEventListener("dragover", function (e) {
    var li = e.target.closest ? e.target.closest("li[data-outline-index]") : null;
    if (!li) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    outline.querySelectorAll(".drop-target").forEach(function (el) { el.classList.remove("drop-target"); });
    li.classList.add("drop-target");
  });
  outline.addEventListener("drop", function (e) {
    var li = e.target.closest ? e.target.closest("li[data-outline-index]") : null;
    if (!li) return;
    e.preventDefault();
    var from = parseInt(e.dataTransfer.getData("text/plain"), 10);
    var to = parseInt(li.dataset.outlineIndex, 10);
    if (!isNaN(from) && !isNaN(to)) moveSection(from, to);
  });

  // ----- Offline: register the service worker (works on https + localhost) -----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  updateLinkedFileHint();

  // Initial render and status
  loadSharedFromHash();
  renderPreview();
  updateStatus();
  updateDocumentTitle();
  restoreDocState();
})();
