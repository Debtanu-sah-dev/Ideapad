/**
 * Vanilla Tooltip Library
 * auto-positioning tool tips using pop-overs
 * works with dynamically added elements via MutationObserver
 */
(function() {
  // Check for fine pointer (mouse) - disable on touch-only devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const TOOLTIP_ID = 'vanilla-tooltip-popover';
  let tooltipEl = null;
  let activeTarget = null;
  let rafId = null;
  let showTimeout = null;
  let mouseX = 0;
  let mouseY = 0;

  // Track mouse position for overlap detection
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Initialize the tooltip element in the DOM
  function createTooltipElement() {
    if (document.getElementById(TOOLTIP_ID)) return;
    
    tooltipEl = document.createElement('div');
    tooltipEl.id = TOOLTIP_ID;
    tooltipEl.setAttribute('popover', 'manual');
    
    // Base styles
    Object.assign(tooltipEl.style, {
      position: 'fixed',
      zIndex: '999999',
      pointerEvents: 'none',
      padding: '1vh 2vh',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      color: 'var(--text-color)', // slate-50
      border: 'var(--border)', // slate-700
      borderTop:"none",
      backdropFilter: "var(--backdrop-filter-special)",
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      backgroundColor:"rgba(var(--r), var(--g), var(--b), 0.2)",
      maxWidth: '300px',
      width: 'max-content',
      margin: '0',
      borderRadius:"100vmax",
      inset: 'auto', // Override default popover centering
    });

    document.body.appendChild(tooltipEl);
  }

  // Parse delay from attribute (e.g., "0.5s", "500ms")
  // Default: 0.1s
  function getDelay(el) {
    const val = el.getAttribute('tooltip-delay');
    if (!val) return 100;
    
    if (val.endsWith('ms')) return parseFloat(val);
    if (val.endsWith('s')) return parseFloat(val) * 1000;
    return parseFloat(val) * 1000;
  }

  function updatePosition() {
    if (!activeTarget || !tooltipEl) return;

    // --- Safety & Validity Checks ---

    // 1. Element removed from DOM
    if (!activeTarget.isConnected) {
      hide();
      return;
    }

    // 2. Element hidden (display:none, inside closed details/dialog, etc)
    // checkVisibility is a modern API handling standard CSS hiding and top-layer logic
    if (activeTarget.checkVisibility && !activeTarget.checkVisibility()) {
      hide();
      return;
    }

    // 3. Element overlapped (obscured by another element)
    // We check what element is under the mouse cursor.
    // Since tooltip has pointer-events: none, it won't be detected.
    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
    if (elementUnderMouse && 
        elementUnderMouse !== activeTarget && 
        !activeTarget.contains(elementUnderMouse)) {
      hide();
      return;
    }

    // --- Positioning Logic ---

    const targetRect = activeTarget.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const gap = 8;
    const padding = 10;
    
    // Retrieve preferred position from attribute, default to top
    const preferredPos = activeTarget.getAttribute('tooltip-position') || 'top';
    const horizontal = preferredPos === 'left' || preferredPos === 'right';

    // Viewport dimensions
    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;

    // Helper to calculate coordinates for a given position
    function getCoords(pos) {
        let t, l;
        switch (pos) {
            case 'left':
                t = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                l = targetRect.left - tooltipRect.width - gap;
                break;
            case 'right':
                t = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                l = targetRect.right + gap;
                break;
            case 'bottom':
                t = targetRect.bottom + gap;
                l = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
            default:
                t = targetRect.top - tooltipRect.height - gap;
                l = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
        }
        return { t, l };
    }

    // Helper to check if a position fits within the viewport
    function checkFit(t, l) {
        return (
            t >= padding &&
            l >= padding &&
            t + tooltipRect.height <= vHeight - padding &&
            l + tooltipRect.width <= vWidth - padding
        );
    }

    // 1. Try preferred position
    let { t, l } = getCoords(preferredPos);
    
    // 2. Flip logic if it doesn't fit
    if (!checkFit(t, l)) {
        if (horizontal) {
             const flippedPos = preferredPos === 'left' ? 'right' : 'left';
             const flippedCoords = getCoords(flippedPos);
             
             const fitsX = (flippedCoords.l >= padding) && (flippedCoords.l + tooltipRect.width <= vWidth - padding);
             if (fitsX) {
                 t = flippedCoords.t;
                 l = flippedCoords.l;
             }
        } else {
             const flippedPos = preferredPos === 'top' ? 'bottom' : 'top';
             const flippedCoords = getCoords(flippedPos);
             
             const fitsY = (flippedCoords.t >= padding) && (flippedCoords.t + tooltipRect.height <= vHeight - padding);
             if (fitsY) {
                 t = flippedCoords.t;
                 l = flippedCoords.l;
             }
        }
    }

    // 3. Final clamp to viewport
    if (l < padding) l = padding;
    if (l + tooltipRect.width > vWidth - padding) l = vWidth - tooltipRect.width - padding;
    
    if (t < padding) t = padding;
    if (t + tooltipRect.height > vHeight - padding) t = vHeight - tooltipRect.height - padding;

    tooltipEl.style.top = `${t}px`;
    tooltipEl.style.left = `${l}px`;

    rafId = requestAnimationFrame(updatePosition);
  }

  function show(target) {
    const text = target.getAttribute('tooltip');
    if (!text) return;

    activeTarget = target;
    tooltipEl.textContent = text;

    try {
      tooltipEl.showPopover();
    } catch (e) {
      tooltipEl.style.display = 'block';
    }
    
    if (rafId) cancelAnimationFrame(rafId);
    updatePosition();
  }

  function hide() {
    activeTarget = null;
    if (rafId) cancelAnimationFrame(rafId);

    try {
      tooltipEl.hidePopover();
    } catch (e) {
      tooltipEl.style.display = 'none';
    }
  }

  function onMouseEnter(e) {
    const target = e.currentTarget;
    if (showTimeout) clearTimeout(showTimeout);
    
    const delay = getDelay(target);
    showTimeout = setTimeout(() => show(target), delay);
  }

  function onMouseLeave() {
    if (showTimeout) clearTimeout(showTimeout);
    hide();
  }

  // Attach listeners to a node if it has the tooltip attribute
  function attach(node) {
    if (node.nodeType === 1 && node.hasAttribute('tooltip')) {
      if (node._vanillaTooltipAttached) return;
      node._vanillaTooltipAttached = true;

      node.addEventListener('mouseenter', onMouseEnter);
      node.addEventListener('mouseleave', onMouseLeave);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll('[tooltip]').forEach(attach);
    }
  }

  function init() {
    createTooltipElement();

    attach(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          attach(node);
        });
        
        if (mutation.type === 'attributes' && mutation.attributeName === 'tooltip') {
          attach(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tooltip']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();