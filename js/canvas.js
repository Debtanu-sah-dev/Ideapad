function listenableArray(...args) {
    let a = [...args];
    a.addCallback = () => {

    }
    a.push = function () {
        a.addCallback();
        return Array.prototype.push.apply(this, arguments)
    }
    a.pushNC = function () {
        return Array.prototype.push.apply(this, arguments)
    }
    return a;
}

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
        this.translation = new Point(0, 0);
        this.strokeProperties = {
            color: "#000000",
            thickness: 5,
            join: "round",
            cap: "round",
            translation: this.translation
        }
        this.shapeProperties = {
            strokeColor:"#000000",
            fillColor:false,
            thickness: 5,
            join: "round",
            cap: "round",
            translation: this.translation
        }
        this.currentMouseCoord = new Point();
        this.coordCounter = document.createElement("span");
        this.parent.appendChild(this.coordCounter);
        this.coordCounter.classList.add("coordCounter")
        this.strokes = listenableArray();
        this.redoQueue = []
        this.strokes.addCallback = () => {
            this.redoQueue = [];
        }
        this.compressMethods = ["prune"];
        this.translationBegin = new Point(0, 0);
        this.prevTranslation = this.translation.copy();
        this.move = new Point(0, 0);
        this.canTranslate = false;
        this.controlManager();
        this.penDown = false;
        this.shapeMode = false;
        this.fitCanvasElement();
        this.constraintWindow = new ConstraintDriver(this);
        this.canvasCustomizationInterface = new CanvasCustomizationInterface(this);
    }

    clearCanvas(){
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    render() {
        this.clearCanvas();
        for (let stroke of this.strokes) {
            if(stroke instanceof Stroke){
                stroke.drawStroke();
            }
            if(stroke instanceof Shape){
                stroke.drawShape();
            }
        }
    }

    mouseDown(e, point){
        let x = (point ? point.x : e.x) - this.parent.offsetLeft;
        let y = (point ? point.y : e.y) - this.parent.offsetTop;
        if(e.button == 0){
            this.penDown = true;
            this.strokes.push(new Stroke([], this.canvasCtx, this.strokeProperties, false, this));
            let stroke = this.strokes.at(-1)
            stroke.add(new Point(x - this.translation.x, y - this.translation.y));
            stroke.drawStroke();
        }
        if (e.button == 1) {
            e.preventDefault();
            this.translationBegin = new Point(x, y);
            // console.log(x, y);
            this.canTranslate = true;
            this.prevTranslation = this.translation.copy();
        }
    }

    contextMenu(e){
        e.preventDefault();
        let x = e.x - this.parent.offsetLeft;
        let y = e.y - this.parent.offsetTop;
        this.canvasCustomizationInterface.active(x, y);
        this.canTranslate = false;
    }

    mouseLeave(e){
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
        this.canTranslate = false;
    }

    mouseUp(e){
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
        if(e.button == 1){
            e.preventDefault();
            this.canTranslate = false;
        }
    }

    mouseMove(e, point){
        let x = (point ? point.x : e.x) - this.parent.offsetLeft;
        let y = (point ? point.y : e.y) - this.parent.offsetTop;
        if (this.penDown) {
            let stroke = this.strokes.at(-1)
            stroke.add(new Point(x - this.translation.x, y - this.translation.y));
            stroke.drawStroke();
        }
        e.preventDefault();
        if (this.canTranslate) {
            this.move.x = x - this.translationBegin.x;
            this.move.y = y - this.translationBegin.y;
            this.translation.x = this.prevTranslation.x + this.move.x
            this.translation.y = this.prevTranslation.y + this.move.y
            this.parent.style.backgroundPosition = `${this.translation.x}px ${this.translation.y}px`
            this.render();
        }
        this.currentMouseCoord.x = e.x - this.parent.offsetLeft - this.translation.x;
        this.currentMouseCoord.y = e.y - this.parent.offsetTop - this.translation.y;

        this.coordCounter.innerText = `${this.currentMouseCoord.x}, ${ this.currentMouseCoord.y}`
    }

    controlManager() {
        this.canvasElement.addEventListener("mousedown", (e) => {
            this.mouseDown(e);
        })
        this.parent.addEventListener("contextmenu", (e) => {
            this.contextMenu(e);
        })
        this.parent.addEventListener("mouseleave", (e) => {
            this.mouseLeave(e);
        })
        this.canvasElement.addEventListener("mouseup", (e) => {
            this.mouseUp(e);
        })
        this.canvasElement.addEventListener("mousemove", (e) => {
            this.mouseMove(e);
        })
    }

    fitCanvasElement() {
        this.canvasElement.height = this.parent.offsetHeight;
        this.canvasElement.width = this.parent.offsetWidth;
        this.render();
    }
}

