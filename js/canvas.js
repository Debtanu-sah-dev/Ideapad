class CanvasManager {
    constructor(parent) {
        this.parent = parent;
        this.canvasElement = document.createElement("canvas");
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.canvasElement.classList.add("canvasElement")
        this.parent.appendChild(this.canvasElement)
        this.parent.addEventListener("resize", (e) => {
            this.fitCanvasElement();
        });
        window.onresize = (e) => {
            this.fitCanvasElement();
        };
        this.strokeProperties = {
            color: "red",
            thickness: 5,
            join: "round",
            cap: "round"
        }
        this.strokes = [];
        this.compressMethods = ["prune"];
        this.controlManager();
        this.penDown = false;
        this.fitCanvasElement();
        this.canvasCustomizationInterface = new CanvasCustomizationInterface(this);
    }

    clearCanvas(){
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    render() {
        for (let stroke of this.strokes) {
            stroke.drawStroke();
        }
    }

    controlManager() {
        this.canvasElement.addEventListener("mousedown", (e) => {
            if(e.button == 0){
                this.penDown = true;
                let x = e.x - this.parent.offsetLeft;
                let y = e.y - this.parent.offsetTop;
                this.strokes.push(new Stroke([], this.canvasCtx, structuredClone(this.strokeProperties)));
                let stroke = this.strokes.at(-1)
                stroke.add(new Point(x, y));
                stroke.drawStroke();
            }
        })
        this.parent.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            let x = e.x - this.parent.offsetLeft;
            let y = e.y - this.parent.offsetTop;
            this.canvasCustomizationInterface.active(x, y);
        })
        this.parent.addEventListener("mouseleave", (e) => {
            if(e.button == 0){
                if(this.penDown){
                    this.penDown = false;
                    if(this.strokes.length != 0){
                        this.strokes.at(-1).compress(this.compressMethods);
                    }
                    this.clearCanvas();
                    this.render();
                }
            }
        })
        this.canvasElement.addEventListener("mouseup", (e) => {
            if(e.button == 0){
                if (this.penDown) {
                    this.penDown = false;
                    if(this.strokes.length != 0){
                        console.log(this.strokes.at(-1).points.length);
                        this.strokes.at(-1).compress(this.compressMethods);
                        console.log(this.strokes.at(-1).points.length);
                    }
                    this.clearCanvas();
                    this.render();
                }
            }
        })
        this.canvasElement.addEventListener("mousemove", (e) => {
            if (this.penDown) {
                let x = e.x - this.parent.offsetLeft;
                let y = e.y - this.parent.offsetTop;
                let stroke = this.strokes.at(-1)
                stroke.add(new Point(x, y));
                stroke.drawStroke();
            }
        })
    }

    fitCanvasElement() {
        this.canvasElement.height = this.parent.offsetHeight;
        this.canvasElement.width = this.parent.offsetWidth;
        this.render();
    }
}

class Stroke {
    constructor(points = [], canvasCtx, strokeProperties) {
        this.points = [...points];
        this.canvasCtx = canvasCtx;
        this.strokeProperties = strokeProperties;
    }

    add(point) {
        this.points.push(point)
    }

    drawStroke(canvasCtx = this.canvasCtx) {
        canvasCtx.beginPath();
        for (let point of this.points) {
            canvasCtx.lineTo(...point.coord);
            canvasCtx.moveTo(...point.coord);
        }
        canvasCtx.moveTo(...this.points.at(-1).coord);
        canvasCtx.strokeStyle = this.strokeProperties.color;
        canvasCtx.lineWidth = this.strokeProperties.thickness;
        canvasCtx.lineJoin = this.strokeProperties.join;
        canvasCtx.lineCap = this.strokeProperties.cap;
        canvasCtx.closePath();
        canvasCtx.stroke();
    }
    compress(methods = ["prune"]){
        let auxPath = this.points;
        for(let method of methods){
            auxPath = StrokeCompressor[method + "Path"](auxPath);
        }
        this.points = auxPath;
    }
}

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.coord = [x, y];
    }
}

