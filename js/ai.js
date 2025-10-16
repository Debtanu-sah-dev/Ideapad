import { GoogleGenerativeAI} from "@google/generative-ai";
// console.log(Type);
const genAI = new GoogleGenerativeAI(API_KEY);
const generationConfig = {
    model:"gemini-2.5-flash",
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
    model:"gemini-2.5-flash",
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
const generationConfigForDiagram = {
    model:"gemini-2.5-flash",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
            "type": "object",
            "properties": {
                "svg": { "type": "string" },
            },
            "required": ["svg"]
        }
   }
};
const generationConfigForQuiz = {
    model:"gemini-2.5-flash",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
  "type": "object",
  "properties": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "mcq",
              "short",
              "long",
              "mcqms"
            ]
          },
          "drawing": {
            "type": "boolean"
          },
          "diagram": {
            "type": "boolean"
          },
          "data": {
            "type": "object",
            "properties": {
              "diagramSvg": {
                "type": "string"
              },
              "question": {
                "type": "string"
              },
              "answer": {
                "type": "object",
                "properties": {
                  "options": {
                    "type": "object",
                    "properties": {
                      "option1": {
                        "type": "string"
                      },
                      "option2": {
                        "type": "string"
                      },
                      "option3": {
                        "type": "string"
                      },
                      "option4": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "option1",
                      "option2",
                      "option3",
                      "option4"
                    ],
                    "propertyOrdering": [
                      "option1",
                      "option2",
                      "option3",
                      "option4"
                    ]
                  },
                  "answer_key": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "option1",
                        "option2",
                        "option3",
                        "option4"
                      ]
                    }
                  }
                },
                "required": [
                  "options",
                  "answer_key"
                ],
                "propertyOrdering": [
                  "options",
                  "answer_key"
                ]
              },
              "hint": {
                "type": "string"
              }
            },
            "required": [
              "question",
              "hint"
            ],
            "propertyOrdering": [
              "diagramSvg",
              "question",
              "answer",
              "hint"
            ]
          }
        },
        "required": [
          "type",
          "drawing",
          "diagram",
          "data"
        ],
        "propertyOrdering": [
          "type",
          "drawing",
          "diagram",
          "data"
        ]
      }
    },
    "title": {
      "type": "string"
    }
  },
  "required": [
    "questions",
    "title"
  ],
  "propertyOrdering": [
    "questions",
    "title"
  ]
}
   }
};
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
const modelApplet = genAI.getGenerativeModel(generationConfig);
const modelRectify = genAI.getGenerativeModel(generationConfigForRectification);
const modelDiagram = genAI.getGenerativeModel(generationConfigForDiagram);
const modelQuiz = genAI.getGenerativeModel(generationConfigForQuiz);
const modelFast = genAI.getGenerativeModel({model: "gemini-2.5-flash-lite"});
const prompt = "Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject.";
const metaPrompt = "Explain this image and give a small summary of what is illustrated and what topic and frameworks it is based on, give description of this image giving a complete picture of the image in just 100 words altogether.";
const rectificationPrompt = `check and rectify the above code, check for any potential errors and fix it. remove any html, CSS or JavaScript comments. remove all the comments strictly. check that all CSS properties are valid else fix it, check all html tags and attributes are proper and no attribute is mixed with the tag name like:- <pid="paragraph">...</p> is wrong so make it <p id="paragraph">...</p>. In JavaScript check for any functions which are called but not defined:-Example makeGraph() is called somewhere in the entire code but is not made so write the make graph function by understanding the HTML codes context and make it so it works with the integrity of the HTML code without giving rise to another error, check for any syntax error like extra }, ), not using proper syntax etc.`;
const diagramPrompt = "\n\nCreate a svg code using the above context which is of flat design paradigm, with a suitable background color and if and only if specified in the following then only do animation using either css or native animation tags in svg and if there is animation mentioned after the entire animation sequence is completed it should loop like a gif but strictly do not use animation until it is specified in the following and do not apply style to any element outside the svg like body, head, html etc. or change anything in the :root selector structure your code such that you don't use any class attribute to reference elements in css, work with data-types or ids,therefore create a svg representing the following in it: ";
const quizPrompt = "Make a quiz of 10 questions on {{}} in which you have many types of quesstion mixed together like mcq(only one correct answer), long(long text answer no options), short(short text answer no answer), mcqms(multiple correct answer), you ahev two flags when designing each question one is drawing which means along with the format of question te user can also submit a sketch as an attachment with the answer, you have another flag which is of diagram in this you can create a svg image following the following criteria, flat design paradigm, with a suitable background color and if and only if needed then only do animation using either css or native animation tags in svg and if there is animation mentioned after the entire animation sequence is completed it should loop like a gif but strictly do not use animation until it is needed and do not apply style to any element outside the svg like body, head, html etc. or change anything in the :root selector structure your code such that you don't use any class attribute or tag names to reference elements in css, work with data-types or ids. if you are choosing to add a svg diagram then provide the svg code only in the diagramSvg part but if the diagram flag is false do not put the diagramSvg key-value pair in the object, but if diagram flag is true then you have to provide it. for long and short answer type question do not put the answer object in data as it is only required for mcq and mcqms. so do not provide options and answer-key strictly"
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