class Stroke {
    constructor(points = [], canvasCtx, strokeProperties, shapeDriver = false, manager) {
        this.points = points != null ? [...points] : [];
        this.canvasCtx = canvasCtx;
        this.strokeProperties = structuredClone(strokeProperties);
        this.shapeDriver = shapeDriver;
        this.manager = manager
    }

    add(point) {
        this.points.push(point)
    }

    drawStroke(canvasCtx = this.canvasCtx) {
        if (this.points.length == 0) {
            return;
        }
        canvasCtx.beginPath();
        canvasCtx.moveTo(...this.points[0].add(this.manager.strokeProperties.translation).coord);
        for (let point of this.points) {
            canvasCtx.lineTo(...point.add(this.manager.strokeProperties.translation).coord);
        }
        if (!this.shapeDriver) {
            canvasCtx.moveTo(...this.points.at(-1).add(this.manager.strokeProperties.translation).coord);
        }
        if (this.shapeDriver) {
            if(!this.strokeProperties.strokeColor){
                canvasCtx.strokeStyle = "#00000000";
            }
            else{
                canvasCtx.strokeStyle = this.strokeProperties.strokeColor;
            }
            if(!this.strokeProperties.fillColor){
                canvasCtx.fillStyle = "#00000000";
            }
            else{
                canvasCtx.fillStyle = this.strokeProperties.fillColor;
            }
        }
        else{
            canvasCtx.strokeStyle = this.strokeProperties.color;
        }
        canvasCtx.lineWidth = this.strokeProperties.thickness;
        canvasCtx.lineJoin = this.strokeProperties.join;
        canvasCtx.lineCap = this.strokeProperties.cap;
        canvasCtx.closePath();
        if (this.shapeDriver) {
            canvasCtx.fill();
        }
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

// new Shape("triangle", Canvas.canvasCtx, Canvas.shapeProperties, [new Point(100, 100), new Point(200, 200), new Point(100, 200), new Point(100, 100)], Canvas).drawShape();
// new Shape("freeShape", Canvas.canvasCtx, Canvas.shapeProperties, [new Point(400, 410), new Point(600, 400), new Point(550, 700), new Point(400, 410)], Canvas).drawShape();
// new Shape("circle", Canvas.canvasCtx, Canvas.shapeProperties, {x:700, y:200, rx: 50, ry:50}, Canvas).drawShape();
// new Shape("square", Canvas.canvasCtx, Canvas.shapeProperties, {x:200, y:500, side:100}, Canvas).drawShape();
// new Shape("rectangle", Canvas.canvasCtx, Canvas.shapeProperties, {x:350, y:200, height:100, width:200}, Canvas).drawShape();

class Shape{
    constructor(shape, canvasCtx, shapeProperties, geometryInfo = [], manager){
        this.shape = shape;
        this.canvasCtx = canvasCtx;
        this.shapeProperties = structuredClone(shapeProperties);
        this.geometryInfo = geometryInfo;
        this.manager = manager;
        this.shapeEditor = new ShapeEditor(this, manager)
        this.manager.shapeMode = true;
    }

    drawShape(canvasCtx = this.canvasCtx){
        switch (this.shape) {
            case "line":
                new Stroke(this.geometryInfo, canvasCtx, this.shapeProperties, false, this.manager).drawStroke();
                return;
            case "triangle":
                new Stroke(this.geometryInfo, canvasCtx, this.shapeProperties, true, this.manager).drawStroke();
                return;
            case "freeShape":
                new Stroke(this.geometryInfo, canvasCtx, this.shapeProperties, true, this.manager).drawStroke();
                return;
            default:
                break;
        }
        if(!this.shapeProperties.strokeColor){
            canvasCtx.strokeStyle = "#00000000";
        }
        else{
            canvasCtx.strokeStyle = this.shapeProperties.strokeColor;
        }
        if(!this.shapeProperties.fillColor){
            canvasCtx.fillStyle = "#00000000";
        }
        else{
            canvasCtx.fillStyle = this.shapeProperties.fillColor;
        }
        if(this.shapeProperties.fillColor != false){
            canvasCtx.lineWidth = this.shapeProperties.thickness*2;
        }
        else{
            canvasCtx.lineWidth = this.shapeProperties.thickness;
        }
        canvasCtx.lineJoin = this.shapeProperties.join;
        canvasCtx.lineCap = this.shapeProperties.cap;
        switch (this.shape) {
            case "circle":
                this.circle(canvasCtx);
                break;
            case "square":
                this.square(canvasCtx)
                break;
            case "rectangle":
                this.rectangle(canvasCtx)
                break;
            default:
                break;
        }
        canvasCtx.stroke();
        canvasCtx.fill();
    }

    circle(canvasCtx = this.canvasCtx){
        canvasCtx.beginPath();
        const x = this.geometryInfo.x + this.manager.translation.x; // x coordinate
        const y = this.geometryInfo.y + this.manager.translation.y; // y coordinate
        const radiusX = this.geometryInfo.rx; // Arc radius
        const radiusY = this.geometryInfo.ry; // Arc radius
        const rotation = this.geometryInfo.rotation;
        const startAngle = 0; // Starting point on circle
        const endAngle = Math.PI * 2; // End point on circle;
        canvasCtx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
    }

    square(canvasCtx = this.canvasCtx){
        canvasCtx.beginPath();
        const x = this.geometryInfo.x + this.manager.translation.x; // x coordinate
        const y = this.geometryInfo.y + this.manager.translation.y; // y coordinate
        const side = this.geometryInfo.side; // Side
        const signY = this.geometryInfo.signY; // Side
        canvasCtx.rect(x, y, side, signY*Math.abs(side));
    }

    rectangle(canvasCtx = this.canvasCtx){
        canvasCtx.beginPath();
        const x = this.geometryInfo.x + this.manager.translation.x; // x coordinate
        const y = this.geometryInfo.y + this.manager.translation.y; // y coordinate
        const height = this.geometryInfo.height; // height
        const width = this.geometryInfo.width; // width
        canvasCtx.rect(x, y, width, height);
    }
}

class ShapeEditor{
    constructor(shape, manager){
        this.shape = shape;
        this.manager = manager;
        this.manager.canvasCustomizationInterface.inactive();
        this.editCanvas = document.createElement("canvas");
        this.editCanvasCtx = this.editCanvas.getContext("2d");
        this.editCanvas.classList.add("editCanvas")
        this.resizeEvent = () => {
            this.editCanvas.width = this.manager.canvasElement.width;
            this.editCanvas.height = this.manager.canvasElement.height;
        }
        this.resizeEvent();
        this.manager.canvasElement.addEventListener("resize", this.resizeEvent)
        this.manager.parent.appendChild(this.editCanvas)
        this.editMode = false;
        if(this.shape.shape != "freeShape"){
            this.beginPoint = new Point(0, 0);
            this.endPoint = new Point(0, 0);
            this.editCanvas.addEventListener("mousedown", (e) => {
                if(e.button == 0){
                    this.editMode = true;
                    this.beginPoint.x = e.x - this.manager.parent.offsetLeft - this.manager.translation.x;
                    this.beginPoint.y = e.y - this.manager.parent.offsetTop - this.manager.translation.y;
                    this.endPoint.x = e.x - this.manager.parent.offsetLeft - this.manager.translation.x;
                    this.endPoint.y = e.y - this.manager.parent.offsetTop - this.manager.translation.y;
                }
            })
            this.editCanvas.addEventListener("mousemove", (e) => {
                if((e.button == 0) && this.editMode){
                    this.endPoint.x = e.x - this.manager.parent.offsetLeft - this.manager.translation.x;
                    this.endPoint.y = e.y - this.manager.parent.offsetTop - this.manager.translation.y;
                    this.shape.geometryInfo = new geometryInfoGenerator(this.shape.shape, this.beginPoint, this.endPoint).generate();
                    this.editCanvasCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height)
                    this.shape.drawShape(this.editCanvasCtx)
                }
            })
            this.editCanvas.addEventListener("mouseup", (e) => {
                if((e.button == 0) && this.editMode){
                    this.editMode = false;
                    this.editCanvasCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
                    this.manager.parent.removeChild(this.editCanvas);
                    this.manager.render();
                    this.manager.shapeMode = false;
                }
            })
            this.editCanvas.addEventListener("leave", (e) => {
                if((e.button == 0) && this.editMode){
                    this.editMode = false;
                    this.editCanvasCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
                    this.manager.parent.removeChild(this.editCanvas);
                    this.manager.render();
                    this.manager.shapeMode = false;
                }
            })
        }
        else{
            this.points = [];
            this.editCanvas.addEventListener("click", (e) => {
                this.editMode = true;
                this.points.push(new Point(e.x - this.manager.parent.offsetLeft - this.manager.translation.x, e.y - this.manager.parent.offsetTop - this.manager.translation.y));
                this.shape.geometryInfo = new geometryInfoGenerator(this.shape.shape, this.points).generate();
                this.editCanvasCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height)
                this.shape.drawShape(this.editCanvasCtx)
            })
        }
        this.editCanvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.editMode = false;
            this.editCanvasCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
            this.manager.parent.removeChild(this.editCanvas);
            this.manager.render();
            this.manager.shapeMode = false;
        })
    }
}

