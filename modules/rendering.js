(function () {
  "use strict";

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function markdownToHtml(markdownText) {
    var parsed = typeof marked !== "undefined"
      ? marked.parse(markdownText || "")
      : escapeHtml(markdownText || "").replace(/\n/g, "<br>");
    if (typeof DOMPurify !== "undefined") {
      return DOMPurify.sanitize(parsed, { USE_PROFILES: { html: true } });
    }
    return parsed;
  }

  window.MarkdownRendering = {
    markdownToHtml: markdownToHtml
  };
})();