class ImageDataBlob{
  constructor(dataUrl){
    return {
            inlineData: {
              data: dataUrl.split(",")[1],
              mimeType: "image/png",
            },
        }
  }
}

async function searchWikimediaImages(description) {
      // const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(description)}&gsrlimit=12&prop=imageinfo&iiprop=url&format=json&origin=*`;
      // const res = await fetch(apiUrl);
      // const data = await res.json();
      // const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=allimages&gsrsearch=${encodeURIComponent(description)}&gsrnamespace=6&gsrlimit=10&aiprop=url|mime&format=json&origin=*`;
      // const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(description)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;
      // const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(description)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=500&format=json&origin=*&iimime=video%2Fmp4%2Capplication%2Fpdf%2Capplication%2Foctet-stream%2Capplication%2Fzip%2Capplication%2Fmsword%2Capplication%2Fvnd.ms-excel%2Capplication%2Fvnd.ms-powerpoint%2Capplication%2Fmsaccess%2Capplication%2Fmsproject%2Capplication%2Fmsword%2Capplication%2Frtf%2Capplication%2Fxml%2Capplication%2Fjson%2Capplication%2Fjavascript%2Capplication%2Fx-shockwave-flash%2Capplication%2Fvnd.ms-excel%2Capplication%2Fvnd.ms-powerpoint%2Capplication%2Fvnd.ms-access%2Capplication%2Fvnd.ms-project%2Capplication%2Fvnd.ms-word%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fx-rtf%2Capplication%2Fx-xml%2Capplication%2Fx-json%2Capplication%2Fx-javascript%2Capplication%2Fx-shockwave-flash%2Capplication%2Fx-ms-excel%2Capplication%2Fx-ms-powerpoint%2Capplication%2Fx-ms-access%2Capplication%2Fx-ms-project%2Capplication%2Fx-ms-word%2Capplication%2Fx-zip-compressed%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication%2Fx-msaccess%2Capplication%2Fx-msproject%2Capplication%2Fx-msword%2Capplication%2Fzip%2Capplication%2Fx-7z-compressed%2Capplication%2Fx-rar-compressed%2Capplication%2Fx-tar%2Capplication%2Fgzip%2Capplication%2Fx-bzip2%2Capplication%2Fx-xz%2Capplication%2Fx-msdownload%2Capplication%2Fx-msi%2Capplication::contentReference[oaicite:10]{index=10}`;
      let terms = description.toLowerCase().split(",").map(e => e.trim());
      let datas = [];
      for(let term of terms){
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(term.toLowerCase())}&origin=*`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        datas.push(data);
      }
      let pages = datas.map(e => e[1])
      let allpages = [];
      for(let page of pages){
          allpages = [...allpages, ...page]
      }
      // let urls = [];
      // let pages = [];
      // for(let info of Object.values(data.query.search)){
      //     pages.push(info.title)
      // }
      // https://en.wikipedia.org/w/api.php?action=query&pageids=${encodeURIComponent(data)}&generator=images&prop=imageinfo&iiprop=url|dimensions|mime&format=json
      // let datas2 = [];
      let urls = []
      for(let page of allpages){
        const apiUrl2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page)}&generator=images&prop=imageinfo&iiprop=url|dimensions|mime&format=json&origin=*`;
        const res2 = await fetch(apiUrl2);
        const data2 = await res2.json();
        // datas2.push(data2)
        console.log(data2)
        if((data2.query == null) || (data2.query.pages == null)){
          continue;
        }
        let arr = Object.values(data2.query.pages).filter(e => {
        if(e.title.toLowerCase().includes("ui_icon")){
            return false
        }
        if(e.title.toLowerCase().includes("wiki") && (page.toLowerCase().includes("wiki") == false)){
            return false
        }
        if(e.title.toLowerCase().match(/commons[\- \_]logo/g) != null){
            return false
        }
        if(e.title.toLowerCase().includes("symbol")){
            return false
        }
        if(e.title.toLowerCase().includes("clipart")){
            return false
        }
        if(e.title.toLowerCase().includes("translate")){
            return false
        }
        if(e.imagerepository == "local"){
            return false
        }
        return true
    })
        for(let info of arr){
            urls.push(info.imageinfo[0].url)
        }
      }
// for(let info of Object.values(data2.query.pages)){
//   if(info.thumbnail != null){
//     urls.push(info.thumbnail.source)
//   }
// }
return [allpages, urls];
      // if (!data.query) return [];
      // const pages = Object.values(data.query.pages);
      // return data;
      // return pages
      //   .map(p => ({
      //     title: p.title,
      //     url: p.imageinfo?.[0]?.url
      //   }))
      //   .filter(p => !!p.url);
    }
