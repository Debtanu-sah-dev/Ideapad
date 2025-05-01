import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-preview-04-17"});
// const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});
const prompt = "Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject.";
export class AI{
    constructor(manager, model, prompt, parent){
        this.manager = manager;
        this.prompt = prompt;
        this.model = model;
        this.parent = parent;
        this.imageDataURL = {
            inlineData: {
              data: "",
              mimeType: "image/png",
            },
        };
        this.explaining = false;
        this.run = this.run.bind(this);
        this.dialog = document.createElement("dialog");
        this.dialog.classList.add("aiDialog");
        this.dialog.setAttribute("closedby", "any");
        this.parent.appendChild(this.dialog);
        // this.dialog.addEventListener("blur", () => {
            //     this.dialog.close()
            // })
        this.responseContainer = document.createElement("div");
        this.responseContainer.classList.add("responseContainer")
        this.dialog.appendChild(this.responseContainer);

        this.responseImage = document.createElement("img");
        this.responseImage.classList.add("responseImg");
        this.responseContainer.appendChild(this.responseImage);
        this.responseImage.style.width = "25vmin"

        this.responseText = document.createElement("div");
        this.responseText.innerText = `Click "Explain" to "Explain" your illustration`;
        this.responseText.classList.add("responseText");
        this.responseContainer.appendChild(this.responseText);
        this.openDialog = document.createElement("button");
        this.openDialog.addEventListener("click", () => {
            this.dialog.showModal();
        })
        this.openDialog.innerText = "AI";
        this.parent.appendChild(this.openDialog);
        this.createResponseButton = document.createElement("button");
        this.createResponseButton.classList.add("createResponseButton");
        this.createResponseButton.addEventListener("click", () => {
            this.run();
        })
        this.createResponseButton.innerText = "Explain";

        this.dialog.appendChild(this.createResponseButton);
    }
    run = async () => {
        let url = this.manager.getDataUrl();
        this.responseImage.src = url.join(",");
        this.imageDataURL.inlineData.data = url[1];
        const result = await model.generateContent([this.imageDataURL, this.prompt]);
        this.responseText.innerHTML = DOMPurify.sanitize(marked.parse(result.response.text()));
        mathRectify(this.responseText);
        Prism.highlightAllUnder(this.responseText)
    }

    createResponse(){
        this.run();
    }
}

function mathRectify(element){
    let katexError = element.querySelectorAll(".katex-error");
    katexError.forEach(e => {
        let math = e.innerText;
        let img = document.createElement("img");
        img.src = "https://latex.codecogs.com/png.latex?" + math;
        e.innerHTML = "";
        e.appendChild(img)
    });

}

class AppletManager{
    constructor(manager, model, ai, parent){
        this.ai = ai;
        this.manager = manager;
        this.model = model;
        this.parent = parent;
        this.appletButton = document.createElement("button");
        this.appletButton.innerText = "Applet";
        this.appletMenu = document.createElement("dialog");
        this.appletMenu.setAttribute("closedby", "any");
        this.appletMenu.classList.add("appletMenu")
        this.parent.appendChild(this.appletButton);
        this.parent.appendChild(this.appletMenu)
        this.appletButton.addEventListener("click", () => {
            this.appletMenu.showModal();
        })
        this.applets = [];
        this.tabContainer = document.createElement("div");
        this.tabContainer.classList.add("tabContainer")
        this.tabs = document.createElement("div");
        this.tabs.classList.add("tabs")
        this.tabContainer.appendChild(this.tabs);
        this.add = document.createElement("button");
        this.add.innerText = "+"
        this.addContainer = document.createElement("div");
        this.add.addEventListener("click", () => {
            this.applets.forEach((e) => {
                e.inactive();
            })
            this.addContainer.style.display = "initial"
        })

        this.labelInput = document.createElement("input");
        this.labelInput.type = "input";
        this.submitMetaData = document.createElement("button");
        this.submitMetaData.innerText = "Create Applet";
        this.submitMetaData.addEventListener("click", async () => {
            this.createApplet({
                label: this.labelInput.value
            })
            this.addContainer.style.display = "none";
            this.applets.forEach((e) => {
                e.inactive();
            })
            this.applets[this.applets.length - 1].active();
        })
        this.addContainer.appendChild(this.labelInput);
        this.addContainer.appendChild(this.submitMetaData)
        this.close = document.createElement("button");
        this.close.innerText = "X"
        this.close.addEventListener("click", () => {
            this.appletMenu.close();
        })

        this.tools = document.createElement("div");
        this.tools.classList.add("tools")
        this.tools.appendChild(this.add)
        this.tools.appendChild(this.close)
        this.tabContainer.appendChild(this.tools)
        this.contentContainers = [];
        this.contentContainer = document.createElement("div");
        this.contentContainer.classList.add("contentContainer");
        this.contentContainer.appendChild(this.addContainer);
        this.appletMenu.appendChild(this.tabContainer);
        this.appletMenu.appendChild(this.contentContainer);

    }

    createApplet(metaData){
        let container = document.createElement("div");
        container.dataset.applet = metaData.label;
        this.contentContainers.push(container);
        this.contentContainer.appendChild(container);
        let applet = new Applet(metaData, container)
        this.applets.push(applet);
        let tab = document.createElement("button");
        tab.innerText = metaData.label;
        tab.addEventListener("click", () => {
            this.addContainer.style.display = "none";
            this.applets.forEach((e) => {
                e.inactive();
            })
            applet.active();
        })
        this.tabs.appendChild(tab)
    }
}

class Applet{
    constructor({
        label = "Untitled",
    }, parent){
        this.label = label;
        this.parent = parent;
        this.parent.style.display = "none";
        this.parent.innerText = this.label
    }

    active(){
        this.parent.style.display = "initial"
    }

    inactive(){
        this.parent.style.display = "none"
    }
}

const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);
const appletManager = new AppletManager(Canvas, model, Ai, ai);