class StrokeCompressor {
    static EPSILON = Math.PI/50;
    static PRUNE_DEPTH = 3;
    static DELTA = 5;
    static prunePath(path, depth = (StrokeCompressor.PRUNE_DEPTH || Infinity)) {
        depth = depth - 1;
        let auxPathArray = [];
        for (let coordIndex in path) {
            coordIndex = parseInt(coordIndex);
            let currCoord = path[coordIndex];

            if ((coordIndex == 0) || (coordIndex == (path.length - 1))) {
                auxPathArray.push(currCoord);
                continue;
            }

            if (dist(...auxPathArray[auxPathArray.length - 1].coord, ...currCoord.coord) <= StrokeCompressor.DELTA) {
                continue;
            }

            let prevCoord = path[coordIndex - 1];
            let nextCoord = path[coordIndex + 1];
            let angleOfDeviation = StrokeCompressor.calculateDeviation(prevCoord, currCoord, nextCoord)
            if (angleOfDeviation >= StrokeCompressor.EPSILON) {
                auxPathArray.push(currCoord);
            }
        }
        if ((auxPathArray.length === path.length) || (depth == 0)) {
            return auxPathArray
        }
        return StrokeCompressor.prunePath(auxPathArray, depth);
    }

    static smoothPath(path, kernelSize = 1) {
        if (kernelSize == 0) {
            return path;
        }
        let auxPathArray = [];
        for (let i = 0; i < kernelSize; i++) {
            auxPathArray.push(path[i]);
        }
        for (let i = kernelSize; i < path.length - kernelSize; i++) {
            let pathSegment = []
            for (let j = -1 * kernelSize; j <= kernelSize; j++) {
                pathSegment.push(path[i + j].coord);
            }
            console.log(pathSegment)
            let averagePoint = pathSegment.reduce((a, c) => {
                return [a[0] + c[0], a[1] + c[1]];
            }, [0, 0]).map(e => e / (kernelSize + 2))
            auxPathArray.push(new Point(...averagePoint));
        }
        for (let i = path.length - kernelSize; i < path.length; i++) {
            auxPathArray.push(path[i]);
        }
        return auxPathArray;
    }

    static calculateDeviation(coord1, coord2, coord3) {
        let a = dist(...coord1.coord, ...coord2.coord);
        let b = dist(...coord2.coord, ...coord3.coord);
        let c = dist(...coord1.coord, ...coord3.coord);
        let numerator = (a ** 2) + (b ** 2) - (c ** 2);
        let denominator = 2 * a * b;
        let fraction = numerator / denominator;
        let deviation = Math.PI/2 + Math.asin(fraction);
        return deviation;
    }
}

function dist(x1, y1, x2, y2){
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx**2 + dy**2);
}

class CanvasCustomizationInterface {
    constructor(manager) {
        this.activeStatus = false;
        this.manager = manager;
        this.strokeProperties = manager.strokeProperties;
        this.interfaceWindow = document.createElement("div");
        this.interfaceWindow.classList.add("interface")
        this.interfaceWindowBackdrop = document.createElement("div");
        this.interfaceWindowBackdrop.classList.add("interfaceBackdrop");
        this.colorPicker = document.createElement
        manager.parent.appendChild(this.interfaceWindow);
        manager.parent.appendChild(this.interfaceWindowBackdrop);
        this.interfaceWindowBackdrop.addEventListener("click", () => {
            this.inactive();
        })
    }
    active(x = 10, y = 10){
        if(!this.activeStatus){
            this.activeStatus = true
            this.interfaceWindow.style.display = "flex";
            this.interfaceWindowBackdrop.style.display = "initial";
            setTimeout(() => {
                x = Math.min(x, this.manager.parent.offsetWidth - this.interfaceWindow.offsetWidth);
                y = Math.min(y, this.manager.parent.offsetHeight - this.interfaceWindow.offsetHeight);
                this.interfaceWindow.style.left = `${x}px`
                this.interfaceWindow.style.top = `${y}px`
                this.interfaceWindow.classList.add("active")
            }, 0)
        }
    }

    inactive(){
        if(this.activeStatus){
            this.activeStatus = false;
            this.interfaceWindowBackdrop.style.display = "none";
            this.interfaceWindow.classList.remove("active")
            setTimeout(() => {
                this.interfaceWindow.style.display = "none"
            }, 200)
        }
    }
}