class geometryInfoGenerator{
    constructor(shape, beginPoint, endPoint){
        this.shape = shape;
        if(this.shape != "freeShape"){
            this.beginPoint = beginPoint;
            this.endPoint = endPoint;
        }
        else{
            this.points = beginPoint;
        }
    }
    generate(){
        let geometryInfo;
        switch (this.shape) {
            case "line":
                geometryInfo = [];
                geometryInfo.push(this.beginPoint.copy());
                geometryInfo.push(this.endPoint.copy());
                break;
            case "triangle":
                geometryInfo = [];
                geometryInfo.push(new Point((this.beginPoint.x + this.endPoint.x)/2, this.endPoint.y));
                geometryInfo.push(new Point(this.beginPoint.x, this.beginPoint.y));
                geometryInfo.push(new Point(this.endPoint.x, this.beginPoint.y));
                break;
            case "freeShape":
                geometryInfo = this.points;
                break;
            case "circle":
                let rx = Math.abs(this.beginPoint.x - this.endPoint.x);
                let ry = Math.abs(this.beginPoint.y - this.endPoint.y);
                geometryInfo = {
                    x:this.beginPoint.x,
                    y:this.beginPoint.y,
                    rx: rx,
                    ry: ry,
                    distance: dist(0, 0, rx, ry),
                    rotation:0
                }
                break;
            case "square":
                let x = 
                geometryInfo = {
                    x: this.beginPoint.x,
                    y: this.beginPoint.y,
                    side: this.endPoint.x - this.beginPoint.x,
                    signY: Math.sign(this.endPoint.y - this.beginPoint.y)
                }
                break;
            case "rectangle":
                geometryInfo = {
                    x: Math.min(this.beginPoint.x, this.endPoint.x),
                    y: Math.min(this.beginPoint.y, this.endPoint.y),
                    width: Math.abs(this.beginPoint.x - this.endPoint.x),
                    height: Math.abs(this.beginPoint.y - this.endPoint.y)
                }
                break;
            default:
                break;
        }

        return geometryInfo;
    }
}