export class AI{
    constructor(manager, model, prompt, parent){
        this.manager = manager;
        this.prompt = prompt;
        this.model = model;
        this.parent = parent;
        this.response = null;
        this.imageDataURL = {
            inlineData: {
              data: "",
              mimeType: "image/png",
            },
        };
        this.explaining = false;
        this.run = this.run.bind(this);
        this.giveMetaPrompt = this.giveMetaPrompt.bind(this);
        this.createDiagram = this.createDiagram.bind(this);
        this.createImageQuery = this.createImageQuery.bind(this);
        this.dialog = document.createElement("dialog");
        this.dialog.classList.add("aiDialog");
        this.dialog.setAttribute("closedby", "any");
        this.parent.appendChild(this.dialog);
        this.diagramDialog = document.createElement("dialog");
        this.diagramDialog.classList.add("aiDialog");
        this.diagramDialog.classList.add("diagramDialog");
        this.diagramDialog.setAttribute("closedby", "any");
        this.parent.appendChild(this.diagramDialog);
        this.imagesDialog = document.createElement("dialog");
        this.imagesDialog.classList.add("aiDialog");
        this.imagesDialog.classList.add("imagesDialog");
        // TO-DO:remove closedby any
        this.imagesDialog.setAttribute("closedby", "any");
        this.imagesSearch = document.createElement("div");
        this.imagesSearch.classList.add("imagesSearch");
        this.imagesSearchInput = document.createElement("input");
        this.imagesSearchInput.classList.add("imagesSearchInput");
        this.imagesSearchInput.placeholder = "What image do you want? type here";
        this.imagesSearchButton = document.createElement("button");
        this.imagesSearchButton.classList.add("button");
        this.imagesSearchButton.innerText = "image search"
        this.imagesSearch.appendChild(this.imagesSearchInput);
        this.imagesSearch.appendChild(this.imagesSearchButton);
        this.imagesDialog.appendChild(this.imagesSearch);
        this.imagesContainer = document.createElement("div");
        this.imagesContainer.classList.add("imagesContainer");
        this.imagesDialog.appendChild(this.imagesContainer);
        this.parent.appendChild(this.imagesDialog);
        this.canQueryImage = true;
        this.imagesSearchButton.addEventListener("click", async () => {
          this.imagesContainer.innerHTML = "";
          if (this.canQueryImage) {
            this.imagesSearchButton.disabled = true;
            this.canQueryImage = false;
            let matchingImages = await searchWikimediaImages(this.imagesSearchInput.value.trim());
            this.canQueryImage = true;
            this.populateImages(matchingImages);
            this.imagesSearchButton.disabled = false;
          }
        })
        this.manager.selectionInterface.imageBob.addEventListener("click", async () => {
          this.imagesContainer.innerHTML = ""
          this.imagesDialog.showModal();
          if(this.canQueryImage){
            this.imagesSearchButton.disabled = true;
            this.canQueryImage = false;
            let matchingImages = await this.createImageQuery(this.manager.getDataUrlFromSubset(this.manager.selectionInterface.selectedObjects).join(","));
            this.canQueryImage = true;
            console.log(matchingImages)
            this.populateImages(matchingImages[0]);
            this.imagesSearchInput.value = matchingImages[1];
            this.imagesSearchButton.disabled = false;
          }
        })
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
        this.closeDiagram = document.createElement("button");
        this.closeDiagram.innerText = "X";
        this.closeDiagram.classList.add("closeDiagram")
        this.closeDiagram.addEventListener("click", () => {
            this.diagramDialog.close();
        })
        this.diagramDialog.appendChild(this.closeDiagram)
        this.dialog.appendChild(this.close);
        this.dialog.appendChild(this.responseContainer);

        this.responseImage = document.createElement("img");
        this.responseImage.classList.add("responseImg");
        this.responseContainer.appendChild(this.responseImage);
        // this.responseImage.style.width = "25vmin"

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
        this.canRespond = true;
        this.canDiagram = true;
        this.createResponseTools = document.createElement("div");
        this.createResponseTools.classList.add("createResponseTools")
        this.createResponseButton = document.createElement("button");
        this.createDiagramButton = document.createElement("button");
        this.openDiagramButton = document.createElement("button");
        this.responseInput = document.createElement("input");
        this.responseInput.placeholder = "Ask anything or create a diagram";
        this.createResponseButton.classList.add("createResponseButton");
        this.createDiagramButton.classList.add("createDiagramButton");
        this.openDiagramButton.classList.add("openDiagramButton");
        this.responseInput.classList.add("responseInput");
        this.createResponseButton.addEventListener("click", async () => {
            if((this.canRespond == true) && (this.canDiagram == true)){
                this.createResponseButton.disabled = true;
                this.createDiagramButton.disabled = true;
                this.canRespond = false;
                this.canDiagram = false;
                try {
                  await this.run();
                } catch (error) {
                  console.error(error);
                }
                this.createResponseButton.disabled = false;
                this.createDiagramButton.disabled = false;
                this.canRespond = true;
                this.canDiagram = true;
            }
        })
        this.createDiagramButton.addEventListener("click", async () => {
            console.log("clicked", this.canDiagram, this.canRespond)
            if((this.canRespond == true) && (this.canDiagram == true)){
                this.createResponseButton.disabled = true;
                this.createDiagramButton.disabled = true;
                this.canRespond = false;
                this.canDiagram = false;
                console.log("suc")
                try {
                  await this.createDiagram(this.responseInput.value);
                } catch (error) {
                  console.error(error)
                }
                this.createResponseButton.disabled = false;
                this.createDiagramButton.disabled = false;
                this.canRespond = true;
                this.canDiagram = true;
            }
            this.diagramDialog.showModal();
            let svgs = this.scrollableDiv.querySelectorAll("div");
            let lastSvg = svgs[svgs.length - 1];
            if(lastSvg){
                lastSvg.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        })
        this.openDiagramButton.addEventListener("click", () => {
            this.diagramDialog.showModal();
            for(let svg of this.scrollableDiv.querySelectorAll("svg")){
              svg.innerHTML += "";
            }
            let svgs = this.scrollableDiv.querySelectorAll("div");
            let lastSvg = svgs[svgs.length - 1];
            if(lastSvg){
                lastSvg.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        })
        this.createDiagramButton.disabled = true;
        this.createResponseButton.innerText = "Explain";
        this.createDiagramButton.innerText = "Diagram";
        this.openDiagramButton.innerText = "Gallery";

        this.createResponseTools.appendChild(this.responseInput);
        this.createResponseTools.appendChild(this.openDiagramButton);
        this.createResponseTools.appendChild(this.createDiagramButton);
        this.createResponseTools.appendChild(this.createResponseButton);
        this.dialog.appendChild(this.createResponseTools);

        this.scrollableDiv = document.createElement("div");
        this.scrollableDiv.classList.add("scrollableDiv")
        this.diagramDialog.appendChild(this.scrollableDiv)
    }
    run = async () => {
        let url = this.manager.getDataUrl();
        this.responseImage.src = url.join(",");
        this.imageDataURL.inlineData.data = url[1];
        const result = await model.generateContent([structuredClone(this.imageDataURL), `${this.prompt} ${this.responseInput.value != "" ? ("\nGive importance to the following: " + this.responseInput.value): ""}`]);
        this.response = result.response.text();
        this.responseText.innerHTML = DOMPurify.sanitize(marked.parse(result.response.text())).replace(/\[object Object\]/ig, "");
        mathRectify(this.responseText);
        Prism.highlightAllUnder(this.responseText)
    }

    createDiagram = async (text) => {
        if((this.response != null)){
            let url = this.manager.getDataUrl();
            this.responseImage.src = url.join(",");
            this.imageDataURL.inlineData.data = url[1];
            const result = await modelDiagram.generateContent([structuredClone(this.imageDataURL),this.response + diagramPrompt + text]);
            console.log(JSON.parse(result.response.text()).svg);
            let div = document.createElement("div");
            div.innerHTML = JSON.parse(result.response.text()).svg;
            let image = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(JSON.parse(result.response.text()).svg)}`
            this.scrollableDiv.appendChild(div);
            let imageAddButton = document.createElement("button");
            imageAddButton.innerText = "Insert Image";
            iconify(imageAddButton)
            div.insertBefore(imageAddButton, div.firstChild);
            imageAddButton.addEventListener("click", () => {
              console.log(image, "success")
              this.diagramDialog.close();
              this.dialog.close()
              let rect = new Shape("rectangle", this.manager.canvasCtx, this.manager.shapeProperties, null, this.manager, image);
              rect.image.onload = () => {
                this.manager.render();
                rect.geometryInfo.height = this.manager.canvasElement.width/2*(rect.image.naturalHeight/rect.image.naturalWidth);
                this.manager.selectionInterface.select();
                if(this.manager.canvasCustomizationInterface.touchscreenInterface){
                    this.manager.canvasCustomizationInterface.touchscreenInterface.innerHTML = "";
                    this.manager.canvasCustomizationInterface.touchscreenInterface.innerText = "unselect";
                    // this.pan.querySelector("span").innerText = "do_not_touch"
                    iconify(this.manager.canvasCustomizationInterface.touchscreenInterface)
                }
                this.manager.selectionInterface.selectedObjects = [rect];
                this.manager.selectionInterface.editStageConverter();
              }
              rect.shapeEditor.killEditor();
              rect.geometryInfo = {
                rotation:0,
                width: this.manager.canvasElement.width/2,
                height: this.manager.canvasElement.width/2*(rect.image.naturalHeight/rect.image.naturalWidth),
                x:(-1) *this.manager.translation.x,
                y:(-1) * this.manager.translation.y
              };
              this.manager.strokes.push(rect);
            })
        }
    }

    createImageQuery = async (dataurl) => {
      let getInfo = await this.giveMetaPrompt(false, new ImageDataBlob(dataurl), `
You are assisting in a reverse image search using Wikimedia Commons.

Your task is to generate search-friendly keyword based on the image.
The keywords must describe what the image *is* or *represents* — not its colors, emotions, or style.

Follow these exact rules:
- Only output Wikimedia-compatible search keywords.
- Focus on what the image depicts, represents, or resembles (e.g. "solar panel", "map", "car engine diagram", "cat", "temple", "galaxy", "city skyline").
- If it looks like an object, specify which object it is or what class/type of object it could be.
- If it is a diagram, specify the diagram type (e.g. "circuit diagram", "flowchart", "architecture plan").
- If it is related to a location, include possible place or landmark type (e.g. "mountain landscape", "Indian temple", "ancient ruins").
- If it has a distinct context like "logo", "symbol", or "illustration", include that too.
- Avoid artistic terms, color references, abstract concepts, or descriptions like "beautiful", "dark", or "realistic".
- Output ONLY a single keyword, no sentences or explanations.
- if it is a physics diagram then only tell what part of physics it represent
- be specific do not give broad keyword if the image shows a parabola then do not give keywords like functions polynomial, instead give keywords like Parabola, quadratic curve etc.
- think of as if you were to search a similar looking image what would you search
- If the image is about for example projectile motion then only give, (Projectile Motion, Projectile 2D, Kinematics)
- Only give a single keyword which best describes the contents of the image and a keyword which when put in a search engine will provide what the image is showing in essence
- If it describes something specific then give that as a keyword ex.(Google, Atwood Machine, Double pendulum, Fourier Transform etc.)
- If you know title of a specific wikipedia page which is exactly what the image is representing give that instead ex.(For image of right angle with sides labelled as a, b, c and maybe with an identity then give Pythagorean Theorem).
- If it is a mathematical diagram or a physics diagram or a chemistry diagram then reference the exact wikipedia keyword/title which refers to that.
- If it is a geometrical construction then specify which geometrical construction ex.(Angle bisection, perpendicular bisector, Basic proportionality theorem etc.)

Example outputs:
- "Full adder"
- "India Temple"
- "solar system"
- "neuroscience"
`);
      console.log(getInfo)
      let images = await searchWikimediaImages(getInfo);
      return [images, getInfo];
    }

    createResponse(){
        this.run();
    }

    populateImages(matchingImages){
      for(let image of matchingImages[1]){
        let card = document.createElement("div");
        let img = document.createElement("img");
        img.src = image;
        card.appendChild(img)
        let button = document.createElement("button");
        button.innerText = "Insert Image";
        iconify(button)
        card.appendChild(button);
        button.addEventListener("click", () => {
          this.imagesDialog.close();
          let selectedObjects = this.manager.selectionInterface.selectedObjects;
          let rect = new Shape("rectangle", this.manager.canvasCtx, this.manager.shapeProperties, null, this.manager, image);
          rect.image.onload = () => {
            this.manager.render();
          }
          rect.shapeEditor.killEditor();
          rect.geometryInfo = {};
          rect.geometryInfo.rotation = this.manager.selectionInterface.initialEditorConfig.rotation;
          if(this.manager.selectionInterface.editorContainer.offsetWidth < this.manager.selectionInterface.editorContainer.offsetHeight){
            rect.geometryInfo.width = this.manager.selectionInterface.editorContainer.offsetWidth;
            rect.geometryInfo.height = this.manager.selectionInterface.editorContainer.offsetWidth*(img.naturalHeight/img.naturalWidth);
          }
          else{
            rect.geometryInfo.height = this.manager.selectionInterface.editorContainer.offsetHeight;
            rect.geometryInfo.width = this.manager.selectionInterface.editorContainer.offsetHeight*(img.naturalWidth/img.naturalHeight);
          }
          rect.geometryInfo.x = this.manager.selectionInterface.editorContainer.offsetLeft - this.manager.translation.x - this.manager.selectionInterface.editorContainer.offsetWidth/2;
          rect.geometryInfo.y = this.manager.selectionInterface.editorContainer.offsetTop - this.manager.translation.y - this.manager.selectionInterface.editorContainer.offsetHeight/2;
          this.manager.strokes.push(rect)
          this.manager.selectionInterface.selectedObjects = [rect];
          this.manager.selectionInterface.refresh();
        })
        img.addEventListener("error", () => {
          this.imagesContainer.removeChild(card);
        })
        this.imagesContainer.appendChild(card);
      }
    }

    giveMetaPrompt = async (mockupMode = false, imageBlob = null, prompt) => {
        let blob = {};
        if(imageBlob == null){
          let url = this.manager.getDataUrl();
          this.responseImage.src = url.join(",");
          this.imageDataURL.inlineData.data = url[1];
          blob = structuredClone(this.imageDataURL);
        }
        else{
          blob = imageBlob
        }
        const result = await modelFast.generateContent([blob, (prompt == null ? metaPrompt : prompt) + (mockupMode? "Along with that explain this image in the view of web design as this is a mockup of a webpage/ web-application as well.":"")]);
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
        this.add = document.createElement("button");
        this.add.innerText = "+"
        this.addContainer = document.createElement("div");
        this.addContainerWrapper = document.createElement("div")
        this.submitWrapper = document.createElement("div")
        this.add.addEventListener("click", () => {
            this.applets.forEach((e) => {
                e.inactive();
            })
            this.addContainer.style.display = "flex"
        })

        this.labelInput = document.createElement("input");
        this.labelInput.type = "input";
        this.labelInput.placeholder = "Title"
        this.descriptionTextarea = document.createElement("textarea");
        // this.descriptionTextarea.value = `create a solar system in 3d with all the planets and ring around saturn and moon with earth make all the planet also have their own light source to make them visible and add stars in the background, remove wireframe settings from the planets sphere, make the scene bright with accurate colors and speed`
        this.descriptionTextarea.placeholder = `Describe your applet. Ex. create a solar system in 3d`
        this.mockupModeLabel = document.createElement("label");
        this.mockupModeLabel.innerText = "Mockup Mode";
        this.mockupModeLabel.setAttribute("for", "mockupModeRadio")
        this.mockupMode = document.createElement("input");
        this.mockupMode.type = "checkbox"
        this.mockupMode.id = "mockupModeRadio"
        this.submitMetaData = document.createElement("button");
        this.submitMetaData.innerText = "Create Applet";
        this.submitMetaData.addEventListener("click", async () => {
            if(this.labelInput.value.length > 0){
                this.createApplet({
                    label: this.labelInput.value,
                    description: this.descriptionTextarea.value,
                    mockupMode:this.mockupMode.checked == true ?  true : false
                })
                this.addContainer.style.display = "none";
                this.applets.forEach((e) => {
                    e.inactive();
                })
                this.applets[this.applets.length - 1].active();
            }
            else{
                alert("Enter a name for your applet")
            }
        })
        this.addContainerWrapper.appendChild(this.labelInput);
        this.addContainerWrapper.appendChild(this.descriptionTextarea);
        this.submitWrapper.appendChild(this.mockupModeLabel);
        this.submitWrapper.appendChild(this.mockupMode);
        this.submitWrapper.appendChild(this.submitMetaData);
        this.addContainerWrapper.appendChild(this.submitWrapper);
        this.addContainer.appendChild(this.addContainerWrapper);
        this.close = document.createElement("button");
        this.close.innerText = "X"
        this.close.addEventListener("click", () => {
            this.appletMenu.close();
        })

        this.tools = document.createElement("div");
        this.tools.classList.add("tools")
        this.tools.appendChild(this.add)
        this.tools.appendChild(this.close)
        this.tabContainer.appendChild(this.tabs);
        this.tabContainer.appendChild(this.tools);
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
        description = "Use the image for guidance",
        mockupMode = false
    }, parent){
        this.id = Math.random();
        this.label = label;
        this.description = description;
        this.mockupMode = mockupMode;
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
        this.versionControlOpen = document.createElement("button");
        this.versionControlOpen.innerText = "Versions";
        this.versionWindow = document.createElement("dialog");
        this.versionWindow.classList.add("versionWindow")
        this.versionWindow.setAttribute("closedby", "any");
        this.versionClose = document.createElement("button");
        this.versionClose.innerText = "X"
        this.versionWindow.appendChild(this.versionClose)
        this.parent.appendChild(this.versionWindow)
        this.editSpace.appendChild(this.versionControlOpen);
        this.versionControlOpen.addEventListener("click", () => {
            this.versionWindow.showModal();
        })
        this.versionClose.addEventListener("click", () => {
            this.versionWindow.close();
        })
        this.versionWindowInterface = document.createElement("div");
        this.versionWindow.appendChild(this.versionWindowInterface)
        let code = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Falling Sand Simulation</title><script src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"></script><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background-color:#f0f0f0;font-family:sans-serif;color:#333;}h1{margin-bottom:20px;color:#1a1a1a;font-size:2.5em;text-align:center;}#sand-canvas{border:2px solid #555;border-radius:5px;box-shadow:0 4px 8px rgba(0,0,0,0.2);background-color:#ffffff;}</style></head><body><h1>Falling Sand via Cellular Automata</h1><script>let cellSize=5;let ROWS;let COLS;let grid;function setup(){const canvasWidth=600;const canvasHeight=400;let canvas=createCanvas(canvasWidth,canvasHeight);canvas.id('sand-canvas');COLS=floor(canvasWidth/cellSize);ROWS=floor(canvasHeight/cellSize);grid=create2DArray(COLS,ROWS,0);frameRate(30);}function create2DArray(cols,rows,initialValue){let arr=new Array(rows);for(let i=0;i<rows;i++){arr[i]=new Array(cols).fill(initialValue);}return arr;}function draw(){background(255);for(let y=0;y<ROWS;y++){for(let x=0;x<COLS;x++){if(grid[y][x]===1){fill(255,204,0);noStroke();rect(x*cellSize,y*cellSize,cellSize,cellSize);}}}for(let y=ROWS-2;y>=0;y--){let xOrder=[];for(let i=0;i<COLS;i++){xOrder.push(i);}for(let i=xOrder.length-1;i>0;i--){const j=floor(random(i+1));[xOrder[i],xOrder[j]]=[xOrder[j],xOrder[i]];}for(let i=0;i<xOrder.length;i++){let x=xOrder[i];if(grid[y][x]===1){if(y+1<ROWS&&grid[y+1][x]===0){grid[y+1][x]=1;grid[y][x]=0;}else{let moved=false;let directions=[-1,1];if(random(1)<0.5){directions.reverse();}for(let dir of directions){let diagX=x+dir;let belowY=y+1;if(diagX>=0&&diagX<COLS&&belowY<ROWS&&grid[belowY][diagX]===0){grid[belowY][diagX]=1;grid[y][x]=0;moved=true;break;}}}}}}}function mousePressed(){let mouseGridX=floor(mouseX/cellSize);let mouseGridY=floor(mouseY/cellSize);if(mouseGridX>=0&&mouseGridX<COLS&&mouseGridY>=0&&mouseGridY<ROWS){let spawnRadius=2;for(let dy=-spawnRadius;dy<=spawnRadius;dy++){for(let dx=-spawnRadius;dx<=spawnRadius;dx++){let newX=mouseGridX+dx;let newY=mouseGridY+dy;if(newX>=0&&newX<COLS&&newY>=0&&newY<ROWS){if(grid[newY][newX]===0){grid[newY][newX]=1;}}}}}}</script></body></html>`;
        this.versionControlObject = {
            root:{},
            selectedVersion:null
        };
        this.appletInfo = {
            html:code
        };
        this.errors = [];
        this.iframe.loading = "lazy";
        this.canModify = false;
        this.submitEdit.disabled = true;
        this.submitEdit.addEventListener("click", async () => {
            if(this.canModify){
                this.canModify = false;
                this.submitEdit.disabled = true;
                let prompt = `${this.appletInfo.html}\nModify The above html code to include the following modification: ${this.editInput.value}. do the modification by modifying the above code to match the needed modification. do not add comments. change the fundamental working of the html code as per the modification requested. add the given modification without causing errors. \n Give the full code do not skip any code, the code you have given should be able to run perfectly verbatim to what you have given. do not give indications like triple dots to make the user assume code is written. Ex. <div>...</div> is wrong, complete it like <div>Hi I am a div</div>. don't leave the code incomplete`
                try {
                    const rectifiedHTML = await modelRectify.generateContent([prompt]);
                    // // console.log(rectifiedHTML)
                    // // console.log(rectifiedHTML.response)
                    // // console.log(rectifiedHTML.response.text())
                    console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = html_beautify((JSON.parse(rectifiedHTML.response.text())).html, beautifyOptions)
                    this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id)
                    let newVersion = new Version(this.appletInfo.html, this.editInput.value, this.versionControlObject.root.getThreadLength(), this.versionControlObject, this)
                    // console.log(this.versionControlObject.selectedVersion.nextVersion == null);
                    if(this.versionControlObject.selectedVersion.nextVersion == null){
                        this.versionControlObject.selectedVersion.addInMain(newVersion);
                    }
                    else{
                        this.versionControlObject.selectedVersion.createFork(newVersion);
                    }
                    // console.log(this.versionControlObject);
                    this.versionControlObject.selectedVersion = newVersion;
                    this.showVersions();
                    // console.log(this.versionControlObject);
                } catch (e) {
                }
                this.submitEdit.disabled = false;
                this.canModify = true;
            }
        });
        this.canSolve = false;
        this.solveError.addEventListener("click", async () => {
            if(this.canSolve){
                let errorMessageList = this.errors.map(e => formatError(e, this.appletInfo.html)).join("\n");
                let errorInfos = `${this.appletInfo.html} \n This is the list of errors with the above HTML code fix these error without causing another error or modifying the core framework/integrity of the functioning of the code.if the errors as caused by comments remove them entirely \n ${errorMessageList}. \n Give the full code do not skip any code, the code you have given should be able to run perfectly verbatim to what you have given. do not give indications like triple dots to make the user assume code is written. Ex. <div>...</div> is wrong, complete it like <div>Hi I am a div</div>. don't leave the code incomplete`
                console.log(errorMessageList)
                this.canSolve = false;
                this.solveError.disabled = true;
                try {
                    const rectifiedHTML = await modelRectify.generateContent([errorInfos]);
                    // // console.log(rectifiedHTML)
                    // // console.log(rectifiedHTML.response)
                    console.log(rectifiedHTML.response.text())
                    console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = html_beautify((JSON.parse(rectifiedHTML.response.text())).html, beautifyOptions)
                    this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id)
                    this.errors = [];
                    let newVersion = new Version(this.appletInfo.html, errorMessageList, this.versionControlObject.root.getThreadLength(), this.versionControlObject, this)
                    // console.log(this.versionControlObject.selectedVersion.nextVersion == null);
                    if(this.versionControlObject.selectedVersion.nextVersion == null){
                        this.versionControlObject.selectedVersion.addInMain(newVersion);
                    }
                    else{
                        this.versionControlObject.selectedVersion.createFork(newVersion);
                    }
                    // console.log(this.versionControlObject);
                    this.versionControlObject.selectedVersion = newVersion;
                    this.showVersions();
                } catch (e) {
                    this.solveError.disabled = false;
                    this.canSolve = true;
                }
            }
        })
        this.generateApplet();
        // this.appletInfo.html = html_beautify(this.appletInfo.html, beautifyOptions)
        // this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id)
        // this.versionControlObject.root = new Version(this.appletInfo.html, "Create Falling Sand Simulation", 0, this.versionControlObject);
        // this.versionControlObject.selectedVersion = this.versionControlObject.root;
        // this.showVersions();
        // console.log(this.versionControlObject);

        this.iframeError();
    }

