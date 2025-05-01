const canvas = document.querySelector("#canvas");
var Canvas = new CanvasManager(canvas);
const renderer = new marked.Renderer();
renderer.heading = (text, level) => `<h${level}>${text}</h${level}>`;
// renderer.code = (code, infostring) => `<p class="codehead">${infostring === null ||  infostring === undefined? "" : infostring}</p><pre class="language-${infostring}"><code class="language-${infostring}" data-prismjs-copy="Copy">${code.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`;
renderer.image = (href, title, text) => `<img ${text != null ? `alt="${text}"` : ""} ${href != null ? `src="${href}"` : ""} ${title != null ? title[0] == ":" ? `style="${title.slice(1)}"` : `title="${title}"` : ""}>`;
marked.setOptions({renderer});
marked.use({
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  xhtml: false
});
marked.setOptions({
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
  langPrefix: 'language-' // Ensure Prism recognizes the language classes
});
const options = {
  throwOnError: false,
  nonStandard: true
};

window.Prism = window.Prism || {};
Prism.manual = true;

marked.use(markedKatex(options));