class ConstraintDriver{
    constructor(manager){
        this.manager = manager;
        this.constraintWindow = document.createElement("div");
        this.constraintWindow.classList.add("constraint");
        // this.constraintWindow.classList.add("active");
        this.manager.parent.appendChild(this.constraintWindow);
        this.constraints = [new ScaleConstraint(this.manager, this)]
        this.currentConstraint = 0;
        this.active = false;

        for(let constraint of this.constraints){
            this.constraintWindow.appendChild(constraint.shape)
        }

        this.constraintWindow.addEventListener("mousedown", (e) => {
            let contrain = this.constraints[this.currentConstraint].constrain(new Point(e.x - this.manager.parent.offsetLeft, e.y - this.manager.parent.offsetTop));
            let x = contrain.x + this.manager.parent.offsetLeft
            let y = contrain.y + this.manager.parent.offsetTop
            this.manager.mouseDown(e, new Point(x, y));
            // this.manager.mouseDown(e);
        })
        this.constraintWindow.addEventListener("mouseup", (e) => {
            let contrain = this.constraints[this.currentConstraint].constrain(new Point(e.x - this.manager.parent.offsetLeft, e.y - this.manager.parent.offsetTop));
            let x = contrain.x + this.manager.parent.offsetLeft
            let y = contrain.y + this.manager.parent.offsetTop
            this.manager.mouseUp(e, new Point(x, y));
            // this.manager.mouseUp(e);
        })
        this.constraintWindow.addEventListener("mousemove", (e) => {
            let contrain = this.constraints[this.currentConstraint].constrain(new Point(e.x - this.manager.parent.offsetLeft, e.y - this.manager.parent.offsetTop));
            let x = contrain.x + this.manager.parent.offsetLeft
            let y = contrain.y + this.manager.parent.offsetTop
            this.manager.mouseMove(e, new Point(x, y));
            // this.manager.mouseMove(e);
        })
    }

