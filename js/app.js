const canvas = document.querySelector("#canvas");
const Canvas = new CanvasManager(canvas);
const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);