(function () {
  "use strict";

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ----- YAML frontmatter: strip it from the markdown and render it as a
  // small metadata table instead of the broken table/hr soup marked makes -----
  function splitFrontmatter(md) {
    var m = md.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(\n|$)/);
    if (!m) return { fm: null, body: md };
    return { fm: m[1], body: md.slice(m[0].length) };
  }

  function buildFrontmatterHtml(fm) {
    var rows = fm.split("\n").map(function (line) {
      var kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) {
        return "<tr><th>" + escapeHtml(kv[1]) + "</th><td>" + escapeHtml(kv[2]) + "</td></tr>";
      }
      return '<tr><td colspan="2">' + escapeHtml(line) + "</td></tr>";
    }).join("");
    return '<div class="frontmatter"><table>' + rows + "</table></div>";
  }

  // ----- Math: pull $...$ / $$...$$ out before marked runs (skipping code
  // spans and fences), leave placeholders, then re-inject as spans that
  // app.js renders lazily with KaTeX. -----
  function extractMath(md) {
    var math = [];
    var segments = md.split(/(```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\n]*`)/);
    for (var i = 0; i < segments.length; i += 2) {
      segments[i] = segments[i]
        .replace(/\$\$([\s\S]+?)\$\$/g, function (_, tex) {
          math.push({ tex: tex.trim(), display: true });
          return "%%MATH" + (math.length - 1) + "%%";
        })
        .replace(/(^|[^\\$\w])\$([^\s$](?:[^$\n]*?[^\s$\\])?)\$(?![\w$])/g, function (_, pre, tex) {
          math.push({ tex: tex, display: false });
          return pre + "%%MATH" + (math.length - 1) + "%%";
        });
    }
    return { md: segments.join(""), math: math };
  }

  function markdownToHtml(markdownText) {
    var fmSplit = splitFrontmatter(markdownText || "");
    var mathSplit = extractMath(fmSplit.body);
    var parsed = typeof marked !== "undefined"
      ? marked.parse(mathSplit.md)
      : escapeHtml(mathSplit.md).replace(/\n/g, "<br>");
    var html = (fmSplit.fm ? buildFrontmatterHtml(fmSplit.fm) : "") + parsed;
    if (typeof DOMPurify !== "undefined") {
      html = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    // Placeholders are plain text and survive both marked and the sanitizer;
    // swap them for math spans only after sanitizing.
    html = html.replace(/%%MATH(\d+)%%/g, function (_, n) {
      var item = mathSplit.math[parseInt(n, 10)];
      if (!item) return "";
      return '<span class="math-tex' + (item.display ? " math-display" : "") + '" data-tex="' + escapeAttr(item.tex) + '"></span>';
    });
    return html;
  }

  window.MarkdownRendering = {
    markdownToHtml: markdownToHtml,
    splitFrontmatter: splitFrontmatter
  };
})();