    toggleActive(forcedActive = false){
        this.active = forcedActive ? true : !this.active;
        if(this.active){
            this.constraintWindow.classList.add("active")
            this.constraints.forEach((e) => {
                e.inactive();
            })
            this.constraints[this.currentConstraint].active();
        }
        else{
            this.constraintWindow.classList.remove("active")
        }
    }
}

class Constraint{
    constructor(manager, driver){
        this.manager = manager;
        this.driver = driver;
        this.mouseDownCoord = new Point();
        this.currentMouseCoord = new Point();
        this.shape = document.createElement("div");
    }

    active(){
        this.shape.style.display = "initial";
    }

    inactive(){
        this.shape.style.display = "none";
    }
}

class ScaleConstraint extends Constraint{
    constructor(manager, driver){
        super(manager, driver);
        this.label = "Scale";
        this.shape.classList.add("scale");
        this.scale = document.createElement("div");
        this.shape.appendChild(this.scale);
        this.panControl = document.createElement("div");
        this.panControl.classList.add("scalePanControl");
        this.shape.appendChild(this.panControl);
        this.scale.classList.add("scaleScale")
        this.shape.draggable = false;
        this.canMove = false;
        this.panZone = false;
        this.canPan = true;
        this.canRotate = false;
        this.rotating = false;
        this.inShape = false;
        this.Db = dist(0, 0, this.manager.parent.offsetWidth/2, this.manager.parent.offsetHeight/2)
        this.chi = Math.acos(this.shape.offsetWidth/(2*this.Db));
        this.rt = new Point();
        this.theta = 0;
        this.slope = 0.00001;
        this.panControl.addEventListener("mousemove", (e) => {
            this.panZone = true;
        })
        this.panControl.addEventListener("mouseleave", (e) => {
            this.panZone = false;
        })
        this.shape.addEventListener("mousemove", (e) => {
            // e.stopPropagation();
            // let contrain = this.constrain(new Point(e.x - this.manager.parent.offsetLeft, e.y - this.manager.parent.offsetTop));
            // let x = contrain.x + this.manager.parent.offsetLeft
            // let y = contrain.y + this.manager.parent.offsetTop
            // this.manager.mouseMove(e, new Point(x, y))
            if(this.panZone && !this.rotating){
                this.canPan = true;
                this.canRotate = false;
            }
            else{                                                                                                               
                this.canRotate = true;
                this.canPan = false;
            }
            if(!this.inShape){
                // this.manager.mouseUp(e);
                this.manager.strokes.push(new Stroke([], this.manager.canvasCtx, this.manager.strokeProperties, false, this.manager));
            }
            this.inShape = true;
        })

        this.shape.addEventListener("mouseleave", (e) => {
            this.inShape = false;
        })
        this.shape.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            this.mouseDownCoord.x = e.x - this.shape.offsetLeft;
            this.mouseDownCoord.y = e.y - this.shape.offsetTop;
            this.canMove = true;
        })
        this.driver.constraintWindow.addEventListener("mousemove", (e) => {
            e.stopPropagation();
            let centerX = this.shape.offsetLeft + this.shape.offsetWidth/2;
            let centerY = this.shape.offsetTop + this.shape.offsetHeight/2;
            if(this.canMove && this.canPan){
                this.shape.style.left = e.x - this.manager.parent.offsetLeft - this.mouseDownCoord.x  + "px";
                this.shape.style.top = e.y - this.manager.parent.offsetTop - this.mouseDownCoord.y + "px";
            }
            else if(this.canMove && this.canRotate){
                this.rotating = true;
                let angle = Math.atan2(e.y - this.manager.parent.offsetTop - centerY, e.x - this.manager.parent.offsetLeft - centerX);
                let slope = Math.tan(angle);
                this.theta = angle;
                this.slope = slope;
                this.shape.style.rotate = (Math.atan2(e.y - this.manager.parent.offsetTop - centerY, e.x - this.manager.parent.offsetLeft - centerX)*180/Math.PI) + "deg"
            }
            let tempX = -1*(this.shape.offsetWidth/2);
            let tempY = -1*(this.shape.offsetHeight/2)
            this.rt.x = tempX*Math.cos(this.theta) - tempY*Math.sin(this.theta) + centerX - this.manager.parent.offsetLeft;
            this.rt.y = tempX*Math.sin(this.theta) + tempY*Math.cos(this.theta) + centerY - this.manager.parent.offsetTop; 
        })
        this.driver.constraintWindow.addEventListener("mouseup", (e) => {
            e.stopPropagation();
            this.canMove = false;
            this.canPan = false;
            this.canRotate = false;
            this.rotating = false;
            this.mouseDownCoord.x = 0;
            this.mouseDownCoord.y = 0;
        })
    }

    constrain(point){
        if(this.inShape){
            let numerator = (point.x/this.slope) + (this.slope * this.rt.x) + point.y - this.rt.y;
            let denominator = this.slope + (1/this.slope);
            let x = numerator/denominator;
            let y = this.slope*(x - this.rt.x) + this.rt.y;
            return new Point(x, y)
        }
        else{
            return new Point(point.x, point.y);
        }
    }
}

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.coord = [x, y];
    }

    copy(){
        return new Point(this.x, this.y);
    }

    add(point){
        return new Point(point.x + this.x, point.y + this.y);
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
        this.shapeProperties = manager.shapeProperties;
        this.interfaceWindow = document.createElement("div");
        this.interfaceWindow.classList.add("interface")
        this.interfaceWindowBackdrop = document.createElement("div");
        this.interfaceWindowBackdrop.classList.add("interfaceBackdrop");
        this.colorPicker1 = document.createElement("input");
        this.colorPicker1.type = "color";
        this.colorPicker2 = document.createElement("input");
        this.colorPicker2.type = "color";
        this.colorPicker2.value = "#ffffff"
        this.interfaceWindow.appendChild(this.colorPicker1);
        this.interfaceWindow.appendChild(this.colorPicker2);
        // Triangle
        this.triangleShape = document.createElement("button");
        this.triangleShape.innerText = "Triangle";
        this.interfaceWindow.appendChild(this.triangleShape);

        //Free Shape
        this.freeShape = document.createElement("button");
        this.freeShape.innerText = "Free Shape";
        this.interfaceWindow.appendChild(this.freeShape);

        //Circle Shape
        this.circleShape = document.createElement("button");
        this.circleShape.innerText = "Circle";
        this.interfaceWindow.appendChild(this.circleShape);

        // Line Shape
        this.lineShape = document.createElement("button");
        this.lineShape.innerText = "Line";
        this.interfaceWindow.appendChild(this.lineShape);

        // Square
        this.squareShape = document.createElement("button");
        this.squareShape.innerText = "Square";
        this.interfaceWindow.appendChild(this.squareShape);

        // Rectangle
        this.rectangleShape = document.createElement("button");
        this.rectangleShape.innerText = "Rectangle";
        this.interfaceWindow.appendChild(this.rectangleShape);

        // Eraser
        this.eraser = document.createElement("button");
        this.eraser.innerText = "Eraser";
        this.interfaceWindow.appendChild(this.eraser);

        // Clear
        this.clear = document.createElement("button");
        this.clear.innerText = "Clear";
        this.interfaceWindow.appendChild(this.clear);

        // Undo
        this.undo = document.createElement("button");
        this.undo.innerText = "Undo";
        this.interfaceWindow.appendChild(this.undo);

        // Redo
        this.redo = document.createElement("button");
        this.redo.innerText = "Redo";
        this.interfaceWindow.appendChild(this.redo);

        //Fill Type Selector
        this.fillTypeSelector = document.createElement("button");
        this.fillTypeSelector.innerText = "Stroke & Fill";
        this.interfaceWindow.appendChild(this.fillTypeSelector);

        this.fillTypeArray = ["Stroke & Fill", "Stroke", "Fill"];
        this.fillType = 0;

        this.thicknessSlider = document.createElement("input");
        this.thicknessSlider.type = "range";
        this.thicknessSlider.value = 5;
        this.thicknessSlider.step = 1;
        this.thicknessSlider.min = 1;
        this.thicknessSlider.max = 25;
        this.interfaceWindow.appendChild(this.thicknessSlider)
        manager.parent.appendChild(this.interfaceWindow);
        manager.parent.appendChild(this.interfaceWindowBackdrop);
        this.interfaceWindowBackdrop.addEventListener("click", () => {
            this.inactive();
        })
        this.colorPicker1.addEventListener("input", () => {
            if(this.shapeProperties.strokeColor != false){
                this.shapeProperties.strokeColor = this.colorPicker1.value;
            }
            this.strokeProperties.color = this.colorPicker1.value;
        })
        
        this.thicknessSlider.addEventListener("input", () => {
            this.shapeProperties.thickness = this.thicknessSlider.value;
            this.strokeProperties.thickness = this.thicknessSlider.value;
        })
        
        this.colorPicker2.addEventListener("input", () => {
            if(this.shapeProperties.fillColor != false){
                this.shapeProperties.fillColor = this.colorPicker2.value;
            }
        })
        this.triangleShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("triangle", this.manager.canvasCtx, this.shapeProperties, null, this.manager));
        })
        this.freeShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("freeShape", this.manager.canvasCtx, this.shapeProperties, null, this.manager));
        })
        this.circleShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("circle", this.manager.canvasCtx, this.shapeProperties, null, this.manager));
        })
        this.lineShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("line", this.manager.canvasCtx, this.strokeProperties, null, this.manager));
        })
        this.squareShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("square", this.manager.canvasCtx, this.shapeProperties, null, this.manager));
        })
        this.rectangleShape.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.manager.strokes.push(new Shape("rectangle", this.manager.canvasCtx, this.shapeProperties, null, this.manager));
        })
        this.eraser.addEventListener("click", () => {
            // if (this.manager.shapeMode) {
            //     return;
            // }
            this.colorPicker1.value = "#ffffff"
        })
        this.clear.addEventListener("click", () => {
            this.manager.strokes = listenableArray();
            this.manager.strokes.addCallback = () => {
                this.manager.redoQueue = [];
            }
            this.manager.clearCanvas();
        })

        this.undo.addEventListener("click", () => {
            this.manager.redoQueue.push(this.manager.strokes.pop());
            this.manager.render();
        })
        this.redo.addEventListener("click", () => {
            if(this.manager.redoQueue.length > 0){
                this.manager.strokes.pushNC(this.manager.redoQueue.pop());
                this.manager.render();
            }
        })
        this.fillTypeSelector.addEventListener("click", () => {
            this.fillType = (this.fillType + 1) % 3;
            this.fillTypeSelector.innerText = this.fillTypeArray[this.fillType];
            switch (this.fillType) {
                case 0:
                    this.shapeProperties.strokeColor = this.colorPicker1.value;
                    this.shapeProperties.fillColor = this.colorPicker2.value;
                    break;
                case 1:
                    this.shapeProperties.strokeColor = this.colorPicker1.value;
                    this.shapeProperties.fillColor = false;
                    break;
                case 2:
                    this.shapeProperties.strokeColor = false;
                    this.shapeProperties.fillColor = this.colorPicker2.value;
                    break;
            
                default:
                    break;
            }
        })

        for(let toolIndex in this.manager.constraintWindow.constraints){
            toolIndex = parseInt(toolIndex);
            let tool = this.manager.constraintWindow.constraints[toolIndex];
            // console.log(this.manager.constraintWindow.constraints, too)
            this[ "tool" + tool.label] = document.createElement("button");
            this[ "tool" + tool.label].innerText = tool.label;
            this.interfaceWindow.appendChild(this[ "tool" + tool.label]);
            this[ "tool" + tool.label].addEventListener("click", () => {
                this.manager.constraintWindow.toggleActive();
                this.manager.constraintWindow.currentConstraint = toolIndex;
            })
        }
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