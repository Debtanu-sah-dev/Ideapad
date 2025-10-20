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

//*AI code below

function renderMarkdownWithSVG(md) {
  // --- Step 1: Preserve fenced code blocks so they remain as <pre><code> ---
  const escapedMd = md.replace(/```([a-zA-Z0-9_-]*)?([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const languageClass = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${languageClass}>${escaped}</code></pre>`;
  });

  // --- Step 2: Protect raw <svg> blocks with placeholders ---
  const svgMap = new Map();
  let counter = 0;
  const protectedMd = escapedMd.replace(/<svg[\s\S]*?<\/svg>/gi, (svg) => {
    const token = `@@SVG_${counter++}@@`;
    svgMap.set(token, svg);
    return token;
  });

  // --- Step 3: Parse markdown normally ---
  const parsedHtml = marked.parse(protectedMd);

  // --- Step 4: Restore SVGs untouched ---
  let finalHtml = parsedHtml;
  for (const [token, svg] of svgMap.entries()) {
    finalHtml = finalHtml.replace(token, svg);
  }

  // --- Step 5: Return clean HTML ---
  return finalHtml;
}

//* AI code end

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
        iconify(node);
        if (node instanceof HTMLElement) {
          node.enableTouchToMouseMapping();
        }
        // Also handle their children
        if (node.querySelectorAll) {
          node.querySelectorAll('*').forEach(child => {
            iconify(child);
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

let textToIconMap = {
  "triangle": "change_history",
  "free shape": "polyline",
  "circle": "circle",
  "line":"diagonal_line",
  "square":"square",
  "rectangle":"rectangle",
  "eraser":"ink_eraser",
  "clear":"delete_forever",
  "undo":"undo",
  "redo":"redo",
  "pan":"pan_tool",
  "scale":"straighten",
  "compass": "architecture",
  "protractor":"looks",
  "x":"close",
  "+":"add",
  "explain":"prompt_suggestion",
  "ai": "text_fields_alt",
  "tools":"design_services",
  "applet": "view_cozy",
  "create applet": "add",
  "versions":"fork_left",
  "solve issue":"bug_report",
  "modify applet":"edit_square",
  "stop panning":"do_not_touch",
  "end freeshape":"edit_off",
  "ink":"replay",
  "move": "drag_pan",
  "diagram": "flowchart",
  "gallery": "folder_data",
  "select": "select",
  "offeraser": "ink_eraser_off",
  "unselect":"remove_selection",
  "scalebob":"lens_blur",
  "imagebob": "image",
  "insert image":"add_photo_alternate",
  "image search":"image_search",
  "copy": "content_copy"
}


function iconify(element, forced = false){
  if ((element.tagName == "BUTTON") || forced) {
    if(textToIconMap[element.innerText.toLowerCase()] != null){
      let text = element.innerText.toLowerCase();
      let icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined")
      icon.innerText = textToIconMap[text];
      element.innerHTML = "";
      element.dataset.type = text;
      element.appendChild(icon)
    }
  }
}

document.querySelectorAll("button").forEach((e) => {
  iconify(e);
})

function varCss(property){
  return getComputedStyle(document.documentElement).getPropertyValue('--' + property.replace(/ /g, "-"));
}

//*AI Code below caution ⚠️⚠️

/**
 * Sets the CSS custom property on an input element to its current value.
 *
 * @param {HTMLInputElement} input The input element to initialize.
 */
function initializeInput(input) {
  // If the input doesn't have a value, use an empty string.
  // Otherwise, use its value. This handles cases where we don't
  // want to set a visual value for non-color inputs initially.
  const inputValue = input.value || '';
  input.style.setProperty('--input-value', inputValue);
  
  // Update the CSS custom property on every 'input' event.
  input.addEventListener('input', (event) => {
    event.target.style.setProperty('--input-value', event.target.value);
  });
}

/**
 * Initializes all existing input elements and sets up a MutationObserver
 * to handle new ones.
 */
function setupInputVariableUpdates() {
  // 1. Initialize all input elements that are already in the DOM.
  document.querySelectorAll('input').forEach(initializeInput);

  // 2. Set up a MutationObserver to watch for new input elements.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes) {
        for (const node of mutation.addedNodes) {
          // Check if the added node is an input element.
          if (node.nodeType === 1 && node.matches('input')) {
            initializeInput(node);
          }
        }
      }
    }
  });

  // Start observing the entire document body for new nodes being added.
  observer.observe(document.body, { childList: true, subtree: true });
}

// Run the setup function after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', setupInputVariableUpdates);

// AI code end