    showVersions(){
        this.versionWindowInterface.innerHTML = "";
        let mainVersionUI = this.versionControlObject.root.createVersionUI();
        this.versionWindowInterface.appendChild(mainVersionUI.initialWrapper);
    }

    generateApplet = async () => {
        let metaPrompt = await Ai.giveMetaPrompt(this.mockupMode);
        console.log(metaPrompt)
        let url = Ai.manager.getDataUrl();
        Ai.responseImage.src = url.join(",");
        Ai.imageDataURL.inlineData.data = url[1];
        let recipePrompt = `Create a step by step guide to Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and if necessary use p5.js. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${metaPrompt}${this.mockupMode? ".Use this image as a mockup design of the final webpage":""}. Give detailed step by step guide. give the architecture of the functioning of the i.e. the process on which the html code is working, for example:- for creating a to do list you can show the architecture as such:- task class with properties as task_text and status. task manager class which handles status of tasks. also provide structure of UI to be follow and the basic underlying design of the web page. for example:- for a to do list create a section with a text_input and a add button to add tasks. a section below it to search tasks and a section below it which has the list of tasks sorted from latest to oldest. a select option on the other side of the search section to change sorting of the list of tasks such as date created, important, A to Z or Z to A and etc. make the tutorial friendly for a beginner to advanced programmer. add all the minute details. focus on implementation more. if maths or physics is required also explain the mathematics or the physics to solve the problems and sub-problems. Do not write the code your self as this is an exercise to the person reading your tutorial. use code snippets to only enhance implementation process and understanding purposes in javascript. use code snippets only when needed do not give code snippets for css or html. do not tell to create index.html files or give tutorial regarding creating the files or making the web page responsive. do not give additional cdn's for p5 but you can give for other script's and css's cdns used. do not suggest to create any other files or folders because the html code should be independent of the file structure around it because where the code is being used you don't have access to file system, although you can use http links but avoid as much as possible for media and stuff only use for cdns`;
        let recipe = await model.generateContent([structuredClone(Ai.imageDataURL), recipePrompt]);
        let recipeText = recipe.response.text();
        console.log(recipeText)
        let fullPrompt = `Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and if necessary use p5.js, use this cdn for p5.js, <script src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"></script>. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${metaPrompt}${this.mockupMode? ".Use this image as a mockup design of the final webpage":""}.Give a description and title to the HTML code. the inputs or input fields used should be listed with the appropriate type instead of using default input tags in html or p5 use this tag:- <input id = "{id of the input}" type="{type of the input}"/> and give a label to that input. Please provide a JSON object with the following fields: 'title', 'description', 'html', and 'inputs'. Each input should be an object with 'id', 'label', and 'type' properties. This should be a full body interface not bounded in a container div and *Do not add any comments in the code especially js*. don't add any comments it is a strict warning, format the html code properly with lines and indentations
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
        this.appletInfo.html = html_beautify(this.appletInfo.html, beautifyOptions);
        // this.appletInfo.html = JSON.parse(result.response.text()).html;
        this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id);
        this.versionControlObject.root = new Version(this.appletInfo.html, this.description, 0, this.versionControlObject, this);
        this.versionControlObject.selectedVersion = this.versionControlObject.root;
        this.showVersions();
        this.submitEdit.disabled = false;
        this.canModify = true;
        console.log(this.appletInfo.html)
    }

    iframeError(){
        window.addEventListener('message', (event) => {
            if (event.data.type !== 'iframe-error'){return;}
            if (event.data.id !== this.id){return;}
            console.error('Iframe error:', event.data);
            this.canSolve = true;
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

class Version{
    constructor(data, prompt, version, versionControlObject, applet){
        this.html = data;
        this.prompt = prompt;
        this.versionPrefix = "";
        this.version = version;
        this.nextVersion = null;
        this.versionControlObject = versionControlObject;
        this.childrenMain = [];
        this.forks = [];
        this.applet = applet;
        this.id = Math.random();
    }

    createVersionUI(){
        let initialWrapper = document.createElement("div");
        let currentVersionWrapper = document.createElement("div");
        let currentVersionButton = document.createElement("button");
        currentVersionButton.innerText = `Version ${this.versionPrefix}${this.version}`;
        let forks = document.createElement("div");
        currentVersionWrapper.appendChild(currentVersionButton)
        initialWrapper.appendChild(currentVersionWrapper)
        initialWrapper.appendChild(forks);
        initialWrapper.classList.add("initialWrapper");
        currentVersionWrapper.classList.add("currentVersionWrapper");
        currentVersionButton.classList.add("currentVersionButton");
        forks.classList.add("forks");

        currentVersionButton.addEventListener("click", () => {
            this.versionControlObject.selectedVersion = this;
            this.applet.iframe.srcdoc = this.html;
            this.applet.appletInfo.html = this.html;
            console.log(this.versionControlObject);
        })
        
        if(this.nextVersion != null){
            let nextVersionUI = this.nextVersion.createVersionUI();
            currentVersionWrapper.appendChild(nextVersionUI.initialWrapper)
        }

        this.forks.forEach((e) => {
            let forkVersionUI = e.createVersionUI();
            forks.appendChild(forkVersionUI.initialWrapper);
        })

        return {initialWrapper, currentVersionWrapper, currentVersionButton, forks}
    }

    addInMain(version){
        this.childrenMain.push(version);
        if(this.nextVersion == null){
            this.nextVersion = version;
            version.versionPrefix = this.versionPrefix;
            version.version = this.version + 1;
            return;
        }
        else{
            this.nextVersion.addInMain(version);
        }
    }

    createFork(version){
        version.versionPrefix = `${this.versionPrefix}${this.versionPrefix == "" ? "" : "."}${this.version}.`
        version.version = 1;
        this.forks.push(version);
    }

    getThreadLength(){
        if(this.nextVersion == null){
            return 1;
        }
        else{
            return 1 + this.nextVersion.getThreadLength();
        }
    }

    isChildOf(version){
        for (let child of version.children) {
            if(child.id == this.id){
                return true;
            }
        }
        return false;
    }
    
    isLastChildOf(version){
        let isChild = this.isChildOf(version);
        return isChild && (this.nextVersion == null);
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

function formatError(e, appletInfoHTML){
    let lines = appletInfoHTML.split("\n");
    let linesAround = `${lines[e.lineno - 11]}\n${lines[e.lineno - 10]}\n${lines[e.lineno - 9]}`
    return `${e.message}:- at line number(${e.lineno}) and column number(${e.colno}) that is ${e.error.replace(/\n/g, " ")})).\nIt occurred in the block of code below:-\n${linesAround}`
}

const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);
const appletManager = new AppletManager(Canvas, model, Ai, ai);