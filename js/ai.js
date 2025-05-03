import { GoogleGenerativeAI} from "@google/generative-ai";
// console.log(Type);
const genAI = new GoogleGenerativeAI(API_KEY);
const generationConfig = {
    model:"gemini-2.5-flash-preview-04-17",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
            "type": "object",
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "html": { "type": "string" },
    "inputs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "label": { "type": "string" },
          "type": {
            "type": "string",
            "enum": [
              "button", "checkbox", "color", "date", "datetime-local",
              "email", "file", "hidden", "image", "month", "number",
              "password", "radio", "range", "reset", "search", "submit",
              "tel", "text", "time", "url", "week"
            ]
          }
        },
        "required": ["id", "label", "type"]
      }
    }
  },
  "required": ["title", "description", "html", "inputs"]
          }
    }
  };
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-preview-04-17"});
const modelApplet = genAI.getGenerativeModel(generationConfig);
const modelFast = genAI.getGenerativeModel({model: "gemini-2.5-flash-preview-04-17"});
const prompt = "Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject.";
const metaPrompt = "Explain this image and give a small summary of what is illustrated and what topic and frameworks it is based on, give description of this image giving a complete picture of the image in just 100 words altogether.";
const inputType = [
    "button",
    "checkbox",
    "color",
    "date",
    "datetime-local",
    "email",
    "file",
    "hidden",
    "image",
    "month",
    "number",
    "password",
    "radio",
    "range",
    "reset",
    "search",
    "submit",
    "tel",
    "text",
    "time",
    "url",
    "week"
    ];

    console.log(inputType.length)
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
        this.giveMetaPrompt = this.giveMetaPrompt.bind(this);
        this.dialog = document.createElement("dialog");
        this.dialog.classList.add("aiDialog");
        this.dialog.setAttribute("closedby", "any");
        this.parent.appendChild(this.dialog);
        // this.dialog.addEventListener("blur", () => {
            //     this.dialog.close()
            // })
        this.responseContainer = document.createElement("div");
        this.responseContainer.classList.add("responseContainer")
        this.close = document.createElement("button");
        this.close.innerText = "X";
        this.close.addEventListener("click", () => {
            this.dialog.close();
        })
        this.dialog.appendChild(this.close);
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
            this.giveMetaPrompt();
        })
        this.createResponseButton.innerText = "Explain";

        this.dialog.appendChild(this.createResponseButton);
    }
    run = async () => {
        let url = this.manager.getDataUrl();
        this.responseImage.src = url.join(",");
        this.imageDataURL.inlineData.data = url[1];
        const result = await model.generateContent([structuredClone(this.imageDataURL), this.prompt]);
        this.responseText.innerHTML = DOMPurify.sanitize(marked.parse(result.response.text()));
        mathRectify(this.responseText);
        Prism.highlightAllUnder(this.responseText)
    }

    createResponse(){
        this.run();
    }

    giveMetaPrompt = async () => {
        let url = this.manager.getDataUrl();
        this.responseImage.src = url.join(",");
        this.imageDataURL.inlineData.data = url[1];
        const result = await modelFast.generateContent([structuredClone(this.imageDataURL), metaPrompt]);
        console.log(result.response.text())
        return result.response.text();
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
        this.descriptionTextarea = document.createElement("textarea");
        this.descriptionTextarea.value = `create a calculator which calculates the  number of digits of any number's factorial`
        this.submitMetaData = document.createElement("button");
        this.submitMetaData.innerText = "Create Applet";
        this.submitMetaData.addEventListener("click", async () => {
            this.createApplet({
                label: this.labelInput.value,
                description: this.descriptionTextarea.value
            })
            this.addContainer.style.display = "none";
            this.applets.forEach((e) => {
                e.inactive();
            })
            this.applets[this.applets.length - 1].active();
        })
        this.addContainer.appendChild(this.labelInput);
        this.addContainer.appendChild(this.descriptionTextarea);
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
        description = "Use the image for guidance"
    }, parent){
        this.label = label;
        this.description = description
        this.parent = parent;
        this.parent.style.display = "none";
        this.parent.innerText = "Loading...";
        this.generateApplet();
    }

    generateApplet = async () => {
        let metaPrompt = await Ai.giveMetaPrompt();
        let fullPrompt = `Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and if necessary use p5.js, to use p5.js add the script:- <script data-p></script> before the internal JavaScript. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${metaPrompt}.Give a description and title to the HTML code. the inputs or input fields used should be listed with the appropriate type instead of using default input tags in html or p5 use this tag:- <input id = "{id of the input}" type="{type of the input}"/> and give a label to that input. Please provide a JSON object with the following fields: 'title', 'description', 'html', and 'inputs'. Each input should be an object with 'id', 'label', and 'type' properties. This should be a full body interface not bounded in a container div and *Do not add any comments in the code especially js*. don't add any comments it is a strict warning, format the html code properly with lines and indentations`
        let url = Ai.manager.getDataUrl();
        Ai.responseImage.src = url.join(",");
        Ai.imageDataURL.inlineData.data = url[1];
        // console.log(fullPrompt)
        // console.log(Ai.imageDataURL)
        // console.log(genAI);
        const result = await modelApplet.generateContent([structuredClone(Ai.imageDataURL), fullPrompt]);
        // console.log(result.response.text())
        // console.log(JSON.parse(result.response.text()))
        console.log(JSON.parse(result.response.text()).html)
        this.parent.innerText = result.response.text();
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