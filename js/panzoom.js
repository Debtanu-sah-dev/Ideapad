
/**
 * PanZoom Viewer Library
 * A lightweight, vanilla JS library to add pan and zoom capabilities to any DOM element.
 */

// Default styles to ensure basic functionality
const DEFAULT_STYLES = `
  .panzoom-container {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    /* We don't force borders/radius here so the user's wrapper styles are respected, 
       but basic defaults are helpful if the user didn't style the wrapper. */
    user-select: none;
    -webkit-user-select: none;
  }

  /* The element being zoomed */
  .panzoom-content {
    transform-origin: center center;
    transition: transform 0.15s ease-out;
    max-width: 100%;
    max-height: 100%;
    /* Ensure content doesn't overflow bounds initially */
    object-fit: contain; 
  }

  /* Controls Container - Positioned bottom-left */
  .panzoom-controls {
    position: absolute;
    bottom: 2vh;
    left: 2vh;
    display: flex;
    align-items:center;
    gap: 2vh;
    z-index: 10;
  }

  /* Zoom Percentage Badge */
  .panzoom-badge {
    pointer-events: none;
    user-select:none;
    backdrop-filter: var(--backdrop-filter-special);
    padding: 1vh 2vh;
    border-radius: 100vmax;
    font-weight: 600;
    text-align: center;
    margin-top: 1vh;
    border:var(--border);
    font-size:0.875rem;
    line-height:1.25rem;
    border-top:none;
  }
`;

// Inject styles into head if not already present
let stylesInjected = false;
const injectStyles = (element = document.head) => {
  if (stylesInjected && !element) return;
  const styleEl = document.createElement('style');
  styleEl.textContent = DEFAULT_STYLES;
  element.appendChild(styleEl);
  stylesInjected = true;
};

/**
 * Adds pan and zoom functionality to a wrapper element containing an image or SVG.
 * @param {HTMLElement} wrapperElement - The div wrapper containing the image or svg.
 * @param {Object} options - Configuration options.
 */
export function addView(wrapperElement, options = {}) {
  // 0. Validation
  if (!wrapperElement || !(wrapperElement instanceof HTMLElement)) {
    console.error('PanZoom: Invalid wrapper element provided.');
    return;
  }

  // 1. Find Content (img or svg)
  const contentElement = wrapperElement.querySelector('img, svg');
  if (!contentElement) {
    // If no supported content found, simply return without modifying the DOM.
    // This allows the user to blindly call addView on divs that might be empty.
    return;
  }

  if(wrapperElement.getRootNode() instanceof ShadowRoot){
      injectStyles(wrapperElement.getRootNode());
      let styleG = document.createElement("link");
      styleG.href = "css/style.css";
      styleG.rel = "stylesheet"
      let styleG2 = document.createElement("link");
      styleG2.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
      styleG2.rel = "stylesheet"
      wrapperElement.getRootNode().appendChild(styleG);
      wrapperElement.getRootNode().appendChild(styleG2);
  }
  else{
    injectStyles();
  }

  const config = {
    minScale: 1,
    maxScale: 8,
    zoomStep: 0.5,
    initialScale: 1,
    ...options
  };

  // State
  let state = {
    scale: config.initialScale,
    x: 0,
    y: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0
  };

  // 2. Setup Container & Content
  // We use the provided wrapperElement as the container.
  wrapperElement.classList.add('panzoom-container');
  if (options.className) {
    wrapperElement.classList.add(...options.className.split(' '));
  }

  contentElement.classList.add('panzoom-content');

  // Prevent default drag behavior on images so we can implement our own pan
  if (contentElement.tagName === 'IMG') {
    contentElement.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // 3. Create Controls (as children of the wrapper)
  const controls = document.createElement('div');
  controls.classList.add('panzoom-controls');

  // Helper to create SVG icons

  const createBtn = (iconHtml, onClick, title) => {
    const btn = document.createElement('button');
    btn.classList.add('panzoom-btn');
    btn.innerText = title;
    btn.title = title;
    // btn.setAttribute("tooltip", title);
    iconify(btn, true);
    btn.querySelector("span").style = `font-family: 'Material Symbols Outlined' !important;`
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  };

  const zoomInBtn = createBtn(
    null,
    () => updateScale(state.scale + config.zoomStep),
    'Zoom In'
  );

  const zoomOutBtn = createBtn(
    null,
    () => updateScale(state.scale - config.zoomStep),
    'Zoom Out'
  );

  const resetBtn = createBtn(
    null,
    () => reset(),
    'Reset View'
  );

  const badge = document.createElement('div');
  badge.classList.add('panzoom-badge');
  badge.textContent = '100%';

  controls.appendChild(zoomInBtn);
  controls.appendChild(zoomOutBtn);
  controls.appendChild(resetBtn);
  controls.appendChild(badge);
  wrapperElement.appendChild(controls);

  // 4. Logic & Updates
  const updateUI = () => {
    // Apply transform to the inner content
    if(state.scale != 1){
      wrapperElement.style.touchAction = "none";
    }
    else{
      wrapperElement.style.touchAction = "initial";
    }
    contentElement.style.transform = `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`;
    
    // Update Badge
    badge.textContent = `${Math.round(state.scale * 100)}%`;

    // Update Button States
    zoomInBtn.disabled = state.scale >= config.maxScale;
    zoomOutBtn.disabled = state.scale <= config.minScale;

    // Update Cursor on the wrapper
    if (state.scale > config.minScale) {
      wrapperElement.style.cursor = state.isDragging ? 'grabbing' : 'grab';
    } else {
      wrapperElement.style.cursor = 'default';
    }
  };

  const updateScale = (newScale) => {
    // Clamp scale
    const nextScale = Math.min(Math.max(newScale, config.minScale), config.maxScale);
    
    // If resetting to 1 (or min), clear translation
    if (nextScale <= config.minScale) {
      state.scale = config.minScale;
      state.x = 0;
      state.y = 0;
    } else {
      state.scale = nextScale;
    }
    
    updateUI();
  };

  const reset = () => {
    state.scale = config.minScale;
    state.x = 0;
    state.y = 0;
    updateUI();
  };

  // 5. Event Listeners (Pointer Events on wrapper)
  const handlePointerDown = (e) => {
    if (state.scale <= config.minScale) return;
    
    // Ignore clicks on controls
    if (e.target.closest('.panzoom-controls')) return;

    e.preventDefault();
    state.isDragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startTx = state.x;
    state.startTy = state.y;
    
    // Remove transition for direct 1:1 movement
    contentElement.style.transition = 'none';
    wrapperElement.setPointerCapture(e.pointerId);
    updateUI();
  };

  const handlePointerMove = (e) => {
    if (!state.isDragging) return;
    e.preventDefault();

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    // Adjust delta by scale to ensure cursor sticks to content
    state.x = state.startTx + (dx / state.scale);
    state.y = state.startTy + (dy / state.scale);

    updateUI();
  };

  const handlePointerUp = (e) => {
    if (!state.isDragging) return;
    state.isDragging = false;
    wrapperElement.releasePointerCapture(e.pointerId);
    
    // Restore smooth transition
    contentElement.style.transition = 'transform 0.15s ease-out';
    updateUI();
  };

  wrapperElement.addEventListener('pointerdown', handlePointerDown);
  wrapperElement.addEventListener('pointermove', handlePointerMove);
  wrapperElement.addEventListener('pointerup', handlePointerUp);
  wrapperElement.addEventListener('pointercancel', handlePointerUp);

  // Initialize
  updateUI();

  return {
    wrapper: wrapperElement,
    reset,
    updateScale
  };
}
