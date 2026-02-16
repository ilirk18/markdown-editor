(function () {
  "use strict";

  const THEME_KEY = "ilirTheme";
  const CONTROLS_WIDTH_KEY = "mdEditorControlsWidth";
  const LAYERS_PANEL_WIDTH_KEY = "mdEditorLayersPanelWidth";
  const DRAFT_KEY = "mdEditorDraft";
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

  function getTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return (v === "light" || v === "dark") ? v : "dark";
    } catch (e) {
      return "dark";
    }
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    document.body.classList.add("theme-switching");
    document.body.classList.toggle("theme-light", theme === "light");
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
    const themeSwitch = document.getElementById("themeSwitch");
    if (!themeSwitch) return;

    function updateThemeSwitch() {
      const t = getTheme();
      const isLight = t === "light";
      themeSwitch.setAttribute("aria-checked", isLight);
      themeSwitch.setAttribute("aria-label", isLight ? "Use dark theme" : "Use light theme");
    }
    updateThemeSwitch();

    themeSwitch.addEventListener("click", function () {
      const next = getTheme() === "light" ? "dark" : "light";
      setTheme(next);
      updateThemeSwitch();
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

    function closeFilePanel() { document.body.classList.remove("panel-file-open"); }
    function closeOutlinePanel() { document.body.classList.remove("panel-outline-open"); }
    function closeBothPanels() {
      document.body.classList.remove("panel-file-open", "panel-outline-open");
    }

    if (btnToggleFile) {
      btnToggleFile.addEventListener("click", function () {
        document.body.classList.toggle("panel-file-open");
        if (document.body.classList.contains("panel-file-open")) document.body.classList.remove("panel-outline-open");
      });
    }
    if (btnToggleOutline) {
      btnToggleOutline.addEventListener("click", function () {
        document.body.classList.toggle("panel-outline-open");
        if (document.body.classList.contains("panel-outline-open")) document.body.classList.remove("panel-file-open");
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
  }
  setupMobilePanels();

  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const outline = document.getElementById("outline");
  const openFile = document.getElementById("openFile");
  const saveFilename = document.getElementById("saveFilename");
  const editorSplit = document.getElementById("editorSplit");
  const editorStatus = document.getElementById("editorStatus");

  // Configure marked for safe output
  if (typeof marked !== "undefined") {
    marked.setOptions({ gfm: true, breaks: true });
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
      return;
    }
    try {
      preview.innerHTML = typeof marked !== "undefined"
        ? marked.parse(raw)
        : escapeHtml(raw).replace(/\n/g, "<br>");
      // Add outline-0, outline-1, ... to headings for scroll-to and scroll sync
      var headings = preview.querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (var i = 0; i < headings.length; i++) headings[i].id = "outline-" + i;
    } catch (e) {
      preview.innerHTML = '<span class="preview-empty">Parse error.</span>';
      outlineItems = [];
    }
    updateOutline();
    updateStatus();
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
      li.textContent = item.text;
      li.dataset.index = String(item.index);
      li.dataset.outlineIndex = String(outlineIndex);
      li.addEventListener("click", function (e) {
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
    var wrap = document.querySelector(".preview-content-wrap");
    if (!wrap) return;
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
    var wrap = document.querySelector(".preview-content-wrap");
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
    var wrap = document.querySelector(".preview-content-wrap");
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
  editor.addEventListener("input", function () { renderPreview(); updateStatus(); setDirty(true); });
  var PASTE_IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
  editor.addEventListener("paste", function (e) {
    if (e.shiftKey && e.clipboardData) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain") || "";
      var start = editor.selectionStart, end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
      editor.setSelectionRange(start + text.length, start + text.length);
      setDirty(true);
      renderPreview();
      updateStatus();
      return;
    }
    var files = e.clipboardData && e.clipboardData.files;
    if (files && files.length > 0) {
      var file = files[0];
      if (file.type && file.type.indexOf("image/") === 0) {
        if (file.size > PASTE_IMAGE_MAX_SIZE) {
          alert("Image is too large to paste (" + (file.size / 1024).toFixed(0) + " KB). Max 2 MB.");
          return;
        }
        e.preventDefault();
        var reader = new FileReader();
        reader.onload = function () {
          var dataUrl = reader.result;
          var markdown = "![" + (file.name || "image") + "](" + dataUrl + ")";
          var start = editor.selectionStart, end = editor.selectionEnd;
          var text = editor.value;
          editor.value = text.slice(0, start) + markdown + text.slice(end);
          editor.setSelectionRange(start + markdown.length, start + markdown.length);
          setDirty(true);
          renderPreview();
          updateStatus();
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    setTimeout(function () { renderPreview(); updateStatus(); setDirty(true); }, 0);
  });
  editor.addEventListener("scroll", function () {
    onEditorScroll();
    syncPreviewToEditor();
  });

  var previewWrap = document.querySelector(".preview-content-wrap");
  if (previewWrap) {
    previewWrap.addEventListener("scroll", function () {
      onPreviewScroll();
      syncEditorToPreview();
    });
  }

  function doNew() {
    if (isDirty && !confirm("You have unsaved changes. Discard and start a new document?")) return;
    editor.value = "";
    saveFilename.value = "document";
    resetUndoStack();
    setDirty(false);
    renderPreview();
    updateStatus();
  }

  function doOpen() {
    if (isDirty && !confirm("You have unsaved changes. Discard and open another file?")) return;
    openFile.click();
  }

  function doSave() {
    const name = (saveFilename.value || "document").replace(/\.md$/i, "") + ".md";
    const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    setDirty(false);
  }

  // File: New
  document.getElementById("btnNew").addEventListener("click", doNew);

  // File: Open (button triggers hidden file input)
  var btnOpen = document.getElementById("btnOpen");
  if (btnOpen) btnOpen.addEventListener("click", function () { openFile.click(); });
  openFile.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const name = file.name.replace(/\.(md|markdown)$/i, "");
    saveFilename.value = name || "document";
    updateDocumentTitle();
    const reader = new FileReader();
    reader.onload = function () {
      editor.value = reader.result;
      resetUndoStack();
      setDirty(false);
      renderPreview();
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
    const html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><title>" + escapeHtml(baseName) + "</title>\n<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:20px;line-height:1.6;color:#333}code{background:#f0f0f0;padding:2px 6px;border-radius:4px}pre{background:#1e1e1e;color:#e0e0e0;padding:12px;border-radius:4px;overflow-x:auto}pre code{background:none;padding:0}a{color:#0d7acc}</style>\n</head>\n<body>\n" + (typeof marked !== "undefined" ? marked.parse(editor.value) : escapeHtml(editor.value).replace(/\n/g, "<br>")) + "\n</body>\n</html>";
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
    if (typeof html2pdf === "undefined") { alert("PDF export library not loaded."); return; }
    var contentHtml = typeof marked !== "undefined" ? marked.parse(editor.value) : escapeHtml(editor.value).replace(/\n/g, "<br>");
    if (!contentHtml || contentHtml.trim() === "") {
      contentHtml = "<p>No content to export.</p>";
    }
    if (pdfPreviewContent) pdfPreviewContent.innerHTML = contentHtml;
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
        margin: 8,
        filename: name,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(pdfPreviewContent).save().then(function () {
        pdfPreviewSaveBtn.disabled = false;
        closePdfPreviewModal();
      }).catch(function (err) {
        pdfPreviewSaveBtn.disabled = false;
        console.error(err);
        alert("PDF export failed. Try printing the page and choose \"Save as PDF\".");
      });
    });
  }
  if (pdfPreviewCancelBtn) pdfPreviewCancelBtn.addEventListener("click", closePdfPreviewModal);
  if (pdfPreviewBackdrop) pdfPreviewBackdrop.addEventListener("click", closePdfPreviewModal);

  // Export as Word (HTML format that Word can open as .doc)
  document.getElementById("btnExportWord").addEventListener("click", function () {
    var bodyHtml = typeof marked !== "undefined" ? marked.parse(editor.value) : escapeHtml(editor.value).replace(/\n/g, "<br>");
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
    var html = typeof marked !== "undefined" ? marked.parse(raw) : escapeHtml(raw).replace(/\n/g, "<br>");
    if (!html) html = "";
    navigator.clipboard.writeText(html).then(function () {
      var label = btnCopyHtml && btnCopyHtml.querySelector(".doc-export-btn-text");
      if (label) { label.textContent = "Copied!"; setTimeout(function () { label.textContent = "Copy as HTML"; }, 1500); }
    }).catch(function () { alert("Copy failed."); });
  });

  // Copy as Markdown
  var btnCopyMd = document.getElementById("btnCopyMd");
  if (btnCopyMd) btnCopyMd.addEventListener("click", function () {
    var raw = editor.value;
    navigator.clipboard.writeText(raw).then(function () {
      var label = btnCopyMd && btnCopyMd.querySelector(".doc-export-btn-text");
      if (label) { label.textContent = "Copied!"; setTimeout(function () { label.textContent = "Copy as Markdown"; }, 1500); }
    }).catch(function () { alert("Copy failed."); });
  });

  // Print
  var btnPrint = document.getElementById("btnPrint");
  if (btnPrint) btnPrint.addEventListener("click", function () {
    var w = window.open("", "_blank");
    var raw = editor.value.trim();
    var html = typeof marked !== "undefined" ? marked.parse(raw) : escapeHtml(raw).replace(/\n/g, "<br>");
    w.document.write("<!DOCTYPE html><html><head><title>Print</title><style>body{font-family:Segoe UI,sans-serif;max-width:720px;margin:20px auto;line-height:1.6;color:#333}code{background:#f0f0f0;padding:2px 6px}pre{background:#2b2b2b;color:#e0e0e0;padding:12px;overflow-x:auto}a{color:#0d7acc}</style></head><body>" + html + "</body></html>");
    w.document.close();
    w.focus();
    w.setTimeout(function () { w.print(); w.close(); }, 250);
  });

  // Back to top
  var btnBackToTop = document.getElementById("btnBackToTop");
  function updateBackToTopVisibility() {
    if (!btnBackToTop) return;
    var wrap = document.querySelector(".preview-content-wrap");
    var editorScroll = editor.scrollTop > 80;
    var previewScroll = wrap && wrap.scrollTop > 80;
    btnBackToTop.classList.toggle("hidden", !editorScroll && !previewScroll);
  }
  if (btnBackToTop) btnBackToTop.addEventListener("click", function () {
    editor.scrollTop = 0;
    var wrap = document.querySelector(".preview-content-wrap");
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
    try { localStorage.setItem(DRAFT_KEY, editor.value); } catch (e) {}
    showDraftSavedFeedback();
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
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
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
      reader.readAsText(file);
    });
  }

  // Initial render and status
  renderPreview();
  updateStatus();
  updateDocumentTitle();
})();
