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

//*Note Ai Code Below for Touch to mouse map

(function enableUniversalTouchToMouseMapping() {
  const eventMap = {
    'touchstart': 'mousedown',
    'touchmove': 'mousemove',
    'touchend': 'mouseup',
    'touchcancel': 'mouseleave'
  };

  // Method to install mapping on any HTMLElement
  HTMLElement.prototype.enableTouchToMouseMapping = function() {
    const el = this;

    function createMouseEvent(type, touch) {
      const mouseEvent = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        buttons: 1
      });
      Object.defineProperties(mouseEvent, {
        x: { value: touch.clientX, enumerable: true },
        y: { value: touch.clientY, enumerable: true }
      });
      return mouseEvent;
    }

    function touchHandler(e) {
      const mouseEventType = eventMap[e.type];
      if (!mouseEventType) return;

      for (const touch of e.changedTouches) {
        const mouseEvent = createMouseEvent(mouseEventType, touch);
        el.dispatchEvent(mouseEvent);
      }
    }

    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(type => {
      el.addEventListener(type, touchHandler, { passive: false });
    });
  };

  // Auto-install on existing elements
  document.querySelectorAll('*').forEach(el => {
    if (el instanceof HTMLElement) {
      el.enableTouchToMouseMapping();
    }
  });

  // Observe future added elements
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          node.enableTouchToMouseMapping();
        }
        // Also handle their children
        if (node.querySelectorAll) {
          node.querySelectorAll('*').forEach(child => {
            if (child instanceof HTMLElement) {
              child.enableTouchToMouseMapping();
            }
          });
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

})();

//*Ai Code End