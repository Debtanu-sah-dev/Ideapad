(function(window) {
  'use strict';

  const ensureMermaid = (useUbuntu = true) => {
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid JS is not loaded. Please include the Mermaid CDN script.');
      return false;
    }

    try {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            themeVariables: {
              fontFamily: '"Ubuntu Mono", monospace' // Replace 'Arial, sans-serif' with your desired font stack
            },
            suppressErrorRendering: true
        });
    } catch (e) {
        // Initialization might fail if already initialized, generally safe to ignore
    }
    return true;
  };

  /**
   * Vanilla JS Utility to render Mermaid diagrams
   * Scans the provided rootElement for <pre class="language-mermaid"><code class="language-mermaid">
   * and replaces them with rendered SVGs.
   */

  window.renderMermaidDiagrams = async function(rootElement) {
    // Check if mermaid is available globally
    // if (typeof mermaid === 'undefined') {
    //   console.warn('Mermaid JS is not loaded. Please include the Mermaid CDN script.');
    //   return;
    // }

    // // Initialize Mermaid (safe to call multiple times, but good to ensure settings)
    // try {
    //     mermaid.initialize({
    //         startOnLoad: false,
    //         theme: 'dark',
    //         securityLevel: 'loose',
    //         fontFamily: '"Ubuntu Mono", monospace',
    //         suppressErrorRendering: true
    //     });
    // } catch (e) {
    //     // Initialization might fail if already initialized, generally safe to ignore
    // }
    ensureMermaid();

    if (!rootElement) return;

    // 1. Select all matching pre tags that contain the specific code tag structure
    const preTags = rootElement.querySelectorAll('pre.language-mermaid');

    for (let i = 0; i < preTags.length; i++) {
      const preElement = preTags[i];
      const codeElement = preElement.querySelector('code.language-mermaid');

      // Validate structure matches the requirement
      if (!codeElement) continue;

      const graphDefinition = codeElement.textContent || '';
      
      // Create a unique ID for the mermaid diagram
      const id = `mermaid-diagram-${Date.now()}-${i}`;

      try {
        // 2. Render the SVG using Mermaid API
        const { svg } = await mermaid.render(id, stripNestedParentheses(graphDefinition));

        // 3. Create a wrapper div for the replacement
        const div = document.createElement('div');
        div.className = 'mermaid-rendered flex justify-center p-4 bg-white rounded-lg shadow-sm border border-slate-200 my-4 overflow-x-auto';
        div.innerHTML = svg;

        // 4. Replace the original <pre> tag with the rendered diagram
        if (preElement.parentNode) {
          preElement.parentNode.replaceChild(div, preElement);
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        
        // Render an error message in place of the diagram for better UX
        // const errorDiv = document.createElement('div');
        // errorDiv.className = 'p-4 my-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-mono whitespace-pre-wrap';
        // errorDiv.textContent = `Mermaid Syntax Error:\n${error.message || error}`;
        
        // if (preElement.parentNode) {
        //    // Append error after the pre tag
        //    if (preElement.nextSibling) {
        //        preElement.parentNode.insertBefore(errorDiv, preElement.nextSibling);
        //    } else {
        //        preElement.parentNode.appendChild(errorDiv);
        //    }
        // }
      }
    }
  };

  window.mermaidToSVGString = async function(mermaidCode) {
    if (!ensureMermaid(false)) {
      throw new Error("Mermaid JS not loaded");
    }

    // Create a unique ID for this render
    const id = `mermaid-svg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      const { svg } = await mermaid.render(id, mermaidCode);
      return svg;
    } catch (error) {
      console.error("mermaidToSVGString failed:", error);
      throw error;
    }
  };
})(window);