import { GoogleGenerativeAI} from "@google/generative-ai";
// console.log(Type);
const genAI = new GoogleGenerativeAI(API_KEY);
const generationConfig = {
    model:"gemini-2.5-flash-preview-05-20",
    // model:"gemini-2.5-pro-exp-03-25",
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
const generationConfigForRectification = {
    model:"gemini-2.5-flash-preview-05-20",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
            "type": "object",
            "properties": {
                "html": { "type": "string" },
            },
            "required": ["html"]
        }
   }
};
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-preview-05-20"});
const modelApplet = genAI.getGenerativeModel(generationConfig);
const modelRectify = genAI.getGenerativeModel(generationConfigForRectification);
const modelFast = genAI.getGenerativeModel({model: "gemini-2.5-flash-preview-05-20"});
const prompt = "Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject.";
const metaPrompt = "Explain this image and give a small summary of what is illustrated and what topic and frameworks it is based on, give description of this image giving a complete picture of the image in just 100 words altogether.";
const rectificationPrompt = `check and rectify the above code, check for any potential errors and fix it. remove any html, CSS or JavaScript comments. remove all the comments strictly. check that all CSS properties are valid else fix it, check all html tags and attributes are proper and no attribute is mixed with the tag name like:- <pid="paragraph">...</p> is wrong so make it <p id="paragraph">...</p>. In JavaScript check for any functions which are called but not defined:-Example makeGraph() is called somewhere in the entire code but is not made so write the make graph function by understanding the HTML codes context and make it so it works with the integrity of the HTML code without giving rise to another error, check for any syntax error like extra }, ), not using proper syntax etc.`;
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
        // console.log(result.response.text())
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
        this.descriptionTextarea.value = `create a solar system in 3d with all the planets and ring around saturn and moon with earth make all the planet also have their own light source to make them visible and add stars in the background, remove wireframe settings from the planets sphere, make the scene bright with accurate colors and speed`
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
        container.classList.add("applet")
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
        this.id = Math.random();
        this.label = label;
        this.description = description
        this.parent = parent;
        this.parent.style.display = "none";
        // this.parent.innerText = "Loading...";
        this.iframe = document.createElement("iframe");
        this.iframe.classList.add("appletIframe")
        // this.iframe.sandbox = "allow-scripts allow-same-origin";
        this.parent.appendChild(this.iframe)
        this.editSpace = document.createElement("div");
        this.editSpace.classList.add("editSpace")
        this.solveError = document.createElement("button");
        this.solveError.innerText = "Solve Issue";
        this.solveError.disabled = true;
        this.editInput = document.createElement("input");
        this.editInput.placeholder = "What Modification Do You Want?"
        this.editInput.classList.add("editInput")
        this.editSpace.appendChild(this.editInput);
        this.submitEdit = document.createElement("button");
        this.submitEdit.innerText = "Modify Applet"
        this.editSpace.appendChild(this.submitEdit)
        this.editSpace.appendChild(this.solveError);
        this.parent.appendChild(this.editSpace);
        let code = `<html><head></head><body><script>consolelog(2+2); prin(2+2)</script></body></html>`;
        this.appletInfo = {
            html:code
        };
        this.errors = [];
        this.iframe.loading = "lazy";
        this.submitEdit.addEventListener("click", async () => {
            if(this.submitEdit.disabled == false){
                this.submitEdit.disabled = true;
                let prompt = `${this.appletInfo.html}\nModify The above html code to include the following modification: ${this.editInput.value}. do the modification by modifying the above code to match the needed modification. do not add comments. change the fundamental working of the html code as per the modification requested. add the given modification without causing errors`
                try {
                    const rectifiedHTML = await modelRectify.generateContent([prompt]);
                    // console.log(rectifiedHTML)
                    // console.log(rectifiedHTML.response)
                    // console.log(rectifiedHTML.response.text())
                    console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = (JSON.parse(rectifiedHTML.response.text())).html
                    this.iframe.srcdoc = injectErrorHandlerIntoHTML((JSON.parse(rectifiedHTML.response.text())).html)
                } catch (e) {
                }
                this.submitEdit.disabled = false;
            }
        });
        this.solveError.addEventListener("click", async () => {
            if(this.solveError.disabled == false){
                let errorMessageList = this.errors.map(e => formatError(e)).join("\n");
                let errorInfos = `${this.appletInfo.html} \n This is the list of errors with the above HTML code fix these error without causing another error or modifying the core framework/integrity of the functioning of the code.if the errors as caused by comments remove them entirely \n ${errorMessageList}`
                console.log(errorInfos)

                this.solveError.disabled = true;
                try {
                    const rectifiedHTML = await modelRectify.generateContent([errorInfos]);
                    // console.log(rectifiedHTML)
                    // console.log(rectifiedHTML.response)
                    // console.log(rectifiedHTML.response.text())
                    console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = (JSON.parse(rectifiedHTML.response.text())).html
                    this.iframe.srcdoc = injectErrorHandlerIntoHTML((JSON.parse(rectifiedHTML.response.text())).html)
                } catch (e) {
                    this.solveError.disabled = false;
                }
            }
        })
        this.generateApplet();
        // this.iframe.src = 'javascript:void(0)';
        // this.iframe.contentWindow.document.documentElement.innerHTML = `<script>console.log(kkk)</script>`
        // this.iframe.srcdoc = injectErrorHandlerIntoHTML(code, this.id)
        this.iframeError();
        // this.iframe.srcdoc = `<script>setTimeout(() => {console.log(kkk)}, 2000);</script>`
    }

    generateApplet = async () => {
        let metaPrompt = await Ai.giveMetaPrompt();
        console.log(metaPrompt)
        let url = Ai.manager.getDataUrl();
        Ai.responseImage.src = url.join(",");
        Ai.imageDataURL.inlineData.data = url[1];
        let recipePrompt = `Create a step by step guide to Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and if necessary use p5.js. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${metaPrompt}. Give detailed step by step guide. give the architecture of the functioning of the i.e. the process on which the html code is working, for example:- for creating a to do list you can show the architecture as such:- task class with properties as task_text and status. task manager class which handles status of tasks. also provide structure of UI to be follow and the basic underlying design of the web page. for example:- for a to do list create a section with a text_input and a add button to add tasks. a section below it to search tasks and a section below it which has the list of tasks sorted from latest to oldest. a select option on the other side of the search section to change sorting of the list of tasks such as date created, important, A to Z or Z to A and etc. make the tutorial friendly for a beginner to advanced programmer. add all the minute details. focus on implementation more. if maths or physics is required also explain the mathematics or the physics to solve the problems and sub-problems. Do not write the code your self as this is an exercise to the person reading your tutorial. use code snippets to only enhance implementation process and understanding purposes in javascript. use code snippets only when needed do not give code snippets for css or html. do not tell to create index.html files or give tutorial regarding creating the files or making the web page responsive. do not give additional cdn's for p5 but you can give for other script's and css's cdns used. do not suggest to create any other files or folders because the html code should be independent of the file structure around it because where the code is being used you don't have access to file system, although you can use http links but avoid as much as possible for media and stuff only use for cdns`;
        let recipe = await model.generateContent([structuredClone(Ai.imageDataURL), recipePrompt]);
        let recipeText = recipe.response.text();
        console.log(recipeText)
        let fullPrompt = `Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and if necessary use p5.js, use this cdn for p5.js, <script src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"></script>. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${metaPrompt}.Give a description and title to the HTML code. the inputs or input fields used should be listed with the appropriate type instead of using default input tags in html or p5 use this tag:- <input id = "{id of the input}" type="{type of the input}"/> and give a label to that input. Please provide a JSON object with the following fields: 'title', 'description', 'html', and 'inputs'. Each input should be an object with 'id', 'label', and 'type' properties. This should be a full body interface not bounded in a container div and *Do not add any comments in the code especially js*. don't add any comments it is a strict warning, format the html code properly with lines and indentations
${rectificationPrompt}

Follow the following tutorial/step-by-step guide to build the HTML code:-
${recipeText}`;
        console.log(fullPrompt)
        // console.log(Ai.imageDataURL)
        // console.log(genAI);
        const result = await modelApplet.generateContent([structuredClone(Ai.imageDataURL), fullPrompt]);
        // console.log(result.response.text())
        // console.log(JSON.parse(result.response.text()))
        console.log(JSON.parse(result.response.text()).html)
        // this.parent.innerText = result.response.text();
        // const rectifiedHTML = await modelRectify.generateContent([`${JSON.parse(result.response.text()).html}${rectificationPrompt}`])

        this.appletInfo = JSON.parse(result.response.text())
        // this.appletInfo.html = JSON.parse(result.response.text()).html;
        this.iframe.srcdoc = injectErrorHandlerIntoHTML(JSON.parse(result.response.text()).html, this.id);
        console.log(JSON.parse(result.response.text()).html)
    }

    iframeError(){
        window.addEventListener('message', (event) => {
            if (event.data.type !== 'iframe-error'){return;}
            if (event.data.id !== this.id){return;}
            console.error('Iframe error:', event.data);
            this.solveError.disabled = false;
            this.errors.push(event.data)
        });
        // this.iframe.onload = () => {
        //     let cWindow = this.iframe.contentWindow;

        //     cWindow.onerror = (message, source, lineno, colno, error) => {
        //         console.error('Caught error from iframe:', {
        //             message,
        //             source,
        //             lineno,
        //             colno,
        //             error
        //           });
        //           return true;            
        //     }
        // }
    }

    active(){
        this.parent.style.display = "flex"
    }

    inactive(){
        this.parent.style.display = "none"
    }
}

function injectErrorHandlerIntoHTML(htmlContent, id) {
  const errorHandlerScript = `
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        parent.postMessage(
          { type: 'iframe-error', message, source, lineno, colno, error: error && error.stack, id:${id} },
          '*'
        );
      };
    <\/script>
  `;

  // Check if it's a full HTML document (starts with <!DOCTYPE> or <html>)
  const lower = htmlContent.toLowerCase();

  if (lower.includes('<html')) {
    // Inject inside <head> if possible
    if (lower.includes('<head')) {
      return htmlContent.replace(/<head[^>]*>/i, (match) => `${match}\n${errorHandlerScript}`);
    } else {
      // Otherwise inject just after <html>
      return htmlContent.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${errorHandlerScript}</head>`);
    }
  } else {
    // It's a fragment — just prepend our error handler
    return `${errorHandlerScript}\n${htmlContent}`;
  }
}

function formatError(e){
    return `${e.message}:- at line number(${e.lineno}) and column number(${e.colno}) that is ${e.error.replace(/\n/g, " ")}))`
}

const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);
const appletManager = new AppletManager(Canvas, model, Ai, ai);