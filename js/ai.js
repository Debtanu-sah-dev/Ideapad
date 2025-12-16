import { GoogleGenerativeAI} from "@google/generative-ai";
import * as smd from "https://cdn.jsdelivr.net/npm/streaming-markdown/smd.min.js"
import * as htmlToImage from 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';
import * as toon from 'https://esm.run/@toon-format/toon';
import { addView } from "./panzoom.js";
// console.log(Type);
const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
    model:"gemini-flash-latest",
    // model:"gemini-2.5-pro-exp-03-25",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
            "type": "object",
  "properties": {
    // "title": { "type": "string" },
    // "description": { "type": "string" },
    "html": { "type": "string" },
    // "inputs": {
    //   "type": "array",
    //   "items": {
    //     "type": "object",
    //     "properties": {
    //       "id": { "type": "string" },
    //       "label": { "type": "string" },
    //       "type": {
    //         "type": "string",
    //         "enum": [
    //           "button", "checkbox", "color", "date", "datetime-local",
    //           "email", "file", "hidden", "image", "month", "number",
    //           "password", "radio", "range", "reset", "search", "submit",
    //           "tel", "text", "time", "url", "week"
    //         ]
    //       }
    //     },
    //     "required": ["id", "label", "type"]
    //   }
    // }
  },
  "required": ["html"]
          }
    }
  };
const generationConfigForRectification = {
    model:"gemini-flash-latest",
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
    model:"gemini-flash-latest",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
          "type": "object",
          "properties": {
            "content": {
              "type": "string"
            },
            "type": {
              "type": "string",
              "enum": [
                "svg",
                "mermaid"
              ]
            }
          },
          "propertyOrdering": [
            "content",
            "type"
          ],
          "required": [
            "content",
            "type"
          ]
        }
   }
};
const generationModelRequirement = {
    model:"gemini-flash-latest",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
          "type": "object",
          "properties": {
            "models": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "asset_name": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "propertyOrdering": [
                  "asset_name",
                  "description"
                ],
                "required": [
                  "asset_name",
                  "description"
                ]
              }
            }
          },
          "propertyOrdering": [
            "models"
          ],
          "required": [
            "models"
          ]
        }
    }
}

const generationConfigForQuiz = {
    model:"gemini-flash-latest",
    generationConfig:{
        responseMimeType: 'application/json',
        responseSchema: {
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string"
          },
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
          },
          "correct": {
            "type": "string",
            "enum": [
              "1",
              "2",
              "3",
              "4"
            ]
          }
        },
        "propertyOrdering": [
          "question",
          "option1",
          "option2",
          "option3",
          "option4",
          "correct"
        ],
        "required": [
          "question",
          "option1",
          "option2",
          "option3",
          "option4",
          "correct"
        ]
      }
    }
  },
  "propertyOrdering": [
    "title",
    "description",
    "data"
  ],
  "required": [
    "title",
    "description",
    "data"
  ]
}
   }
};
const model = genAI.getGenerativeModel({model: "gemini-flash-latest"});
const modelApplet = genAI.getGenerativeModel(generationConfig);
const modelRectify = genAI.getGenerativeModel(generationConfigForRectification);
const modelDiagram = genAI.getGenerativeModel(generationConfigForDiagram);
const modelQuiz = genAI.getGenerativeModel(generationConfigForQuiz);
const modelModelQuery = genAI.getGenerativeModel(generationModelRequirement);
const modelFast = genAI.getGenerativeModel({model: "gemini-flash-lite-latest"});
// const mermaidQuery = "do not forget to enclose any string with double quotes --> \"String content\" \n Possible errors you can do with mermaid:-\n1). D{Target = Array[Mid]?};\nError:- Mermaid sees [ and ] and thinks you’re trying to start a new node definition, so it throws a parse error.\nFIX:-\nD{\"Target = Array[Mid]?\"};\nRoot problem/Moral:- You should properly put all labels in double inverted commas always especially when you have nested parentheses even if of Different type this is a command follow it strictly. \n2). E(Mid = Low + (High - Low)/2);\nError:- Mermaid flowcharts use: ( ) → rounded node, [ ] → square node, { } → diamond node (decision), But the parser cannot handle nested parentheses inside a node label when the node itself uses parentheses as its shape.\nFix(Do this always):-\nE(\"Mid = Low + (High - Low) / 2\");\nRoot problem/Moral:- To put all labels in a double inverted commas like following --> \"Label text\" do not forget this, this is the root of all errors escaping parentheses inside node definition still throw error so carefully put all the labels in a double quote so this D{Target = Array\\[Mid\\]?} is wrong as \\[Mid\\] is still not allowed in mermaidJS so do D{\"Target = Array[Mid]?\"}\nAlso (Print \"Not Prime\") this is not allowed as the double quote should enclose the entire thing not a part of it so when you label is actually Print \"Not Prime\" the compiler thinks you didn't put the string all around the label so do this instead (\"Print 'Not Prime'\")\nFor every label enclose it fully in double quote no exceptions\nSame is true for the following:- subgraph DFS(Grid, r, c) here it should be subgraph \"DFS(Grid, r, c)\" so make sure this rules to be followed everywhere.\nNote:- the rule of enclosing absolutely all labels in double inverted commas have no exception at all so D{Iterate (Freq, Element) pairs?}; should be corrected to D{\"Iterate (Freq, Element) pairs?\"};\nRemember strictly that any need of double quote in a label should be converted to single quote because the compiler mis-interprets \"Text \\\"Text inside quote\\\"\" so convert all these edge cases to \"Text 'Text inside quote'\" to minimie compiler issue. But in the midst of this do not do the following \n class \"Name\" as you cannot pass strings here or else you will get a error for things like these convert to \nclass Name\nit is because this is a class definition and the compiler does not expect and string so don't put a string.In case of mindmaps do not use parentheses at all because \"String Content Here\" is not shown as String Content Here but as \"String Content Here\" only";
const toolPrompt = TOOLS.map(e => `${e.requirement}, then ${e.directive}. add it in a codeblock with like this -->
  \`\`\`${e.header}
  ${e.mime}
  \`\`\` only`).reduce((a, c) => a+c + "\n\n");
console.log(toolPrompt);
const mermaidQuery = `Strictly never ever nest any parentheses -> () [] {} inside any other parentheses -> () [] {} for any reason never ever do it as this will make the compiler throw an error it is a clear restriction, even when you need to display parentheses do not use parentheses in labels also, if you do it inside a node definition then you will get 100% error because no matter what is your intent, it will think of the other parentheses as starting of new node definition even though the previouse node definition didn't closed, so putting any type of parentheses inside a node definition will make the compiler throw error Ex. F{Is A[Mid] equal to T?} is not correct do this F{Is A_Mid equal to T?} thr right approach should be E[Max_So_Far = MaxMax_So_Far, Current_Max], also E[Max_So_Far = Max(Max_So_Far, Current_Max)] is wrong as i told you not for any reason use parentheses inside parentheses so , and for godsake do not use any mermaidJS identifier as literal label text, also math latex is not allowed in mermaidJS, When creating Mermaid sequence diagrams, avoid using the deactivation shorthand (-) inside alt or opt blocks, as this causes parser errors. Instead, explicitly deactivate the participant after the end keyword to ensure the activation state remains valid.`
console.log(mermaidQuery)
const prompt = "Your name is Pragya and you will tell that your ai model is pragya AI.Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject. Note your response is going to be treated in Markdown format if relevant use svg images abiding to following criteria, flat design paradigm, with a suitable background color and if and only if needed then only do animation using either css or native animation tags in svg and if there is animation mentioned after the entire animation sequence is completed it should loop like a gif but strictly do not use animation until it is needed and do not apply style to any element outside the svg like body, head, html etc. or change anything in the :root selector structure your code such that you don't use any class attribute or tag names to reference elements in css, work with data-types or ids. Remember Strictly use svg only is required and text cannot do the job of explanation. also do not provide the code of svg in code block but as a svg image, so for svg image do not put svg code under triple backticks code block i.e. ```coding language \n svg code\n``` just leave it as it is, just like other text do not format things inside the svg being under the impression that it will be handled by markdown converter because any markdown tokens and methods will be treated as plain text inside the svg, because in the markdown converter it will be interpreted as svg code and will be rendered as an image. Be very sure that if you need any of the following instead for visualization strictly not use svgs as there positioning might not be accurate Use mermaidJS code: Flowchart, Sequence Diagram, Class Diagram, State Diagram, Entity Relationship Diagram, User Journey, Gantt, Pie Chart, Quadrant Chart, Requirement Diagram, GitGraph (Git) Diagram, C4 Diagram, Mindmaps, Timeline, ZenUML, Sankey, XY Chart, Block Diagram, Packet, Kanban, Architecture, Radar, Treemap. you will use mermaidJS in a code block Ex. ```mermaid\n mermaid code \n```, also " + mermaidQuery + `\n\n ${toolPrompt}`;
console.log(prompt)
const metaPrompt = "Explain this image and give a small summary of what is illustrated and what topic and frameworks it is based on, give description of this image giving a complete picture of the image in just 100 words altogether.";
const rectificationPrompt = `check and rectify the above code, check for any potential errors and fix it. remove any html, CSS or JavaScript comments. remove all the comments strictly. check that all CSS properties are valid else fix it, check all html tags and attributes are proper and no attribute is mixed with the tag name like:- <pid="paragraph">...</p> is wrong so make it <p id="paragraph">...</p>. In JavaScript check for any functions which are called but not defined:-Example makeGraph() is called somewhere in the entire code but is not made so write the make graph function by understanding the HTML codes context and make it so it works with the integrity of the HTML code without giving rise to another error, check for any syntax error like extra }, ), not using proper syntax etc.`;
const diagramPrompt = "\n\nCreate a svg code or mermaidJS code using the above context \n\nHow to choose:- Be very sure that if you need any of the following instead for visualization strictly not use svgs as there positioning might not be accurate Use mermaidJS code: Flowchart, Sequence Diagram, Class Diagram, State Diagram, Entity Relationship Diagram, User Journey, Gantt, Pie Chart, Quadrant Chart, Requirement Diagram, GitGraph (Git) Diagram, C4 Diagram, Mindmaps, Timeline, ZenUML, Sankey, XY Chart, Block Diagram, Packet, Kanban, Architecture, Radar, Treemap. If it is something more involved use SVGs\n\nIf creating a SVG:- svg is of flat design paradigm, with a suitable background color and if and only if specified in the following then only do animation using either css or native animation tags in svg and if there is animation mentioned after the entire animation sequence is completed it should loop like a gif but strictly do not use animation until it is specified in the following and do not apply style to any element outside the svg like body, head, html etc. or change anything in the :root selector structure your code such that you don't use any class attribute to reference elements in css, work with data-types or ids,\n\nIf creating a mermaidJS code:-"+mermaidQuery+"\n\nHow to structure JSON:- \n\tcontent:- either svg code or mermaid js code only, note that for mermaidJS you properly intend your code and properly use space indentation like python and properly add new lines, see adding new lines and tab indentation is very important as the compiler will throw error if the new lines are not made\n\ttype:-svg|mermaid\n\nTherefore create a svg or mermaidJS code representing the following in it: ";
// const quizPrompt = "Make a quiz of 10 questions on {{}} in which you have many types of quesstion mixed together like mcq(only one correct answer), long(long text answer no options), short(short text answer no answer), mcqms(multiple correct answer), you ahev two flags when designing each question one is drawing which means along with the format of question te user can also submit a sketch as an attachment with the answer, you have another flag which is of diagram in this you can create a svg image following the following criteria, flat design paradigm, with a suitable background color and if and only if needed then only do animation using either css or native animation tags in svg and if there is animation mentioned after the entire animation sequence is completed it should loop like a gif but strictly do not use animation until it is needed and do not apply style to any element outside the svg like body, head, html etc. or change anything in the :root selector structure your code such that you don't use any class attribute or tag names to reference elements in css, work with data-types or ids. if you are choosing to add a svg diagram then provide the svg code only in the diagramSvg part but if the diagram flag is false do not put the diagramSvg key-value pair in the object, but if diagram flag is true then you have to provide it. for long and short answer type question do not put the answer object in data as it is only required for mcq and mcqms. so do not provide options and answer-key strictly"
const quizPrompt = `Create a quiz with 4 options only give a suitable title and description on the following topic with clear wording and no ambiguity, add tricky options, so that process of elimination might simply not work, encourage intuition, if a question uses too much technical jargon give a layman analogy as well:- `
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
        const apiUrl2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page)}&generator=images&prop=imageinfo&iiurlwidth=1920&iiprop=url|dimensions|mime&format=json&origin=*`;
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
        this.imagesSearchInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            this.imagesSearchButton.click();
          }
        })
        this.imagesSearchButton = document.createElement("button");
        this.imagesSearchButton.classList.add("button");
        this.imagesSearchButton.innerText = "image search";
        this.imagesSearchButton.setAttribute("tooltip", "Search Image")
        this.closeImages = document.createElement("button");
        this.closeImages.innerText = "X";
        this.closeImages.classList.add("closeImages")
        this.closeImages.addEventListener("click", () => {
            this.imagesDialog.close();
        })
        this.imagesSearch.appendChild(this.imagesSearchInput);
        this.imagesSearch.appendChild(this.imagesSearchButton);
        this.imagesSearch.appendChild(this.closeImages)
        this.imagesDialog.appendChild(this.imagesSearch);
        this.imagesContainer = document.createElement("div");
        this.imagesContainer.classList.add("imagesContainer");
        this.imagesDialog.appendChild(this.imagesContainer);
        this.parent.appendChild(this.imagesDialog);
        this.canQueryImage = true;
        this.imagesSearchButton.addEventListener("click", async () => {
          // this.imagesContainer.innerHTML = "";
          if (this.canQueryImage) {
            this.imagesSearchButton.disabled = true;
            this.imagesSearchInput.disabled = true;
            this.canQueryImage = false;
            this.imagesContainer.style.display = "block";
            this.imagesContainer.innerHTML = `<iframe style="width:100%; height:100%; border:none; outline:none;"></iframe>`
            this.imagesContainer.querySelector("iframe").srcdoc = LoadingHTML;
            let matchingImages = await searchWikimediaImages(this.imagesSearchInput.value.trim());
            this.canQueryImage = true;
            this.imagesContainer.style.display = "grid";
            this.imagesContainer.innerHTML = "";
            this.populateImages(matchingImages);
            this.imagesSearchButton.disabled = false;
            this.imagesSearchInput.disabled = false;
          }
        })
        this.manager.selectionInterface.imageBob.addEventListener("click", async () => {
          // this.imagesContainer.innerHTML = ""
          this.imagesDialog.showModal();
          if(this.canQueryImage){
            this.imagesSearchButton.disabled = true;
            this.imagesSearchInput.disabled = true;
            this.canQueryImage = false;
            this.imagesContainer.style.display = "block";
            this.imagesContainer.innerHTML = `<iframe style="width:100%; height:100%; border:none; outline:none;"></iframe>`
            this.imagesContainer.querySelector("iframe").srcdoc = LoadingHTML;
            let matchingImages = await this.createImageQuery(this.manager.getDataUrlFromSubset(this.manager.selectionInterface.selectedObjects).join(","));
            this.canQueryImage = true;
            console.log(matchingImages)
            this.imagesContainer.style.display = "grid";
            this.imagesContainer.innerHTML = "";
            this.populateImages(matchingImages[0]);
            this.imagesSearchInput.value = matchingImages[1];
            this.imagesSearchButton.disabled = false;
            this.imagesSearchInput.disabled = false;
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
        this.responseText.innerText = `I am Pragya, Ask Me Something`;
        this.responseText.classList.add("responseText");
        this.responseContainer.appendChild(this.responseText);
        this.openDialog = document.createElement("button");
        this.openQuizDialog = document.createElement("button");
        this.openQuizDialog.innerText = "quiz"
        this.openQuizDialog.setAttribute("tooltip", "Quiz")
        this.openDialog.setAttribute("tooltip", "PragyaAI")
        this.quizDialog = document.createElement("dialog");
        this.quizDialog.classList.add("aiDialog")
        this.quizDialog.classList.add("quizDialog");
        this.quizDialog.classList.add("imagesDialog"); // Samestyling
        this.quizDialog.setAttribute("closedby", "any");
        this.openQuizDialog.addEventListener("click", () => {
          this.quizDialog.showModal();
        })
        this.closeQuizDiagram = document.createElement("button");
        this.closeQuizDiagram.innerText = "X";
        this.closeQuizDiagram.classList.add("closeQuizDiagram");
        this.quizQueryInput = document.createElement("input");
        this.quizQueryInput.classList.add("quizQueryInput");
        this.quizQueryInput.classList.add("imagesSearchInput"); // Same styling
        this.quizQueryInput.placeholder = "Choose Quiz Topic";
        this.quizCreateButton = document.createElement("button");
        this.quizQueryInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            this.quizCreateButton.click();
          }
        })
        this.quizCreateButton.innerText = "quiz_add";
        this.quizCreateButton.setAttribute("tooltip", "Create Quiz");
        this.quizCreateButton.classList.add("quizCreateButton");
        this.quizCreateToolbar = document.createElement("div");
        this.quizCreateToolbar.classList.add("quizCreateToolbar");
        this.quizCreateToolbar.classList.add("imagesSearch"); //Same styling
        this.quizCreateToolbar.appendChild(this.quizQueryInput);
        this.quizCreateToolbar.appendChild(this.quizCreateButton);
        this.quizCreateToolbar.appendChild(this.closeQuizDiagram);
        this.quizListContainer = document.createElement("div");
        this.quizListContainer.classList.add("quizListContainer");
        this.closeQuizDiagram.addEventListener("click", () => {
          this.quizDialog.close();
        })
        this.quizDialog.appendChild(this.quizCreateToolbar)
        this.quizDialog.appendChild(this.quizListContainer)
        this.openDialog.addEventListener("click", () => {
            this.dialog.showModal();
            this.responseInput.focus();
        })
        this.openDialog.innerText = "AI";
        this.parent.appendChild(this.openDialog);
        this.parent.appendChild(this.openQuizDialog)
        this.parent.appendChild(this.quizDialog)

        this.quizCreateButton.addEventListener("click", async () => {
          this.quizCreateButton.disabled = true;
          let query = this.quizQueryInput.value;
          try {
            let quizData = await modelQuiz.generateContent([quizPrompt + query])
            this.quizzes.push(new Quiz(this.manager, JSON.parse(quizData.response.text()), this, this.quizListContainer));
          } catch (error) {
            console.error(error)
          }
          this.quizCreateButton.disabled = false;
        })

        //**Testing
        // let quizDummy = new Quiz(this.manager, {
        //   title:"Planets",
        //   description:"Planets of solar system quiz about basic facts",
        //   data:[
        //     {
        //       question:"What Is The Biggest Planet",
        //       option1:"Jupiter",
        //       option2:"Venus",
        //       option3:"Saturn",
        //       option4:"Mars",
        //       correct:"1"
        //     },
        //     {
        //       question:"What Is The Hottest Planet",
        //       option1:"Jupiter",
        //       option2:"Venus",
        //       option3:"Saturn",
        //       option4:"Mars",
        //       correct:"2"
        //     },
        //     {
        //       question:"What Is The Planet With Rings",
        //       option1:"Jupiter",
        //       option2:"Venus",
        //       option3:"Saturn",
        //       option4:"Mars",
        //       correct:"3"
        //     },
        //     {
        //       question:"What Is The Red Planet",
        //       option1:"Jupiter",
        //       option2:"Venus",
        //       option3:"Saturn",
        //       option4:"Mars",
        //       correct:"4"
        //     },
        //   ]
        // }, this, this.quizListContainer);
        // this.quizzes = [quizDummy];
        //**Production
        this.quizzes = [];

        this.canRespond = true;
        this.canDiagram = true;
        this.createResponseTools = document.createElement("div");
        this.createResponseTools.classList.add("createResponseTools")
        this.createResponseButton = document.createElement("button");
        this.createResponseButton.setAttribute("tooltip", "Send")
        this.createDiagramButton = document.createElement("button");
        this.createDiagramButton.setAttribute("tooltip", "Create Diagram")
        this.openDiagramButton = document.createElement("button");
        this.openDiagramButton.setAttribute("tooltip", "Open Diagram Folder")
        this.responseInput = document.createElement("input");
        this.responseInput.placeholder = "Ask anything or create a diagram";
        this.responseInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            this.createResponseButton.click();
          }
        })
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
                let state = ["Generating Response "];
                for (let j = 0; j < 3; j++) {
                  // state.push(state.at(-1) + "")
                  state.push(state.at(-1) + "∘")
                }
                // let maxLength = state.at(-1).length;
                // state = state.map(t => {
                //   let e = t
                //   while(e.length < maxLength){
                //     e += "_"
                //   }
                //   return e + "]"
                // })
                let i = 0;
                let interval = setInterval(() => {
                  i++
                  i%=4;
                  this.responseText.innerHTML = state[i];
                }, 100)
                try {
                  await this.run(interval);
                } catch (error) {
                  console.error(error);
                  this.responseText.innerText = "I am Pragya, Ask Me Something";
                }
                clearInterval(interval);
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
            this.scrollableDiv.querySelectorAll("svg").forEach(svg => {
              const clone = svg.cloneNode(true);
              svg.parentNode.replaceChild(clone, svg);
            });
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
    run = async (interval) => {
        
        let firstResponse = true;
        let url = this.manager.getDataUrl();
        this.responseImage.src = url.join(",");
        this.imageDataURL.inlineData.data = url[1];
        //*TO-DO Add grounding search to all content generation
        const result = await model.generateContentStream({
          contents:[{
            parts:[
              structuredClone(this.imageDataURL), 
              {
                  text:`${this.prompt} ${this.responseInput.value != "" ? ("\nGive importance to the following: " + this.responseInput.value): ""}`
              }
            ]
          }],
          tools: [
            { google_search: {} }
          ]
        });
        // Iterate over each chunk as it arrives
        let completeResponse = "";
        // const renderer = smd.default_renderer(this.responseText)
        // const parser = smd.parser(renderer);
        for await (const chunk of result.stream) {
          if(firstResponse){
            clearInterval(interval);
          }
          firstResponse = false;
          const chunkText = chunk.text();
          if (chunkText) {
            completeResponse += chunkText;
              
              //*Old approach
              let extract = renderMarkdownWithSVG(completeResponse);
              console.log(extract);
              this.responseText.innerHTML = DOMPurify.sanitize(extract).replace(/\[object Object\]/ig, "");
              //*Streamed Approach
              // smd.parser_write(parser, chunkText);
              // this.responseText.querySelectorAll("code").forEach(e => {
              //   if(!e.className.includes("language") && e.parentElement.tagName.toUpperCase() == "PRE"){
              //     e.className = "language-" + e.className;
              //   }
              // })
              mathRectify(this.responseText);
              Prism.highlightAllUnder(this.responseText);
              this.responseText.querySelectorAll("button").forEach((e) => {
                iconify(e);
              })
              this.responseText.querySelectorAll("svg").forEach(svg => {
                // console.log(svg.closest(".katex"))
                if(svg.id.toLowerCase().includes("mermaid")){
                  return;
                }
                if(svg.closest(".katex") != null){
                  return;
                }
                const wrapper = document.createElement('div');
                const shadow = wrapper.attachShadow({ mode: 'open' });
                const clonedSvg = svg.cloneNode(true);
                // shadow.appendChild(clonedSvg);
                const style = document.createElement("style");
                style.innerHTML = `
                div:has(> svg) {
    display: block;  /* 1. Stop it from being inline */
    min-height: 50vh;
  }
    svg{
          display: table !important;
          margin: 1vh auto !important;
          border-radius: var(--button-bounding) !important;
          border: var(--border) !important;
          border-top: none !important;
          max-width: 100% !important;
          max-height: 100vh !important;
          min-height: 50vh !important;
              }`
                wrapper.style.maxWidth = "calc(100% - 1vh) !important";
                shadow.appendChild(style);
                let container = document.createElement("div");
                shadow.appendChild(container)
                svg.parentNode.insertBefore(wrapper, svg);
                svg.parentNode.removeChild(svg);
                setTimeout(() => {
                  rectifySVG(clonedSvg);
                }, 0)
                container.appendChild(clonedSvg);
                addView(container, {
                  maxScale:20
                })
              });
            // this.responseText.scrollIntoView({ behavior: "smooth", block: "end" })
          }
        }

        await renderMermaidDiagrams(this.responseText);
        toolify(this.responseText);
        this.responseText.querySelectorAll("div:has(> svg)").forEach((e) => {
          console.log(e);
          addView(e, {
            maxScale:20
          })
        })
        this.response = completeResponse;
        // const renderer = new marked.Renderer();

        // console.log(this.response);
    }

    createDiagram = async (text) => {
        if((this.response != null)){
            let url = this.manager.getDataUrl();
            this.responseImage.src = url.join(",");
            this.imageDataURL.inlineData.data = url[1];
            const result = await modelDiagram.generateContent([structuredClone(this.imageDataURL),this.response + diagramPrompt + text]);
            // return;
            let div = document.createElement("div");
            let obj = JSON.parse(result.response.text());
            console.log(obj);
            let svgCode = "";
            if(obj.type == "svg"){
              svgCode = obj.content;
            }
            else if(obj.type == "mermaid"){
              svgCode = await mermaidToSVGString(obj.content);
            }
            console.log(svgCode);
            console.log(obj.content)
            div.innerHTML = svgCode;
            // return;
            let image = svgCode;
            setTimeout(() => {
              rectifySVG(div.querySelector("svg"));
              if (obj.type == "mermaid") {
                div.querySelector("svg style").textContent = `@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');*{--primary-color: #FF5100;--text-color:color-mix(in hsl, var(--primary-color), #fff 70%);color:var(--text-color) !important;font-family: "Ubuntu Mono";}` + div.querySelector("svg style").textContent;
              }
              image = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(div.querySelector("svg").outerHTML)}`
              let wrapper = document.createElement("div");
              let shadow = wrapper.attachShadow({mode: "open"});
              let shadowSVG = div.querySelector("svg").cloneNode(true);
              const style = document.createElement("style");
              style.innerHTML = `
              div:has(> svg) {
  display: block;  /* 1. Stop it from being inline */
  min-height: 50vh;
}
              svg{
        overflow:visible !important;
    min-height: 100% !important;
    max-width: 100% !important;
    margin: 0vh auto !important;
    display: table !important;
            }`
              wrapper.style.width = "100%";
              wrapper.style.height = "100%";
              shadow.appendChild(style);
              let container = document.createElement("div");
              container.appendChild(shadowSVG)
              shadow.appendChild(container)
              div.removeChild(div.querySelector("svg"));
              div.appendChild(wrapper)
              addView(container, {
                maxScale:20
              })
            }, 0);
            this.scrollableDiv.appendChild(div);
            let imageAddButton = document.createElement("button");
            imageAddButton.innerText = "Insert Image";
            iconify(imageAddButton);
            div.insertBefore(imageAddButton, div.firstChild);
            imageAddButton.setAttribute("tooltip", "Add diagram to sketch")
            imageAddButton.addEventListener("click", () => {
              console.log(image, "success")
              this.diagramDialog.close();
              this.dialog.close()
              let rect = new Shape("rectangle", this.manager.canvasCtx, this.manager.shapeProperties, null, this.manager, image);
              rect.image.onload = () => {
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
                this.manager.render();
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
        button.setAttribute("tooltip", "Add image to sketch")
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

function rectifySVG(element, padding = 20){
    element.removeAttribute("viewBox")
    let tempGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tempGroup.innerHTML = element.innerHTML;
    // tempGroup.style.opacity = "0";
    element.appendChild(tempGroup);
    let b = tempGroup.getBBox({
        fill:true,
        stroke:true,
        markers:true
    });
    let prevData = {
        width:parseFloat(element.getAttribute("width")),
        height:parseFloat(element.getAttribute("height")),
    }
    element.removeChild(tempGroup);
    if(((typeof prevData.width) == "number") && !isNaN(prevData.width)){
      element.setAttribute("height", (prevData.width*b.height/b.width) + padding*2);
    }
    element.querySelectorAll(":scope > rect").forEach(e => {
        if((parseFloat(e.getAttribute("width")) == prevData.width) && (parseFloat(e.getAttribute("height")) == prevData.height)){
            e.setAttribute("width", "100%")
            e.setAttribute("height", "100%")
        }
    })
    element.setAttribute("viewBox" , `0 0 ${b.width + padding*2} ${b.height + padding*2}`);
    return b;
}

function toolify(parent){
  let allPre = Array.from(parent.querySelectorAll("pre")).filter(e => e.className.includes("language-"));
  for(let tool of TOOLS){
    for(let pre of allPre){
      if(pre.className.toLowerCase().includes(tool.header.toLowerCase())){
        const code = pre.querySelector("code").innerText;
        pre.parentElement.outerHTML = `<iframe style="height:${50*(tool.scale != null ? tool.scale : 1)}vh;" src="${tool.append}${encodeURIComponent(code)}"></iframe>`
      }
    }
  }
}

class Quiz{
  constructor(manager, {title, description, data}, ai, parent){
    this.id = Math.round(Math.random()*(10**10));
    this.percentageLast = null;
    this.graded = false;
    this.manager = manager;
    this.title = title;
    this.description = description;
    this.data = data;
    this.ai = ai;
    this.parent = parent;
    this.quizContainer = document.createElement("div");
    this.quizContainer.classList.add("quizContainer");
    this.quizInfoContainer = document.createElement("div");
    this.quizInfoContainer.classList.add("quizInfoContainer");
    this.quizTitle = document.createElement("h1");
    this.quizTitle.innerText = this.title;
    this.quizInfoContainer.appendChild(this.quizTitle)
    this.quizDescription = document.createElement("p");
    // this.quizDescription.innerText = renderMarkdownWithSVG(this.description);
    this.quizDescription.innerHTML = DOMPurify.sanitize(renderMarkdownWithSVG(this.description)).replace(/\[object Object\]/ig, "");
    mathRectify(this.quizDescription);
    Prism.highlightAllUnder(this.quizDescription);
    this.quizInfoContainer.appendChild(this.quizDescription)
    this.quizToolContainer = document.createElement("div");
    this.quizToolContainer.classList.add("quizToolContainer");
    this.quizOpen = document.createElement("button");
    this.quizOpen.innerText = "open";
    this.quizOpen.setAttribute("tooltip", "Start quiz")
    this.quizDelete = document.createElement("button");
    this.quizDelete.innerText = "clear";
    this.quizDelete.dataset.colorize = "red";
    this.quizDelete.setAttribute("tooltip", "Delete quiz")
    this.quizToolContainer.appendChild(this.quizOpen);
    this.quizToolContainer.appendChild(this.quizDelete);
    this.quizContainer.appendChild(this.quizInfoContainer);
    this.quizContainer.appendChild(this.quizToolContainer);
    this.quizWindow = document.createElement("dialog");
    this.quizWindow.classList.add("aiDialog")
    this.quizWindow.setAttribute("closedby", "any");
    // this.quizWindow.classList.add("imagesDialog")
    this.quizWindowClose = document.createElement("button");
    this.quizWindowClose.innerText = "x";
    this.quizWindow.appendChild(this.quizWindowClose);
    this.quizContainer.appendChild(this.quizWindow)
    let firstTime = true;
    this.quizOpen.addEventListener("click", () => {
      this.quizWindow.showModal();
      if (this.graded || firstTime) {
        this.update();
      }
      firstTime = false;
    })

    this.quizDelete.addEventListener("click", () => {
      if(confirm("This action will permanently delete the quiz")){
        this.quizContainer.style.display = "none";
      }
    })

    this.quizWindowClose.addEventListener("click", () => {
      this.quizWindow.close();
      if (this.graded) {
        this.questionsContainer.innerHTML = "";
      }
    })

    this.quizWindow.addEventListener("close", () => {
      if (this.percentageLast != null) {
        this.quizTitle.innerText = `${this.title} (${this.percentageLast}%)`;
      }
    })

    this.questionsContainer = document.createElement("div");
    this.questionsContainer.classList.add("questionsContainer")
    this.quizWindow.appendChild(this.questionsContainer);
    // this.quizContainer.innerText = this.title;
    this.parent.appendChild(this.quizContainer);
  }

  update(){
    this.graded = false;
    this.correctAnswers = [];
    this.data.forEach((e, i) => {
      this.correctAnswers.push(parseInt(e.correct));
      this.addQuestion(e, i);
      if(parseInt(i + 1) != this.data.length){
        this.questionsContainer.appendChild(document.createElement("hr"));
      }
    })
    this.userAnswers = new Array(this.data.length).fill(0);
    let submitQuiz = document.createElement("button");
    submitQuiz.classList.add("submitQuiz");
    submitQuiz.innerText = "submit";
    submitQuiz.setAttribute("tooltip", "Submit Quiz")
    this.questionsContainer.appendChild(submitQuiz)
    let reportDialog = document.createElement("dialog");
    reportDialog.setAttribute("closedby", "any");
    reportDialog.classList.add("aiDialog"); // same styling
    let reportClose = document.createElement("button");
    reportClose.innerText = "x";
    reportDialog.appendChild(reportClose);
    this.questionsContainer.appendChild(reportDialog);
    let report = null;
    submitQuiz.addEventListener("click", async () => {
      reportDialog.showModal();
      if(report == null){
        let loader = document.createElement("iframe");
        loader.classList.add("quizLoader");
        loader.srcdoc = LoadingHTML;
        reportDialog.appendChild(loader);
        // return;
        report = await this.giveReport();
        this.graded = true;
        this.percentageLast = report.percentage;
        reportDialog.removeChild(loader);
        let percentageDisplay = document.createElement("div");
        percentageDisplay.classList.add("percentageDisplay");
        percentageDisplay.innerText = report.percentage+"%";
        percentageDisplay.style.setProperty('--percent', report.percentage+"%"); 
        let info = document.createElement("div");
        info.classList.add("quizInfo");
        info.innerText = `Correct/Wrong/Not Attempted:${report.correct}/${report.wrong}/${report.notAttempted}`;
        let reviewContainer = document.createElement("dialog");
        reviewContainer.setAttribute("closedby", "any");
        reviewContainer.classList.add("aiDialog");
        let openReview = document.createElement("button");
        openReview.classList.add("openReview");
        openReview.innerText = "See Review";
        openReview.setAttribute("tooltip", "See Where You Went Wrong");
        openReview.addEventListener("click", () => {
          reviewContainer.showModal();
        })
        let reviewClose = document.createElement("button");
        reviewClose.innerText = "x";
        reviewContainer.appendChild(reviewClose);
        let reviewView = document.createElement("div");
        reviewView.classList.add("reviewView");
        let extract = renderMarkdownWithSVG(report.review);
        // console.log(extract);
        reviewView.innerHTML = DOMPurify.sanitize(extract).replace(/\[object Object\]/ig, "");
        mathRectify(reviewView);
        Prism.highlightAllUnder(reviewView);
        reviewContainer.appendChild(reviewView)
        reviewClose.addEventListener("click", () => {
          reviewContainer.close();
        })
        reportDialog.appendChild(percentageDisplay);
        reportDialog.appendChild(info);
        reportDialog.appendChild(reviewContainer);
        reportDialog.appendChild(openReview);
      }
      console.log(report);
    })
    reportDialog.addEventListener("close", () => {
      submitQuiz.innerText = "report";
      submitQuiz.setAttribute("tooltip", "View Report")
      iconify(submitQuiz)
    })
    reportClose.addEventListener("click", () => {
      reportDialog.close();
    })
  }

  async giveReport(){
    let correct = 0;
    let notAttempted = 0;
    let wrong = 0;
    let log = [];
    this.questionsContainer.querySelectorAll('input[type="radio"]').forEach((e) => {
      e.disabled = true;
    })
    for(let attemptedIndex in this.userAnswers){
      attemptedIndex = parseInt(attemptedIndex);
      let attempted = this.userAnswers[attemptedIndex];
      this.questionsContainer.querySelector(`.mockupModeContainer:has(#optionsRadio_${this.id}_${attemptedIndex}_${this.correctAnswers[attemptedIndex] - 1})`).classList.add("correctAnswer");
      if(attempted == 0){
        notAttempted++;
        continue;
      }
      if(attempted == this.correctAnswers[attemptedIndex]){
        correct++
      }
      else{this.questionsContainer.querySelector(`.mockupModeContainer:has(#optionsRadio_${this.id}_${attemptedIndex}_${attempted - 1})`).classList.add("wrongAnswer");
        wrong++;
        log.push(`Question:- ${this.data[attemptedIndex].question}\nCorrect:- ${this.data[attemptedIndex]["option"+this.correctAnswers[attemptedIndex]]}\nAnswer attempted:- ${this.data[attemptedIndex]["option"+attempted]}\nGiven options:- \n1).${this.data[attemptedIndex].option1}\n2).${this.data[attemptedIndex].option2}\n3).${this.data[attemptedIndex].option3}\n4).${this.data[attemptedIndex].option4}`)
      }
    }
    let percentage = Math.round((correct/this.correctAnswers.length)*100);
    let completeLog = log.join("\n\n");
    let review = "You aced the test!!";
    if (wrong > 0) {
      let reviewResponse = await modelFast.generateContent([`Below are the question which user got wrong on the quiz for "${this.description}" and titled "${this.title}":-\n\n${completeLog}\n\nGive a complete review of where the user made mistake point out common problems and think through users thought process and explain why that fails you are gentle and very supportive, give users tips to improve and give them not just the explanation of the correct answer but how will they get the correct answers also discuss MCQ methods which would have helped in getting correct answers like process of elimination and etc. Focus on giving intuitive answers and also give examples in layman terms as well for each question`]);
      review = reviewResponse.response.text();
    }
    return {correct, notAttempted, wrong, percentage, review}
  }

  addQuestion(metadata, index){
    let questionContainer = document.createElement("div");
    questionContainer.classList.add("questionContainer");
    let questionHeader = document.createElement("h2");
    questionHeader.classList.add("questionHeader");
    // questionHeader.innerText = metadata.question;
    questionHeader.innerHTML = DOMPurify.sanitize(renderMarkdownWithSVG(metadata.question)).replace(/\[object Object\]/ig, "");
    mathRectify(questionHeader);
    Prism.highlightAllUnder(questionHeader);
    
    questionContainer.appendChild(questionHeader);
    let questionOptions = document.createElement("div");
    questionOptions.classList.add("questionOptions");
    let allOptions = [metadata.option1, metadata.option2, metadata.option3, metadata.option4];
    allOptions.forEach((e, i) => {
        let optionLabel = document.createElement("label");
        // optionLabel.innerText = e;
        optionLabel.innerHTML = DOMPurify.sanitize(renderMarkdownWithSVG(e)).replace(/\[object Object\]/ig, "");
        mathRectify(optionLabel);
        Prism.highlightAllUnder(optionLabel);
        optionLabel.setAttribute("for",`optionsRadio_${this.id}_${index}_${i}`)
        let option = document.createElement("input");
        option.type = "radio";
        option.id = `optionsRadio_${this.id}_${index}_${i}`;
        option.name = `optionsRadio_${this.id}_${index}`;
        let thisIndex = i;
        option.addEventListener("change", () => {
          this.userAnswers[index] = i + 1;
          console.log(this.userAnswers);
        })
        let optionContainer = document.createElement("div");
        optionContainer.classList.add("mockupModeContainer"); // same styling
        optionContainer.addEventListener("click", () => {
          optionLabel.click();
        })
        optionContainer.style.cursor = "pointer";
        optionContainer.appendChild(optionLabel);
        optionContainer.appendChild(option);
        questionOptions.appendChild(optionContainer);
    })
    questionContainer.appendChild(questionOptions)
    this.questionsContainer.appendChild(questionContainer);
  }
}

class AppletManager{
    constructor(manager, model, ai, parent){
        this.ai = ai;
        this.manager = manager;
        this.model = model;
        this.parent = parent;
        this.appletButton = document.createElement("button");
        this.appletButton.innerText = "Applet";
        this.appletButton.setAttribute("tooltip", "Applets")
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
        this.add.setAttribute("tooltip", "Go to Create Applet")
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
        this.labelInput.placeholder = "Applet title"
        this.labelInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            this.descriptionTextarea.focus();
          }
        })
        this.descriptionTextarea = document.createElement("textarea");
        // this.descriptionTextarea.value = `create a solar system in 3d with all the planets and ring around saturn and moon with earth make all the planet also have their own light source to make them visible and add stars in the background, remove wireframe settings from the planets sphere, make the scene bright with accurate colors and speed`
        this.descriptionTextarea.placeholder = `Describe your applet. Ex. Create a interactive simulation of a pendulum`
        this.mockupModeLabel = document.createElement("label");
        this.mockupModeLabel.innerText = "Mockup Mode";
        this.mockupModeLabel.setAttribute("for", "mockupModeRadio")
        this.mockupMode = document.createElement("input");
        this.mockupMode.type = "checkbox"
        this.mockupMode.setAttribute("tooltip", "Use sketch as Mockup")
        this.mockupMode.id = "mockupModeRadio"
        this.mockupModeContainer = document.createElement("div");
        this.mockupModeContainer.classList.add("mockupModeContainer");
        this.mockupModeContainer.appendChild(this.mockupModeLabel);
        this.mockupModeContainer.appendChild(this.mockupMode);
        this.submitWrapper.appendChild(this.mockupModeContainer);
        this.submitMetaData = document.createElement("button");
        this.submitMetaData.innerText = "Create Applet";
        this.submitMetaData.setAttribute("tooltip", "Create Applet")
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
        let appletEditDialog = document.createElement("dialog");
        appletEditDialog.classList.add("versionWindow"); // same styling
        appletEditDialog.classList.add("appletEditDialog");
        appletEditDialog.setAttribute("closedby", "any");
        let appletRenameInput = document.createElement("input");
        appletRenameInput.classList.add("appletRenameInput");
        appletRenameInput.placeholder = "Applet Title"
        appletEditDialog.appendChild(appletRenameInput);
        let appletEditClose = document.createElement("button");
        appletEditClose.innerText = "Cancel";
        appletEditClose.setAttribute("tooltip", "Discard Changes")
        let appletEditDelete = document.createElement("button");
        appletEditDelete.innerText = "Clear";
        appletEditDelete.dataset.colorize = "red";
        appletEditDelete.setAttribute("tooltip", "Delete Permanently")
        let appletEditSave = document.createElement("button");
        appletEditSave.innerText = "Save";
        appletEditSave.setAttribute("tooltip", "Save Changes")
        appletEditDialog.appendChild(appletEditSave)
        appletEditDialog.appendChild(appletEditClose)
        appletEditDialog.appendChild(appletEditDelete)
        this.contentContainer.appendChild(appletEditDialog);
        let tab = document.createElement("button");
        tab.innerText = metaData.label;
        tab.addEventListener("click", () => {
            this.addContainer.style.display = "none";
            this.applets.forEach((e) => {
                e.inactive();
            })
            applet.active();
        })
        tab.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          appletEditDialog.showModal();
          appletRenameInput.value = applet.label;
        })
        appletEditClose.addEventListener("click", (e) => {
          appletEditDialog.close();
        })
        appletEditDelete.addEventListener("click", () => {
          if(window.prompt("Enter applet name to delete") === applet.label){
            tab.style.display = "none"
            this.applets = this.applets.filter(e => e.id != applet.id)
            if(applet.isActive){
              applet.inactive();
              if(this.applets.length == 0){
                this.add.click();
              }
              else{
                this.applets[0].active();
              }
            }
            appletEditDialog.close();
          }
          else{
            alert("Wrong Name, Retry Again After Sometime");
          }
        })
        appletEditSave.addEventListener("click", (e) => {
          if(appletRenameInput.value != ""){
            tab.innerText = appletRenameInput.value;
            applet.label = appletRenameInput.value;
            appletEditDialog.close();
          }
          else{
            alert("Cannot Accept Empty Name");
          }
        })
        appletRenameInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            appletEditSave.click();
          }
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
        this.isActive = false;
        this.coolDown = new Date();
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
        this.frameContainer = document.createElement("div");
        this.frameContainer.appendChild(this.iframe)
        this.debugView = document.createElement("div");
        this.debugView.classList.add("debugView")
        this.frameContainer.appendChild(this.debugView)
        this.parent.appendChild(this.frameContainer)
        this.editSpace = document.createElement("div");
        this.editSpace.classList.add("editSpace")
        this.solveError = document.createElement("button");
        this.solveError.setAttribute("tooltip", "Fix Bug")
        this.solveError.innerText = "Solve Issue";
        this.solveError.disabled = true;
        this.editInput = document.createElement("input");
        this.editInput.placeholder = "What Modification Do You Want?"
        this.editInput.classList.add("editInput")
        this.editInput.addEventListener("keyup", (e) => {
          if(e.key == "Enter"){
            this.submitEdit.click();
          }
        })
        this.editSpace.appendChild(this.editInput);
        this.submitEdit = document.createElement("button");
        this.submitEdit.innerText = "Modify Applet";
        this.submitEdit.setAttribute("tooltip", "Modify Applet")
        this.editSpace.appendChild(this.submitEdit)
        this.editSpace.appendChild(this.solveError);
        this.parent.appendChild(this.editSpace);
        this.versionControlOpen = document.createElement("button");
        this.versionControlOpen.innerText = "Versions";
        this.versionControlOpen.setAttribute("tooltip", "See Versions")
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
                this.coolDown = new Date();
                this.versionControlOpen.disabled = true;
                this.solveError.disabled = true;
                this.canModify = false;
                this.submitEdit.disabled = true;
                let aspectRatio = window.innerWidth/window.innerHeight;
                let orientation = aspectRatio > 1 ? "Landscape" : "Portrait";
                let orientationNote = `Remember the device in which this html is going to be viewed is a device in orientation ${orientation}, so make the style and css to work in this ${orientation} orientation the device has resolution ${window.innerWidth}x${window.innerHeight} so set the pixel size according to this and all the canvas sizes to best fit this requirement`
                let cdnList = STD_CDN.map(e => JSON.stringify(e)).join(",") + " .";
                let prompt = `${this.appletInfo.html}\nModify The above html code to include the following modification, you have been provided with the screenshot of the current app: ${this.editInput.value}. do the modification by modifying the above code to match the needed modification.*Do not add any comments in the code especially js*. don't add any comments it is a strict warning, do not add comments not at all as this cause lots of error as the code which you write gets commented along with the comment in js, even if you use comments use multiline comments in js to exactly specify the start and end of the comment. change the fundamental working of the html code as per the modification requested. add the given modification without causing errors. \n Give the full code do not skip any code, the code you have given should be able to run perfectly verbatim to what you have given. do not give indications like triple dots to make the user assume code is written. Ex. <div>...</div> is wrong, complete it like <div>Hi I am a div</div>. don't leave the code incomplete.
Here is list of all cdns you can use as required , this list is not exhaustive if you need other cdns you may use maybe for code highlight or any ui library, Remember do not use all the cdns but for particular tasks you can use them, use the exact version and link of cdn as given in following:- ${cdnList}. For whichever cdn's you are using, some may need import maps so use simple script tag with src by default but as given above use import map if using cdns like three.js.
Note:- Do not add any specific url other than the given cdn links for importing the libraries or framework. Remove urls of any sorts of images just do not give you are not accurate do not give even it is for a texture or a image.
Do not forget to import the cdns.
Important Note:-${orientationNote}
NOTE:- If you are using a string with the innerContent being </script> then escape it to be <\\/script> for example:-\n <script>let a = "</script>";</script> is wrong and will throw error instead <script>let a = "<\\/script>";</script> \n this can come into play when you want to dynamically change the inner document of an iframe and in this process you set it to a string representing the html which contains this script tag in the string or when you display a code snippet on the screen and dynamically update it then. a good rule of thumb is if you are using any html tag in a string then properly escape it. replacing <,> with &lt;, &gt; might not work always as seen in the iframe example where the string is still going to converted into actual html element via innerHTML or something else`
                try {
                    const imageDataURL = await getIframeSnapshot(this.iframe);
                    const blobImage = new ImageDataBlob(imageDataURL);
                    console.log(imageDataURL);
                    this.enableLoading();
                    const rectifiedHTML = await modelRectify.generateContentStream([blobImage, prompt]);
                    this.switchDebugState(true);
                    let completeCode = "";
                    for await(const chunk of rectifiedHTML.stream){
                      const chunkText = chunk.text();
                      if (chunkText) {
                        completeCode += chunkText;
                        // this.responseText.textContent += chunkText; // append text progressively
                        this.showCode(completeCode);
                        this.debugView.scrollTo({
                          top: this.debugView.scrollHeight,
                          behavior: "instant"
                        });
                      }
                    }
                    console.log(completeCode)
                    this.switchDebugState(false);
                    // // console.log(rectifiedHTML)
                    // // console.log(rectifiedHTML.response)
                    // // console.log(rectifiedHTML.response.text())
                    // console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = html_beautify((JSON.parse(completeCode)).html, beautifyOptions)
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
                  this.versionControlObject.selectedVersion.switchToThisVersion();
                }
                this.submitEdit.disabled = false;
                // this.solveError.disabled = false;
                this.canModify = true;
                this.versionControlOpen.disabled = false;
            }
        });
        this.canSolve = false;
        this.solveError.addEventListener("click", async () => {
            if(this.canSolve){
                this.coolDown = new Date();
                this.versionControlOpen.disabled = true;
                this.submitEdit.disabled = true;
                let errorMessageList = this.errors.map(e => formatError(e, this.appletInfo.html)).join("\n");
                let aspectRatio = window.innerWidth/window.innerHeight;
                let orientation = aspectRatio > 1 ? "Landscape" : "Portrait";
                let orientationNote = `Remember the device in which this html is going to be viewed is a device in orientation ${orientation}, so make the style and css to work in this ${orientation} orientation the device has resolution ${window.innerWidth}x${window.innerHeight} so set the pixel size according to this and all the canvas sizes to best fit this requirement`
                let errorInfos = `${this.appletInfo.html} \n This is the list of errors with the above HTML code fix these error without causing another error or modifying the core framework/integrity of the functioning of the code, you have been provided with the screenshot of the current app when is errored. Remove the comments entirely it is mostly the case in an error specifically (Uncaught SyntaxError: Unexpected end of input) remove the comment in this line and in the entire source code if this error is occuring \n ${errorMessageList}. \n Give the full code do not skip any code, the code you have given should be able to run perfectly verbatim to what you have given. do not give indications like triple dots to make the user assume code is written. Ex. <div>...</div> is wrong, complete it like <div>Hi I am a div</div>. don't leave the code incomplete
Note:- Do not add any specific url of any sorts of images just do not give you are not accurate do not give even it is for a texture or a image.
Important Note:-${orientationNote}
NOTE:- If you are using a string with the innerContent being </script> then escape it to be <\\/script> for example:-\n <script>let a = "</script>";</script> is wrong and will throw error instead <script>let a = "<\\/script>";</script> \n this can come into play when you want to dynamically change the inner document of an iframe and in this process you set it to a string representing the html which contains this script tag in the string or when you display a code snippet on the screen and dynamically update it then. a good rule of thumb is if you are using any html tag in a string then properly escape it. replacing <,> with &lt;, &gt; might not work always as seen in the iframe example where the string is still going to converted into actual html element via innerHTML or something else`
                console.log(errorMessageList)
                this.canSolve = false;
                this.solveError.disabled = true;
                try {
                    const imageDataURL = await getIframeSnapshot(this.iframe);
                    const blobImage = new ImageDataBlob(imageDataURL);
                    console.log(imageDataURL);
                    this.enableLoading();
                    const rectifiedHTML = await modelRectify.generateContentStream([blobImage, errorInfos]);
                    // // console.log(rectifiedHTML)
                    // // console.log(rectifiedHTML.response)
                    this.switchDebugState(true);
                    let completeCode = "";
                    for await(const chunk of rectifiedHTML.stream){
                      const chunkText = chunk.text();
                      if (chunkText) {
                        completeCode += chunkText;
                        // this.responseText.textContent += chunkText; // append text progressively
                        this.showCode(completeCode);
                        this.debugView.scrollTo({
                          top: this.debugView.scrollHeight,
                          behavior: "instant"
                        });
                      }
                    }
                    console.log(completeCode)
                    this.switchDebugState(false);
                    // console.log(rectifiedHTML.response.text())
                    // console.log((JSON.parse(rectifiedHTML.response.text())).html)
                    this.appletInfo.html = html_beautify((JSON.parse(completeCode)).html, beautifyOptions)
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
                    this.versionControlObject.selectedVersion.switchToThisVersion();
                }
                this.versionControlOpen.disabled = false;
                this.submitEdit.disabled = false;
            }
        })
        this.enableLoading();
        this.checkpoint = 0;
        this.tries = 0;
        //*Actual Code
        this.tryGenerateApplet();

        //*Debugging Code To Avoid Applet generation using AI while testing or creating new features
        // this.appletInfo.html = html_beautify(this.appletInfo.html, beautifyOptions)
        // this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id)
        // this.versionControlObject.root = new Version(this.appletInfo.html, "Create Falling Sand Simulation", 0, this.versionControlObject);
        // this.versionControlObject.selectedVersion = this.versionControlObject.root;
        // this.showVersions();
        // console.log(this.versionControlObject);
        // this.submitEdit.disabled = false;
        // this.canModify = true;
        //*Debugging Code ended here

        this.iframeError();
    }

    async tryGenerateApplet(){
      try {
          await this.generateApplet();
      } catch (error) {
        console.error(error);
        console.log(this.tries);
        console.log(this.checkpoint);

        if (isFinite(this.checkpoint)) {
          if (this.tries <= 3) {
            this.switchDebugState(false);
            this.enableLoading();
            this.tries++;
            this.tryGenerateApplet();
          }
          else{
            if(confirm("Severe error occured, retried (3) times, should I retry once more?")){
              this.tryGenerateApplet();
            }
          }
        }
      }
    }

    enableLoading(){
      this.iframe.srcdoc = LoadingHTML;
    }

    showVersions(){
        this.versionWindowInterface.innerHTML = "";
        let mainVersionUI = this.versionControlObject.root.createVersionUI();
        this.versionWindowInterface.appendChild(mainVersionUI.initialWrapper);
    }

    showCode(code){ // code is escaped
      this.debugView.innerHTML = `<pre><code class="language-html">${html_beautify(cleanStreamedHtml(code), beautifyOptions).replaceAll("\\\"", "\"").replaceAll("\\\\", "\\").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code></pre>`;
      Prism.highlightAllUnder(this.debugView);
    }
    
    showMD(completeResponse){
      let extract = renderMarkdownWithSVG(completeResponse);
      // console.log(extract);
      this.debugView.innerHTML = DOMPurify.sanitize(extract).replace(/\[object Object\]/ig, "");
      mathRectify(this.debugView);
      Prism.highlightAllUnder(this.debugView);
      this.debugView.querySelectorAll("button").forEach((e) => {
        iconify(e);
      })
      this.debugView.querySelectorAll("svg").forEach(svg => {
        // console.log(svg.closest(".katex"))
        if(svg.closest(".katex") != null){
          return;
        }
        const wrapper = document.createElement('div');
        const shadow = wrapper.attachShadow({ mode: 'open' });
        const clonedSvg = svg.cloneNode(true);
        shadow.appendChild(clonedSvg);
        const style = document.createElement("style");
        style.innerHTML = `svg{
  display: table !important;
  margin: 1vh auto !important;
  border-radius: var(--button-bounding) !important;
  border: var(--border) !important;
  border-top: none !important;
  max-width: 100% !important;
  max-height: 100vh !important;
  min-height: 50vh !important;
      }`
        wrapper.style.maxWidth = "calc(100% - 1vh) !important";
        shadow.appendChild(style);
        svg.parentNode.insertBefore(wrapper, svg);
        svg.parentNode.removeChild(svg);
        setTimeout(() => {
          rectifySVG(clonedSvg);
        }, 0)
      });
    }

    switchDebugState(isDebugEnable){
      if(isDebugEnable){
        this.debugView.style.display = "block";
        this.iframe.style.display = "none";
      }
      else{
        this.debugView.style.display = "none";
        this.iframe.style.display = "block";
      }
    }

    generateApplet = async () => {
        //**Primitives
        if (this.metaPrompt == null) {
          let metaPrompt = await Ai.giveMetaPrompt(this.mockupMode);
          this.metaPrompt = metaPrompt;
          console.log(this.checkpoint);
        }
        let url = Ai.manager.getDataUrl();
        Ai.responseImage.src = url.join(",");
        Ai.imageDataURL.inlineData.data = url[1];
        let aspectRatio = window.innerWidth/window.innerHeight;
        let orientation = aspectRatio > 1 ? "Landscape" : "Portrait";
        let orientationNote = `Remember the device in which this html is going to be viewed is a device in orientation ${orientation}, so make the style and css to work in this ${orientation} orientation the device has resolution ${window.innerWidth}x${window.innerHeight} so set the pixel size according to this and all the canvas sizes to best fit this requirement`
        // let cdnList = STD_CDN.map(e => JSON.stringify(e)).join(",") + " .";
        let cdnList = toon.encode(STD_CDN) + "\n";
        console.log(cdnList)
        let recipePrompt = `Create a step by step guide to Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${this.metaPrompt}${this.mockupMode? ".Use this image as a mockup design of the final webpage":""}. Give detailed step by step guide. give the architecture of the functioning of the i.e. the process on which the html code is working, for example:- for creating a to do list you can show the architecture as such:- task class with properties as task_text and status. task manager class which handles status of tasks. also provide structure of UI to be followed and the basic underlying design of the web page. for example:- for a to do list create a section with a text_input and a add button to add tasks. a section below it to search tasks and a section below it which has the list of tasks sorted from latest to oldest. a select option on the other side of the search section to change sorting of the list of tasks such as date created, important, A to Z or Z to A and etc. make the tutorial friendly for a beginner to advanced programmer. add all the minute details. focus on implementation more. if maths or physics is required also explain the mathematics or the physics to solve the problems and sub-problems. Do not write the code your self as this is an exercise to the person reading your tutorial. use code snippets to only enhance implementation process and understanding purposes in javascript. use code snippets only when needed do not give code snippets for css or html. do not tell to create index.html files or give tutorial regarding creating the files. Making the web page responsive is a very crucial make the styling in aspect of responsive UI and make the UI able to work on mobile and laptops and tablets. do not suggest to create any other files or folders because the html code should be independent of the file structure around it because where the code is being used you don't have access to file system, although you can use http links but avoid as much as possible for media and stuff only use for cdns. Here is list of all cdns you can use as required , this list is not exhaustive if you need other cdns you may use maybe for code highlight or any ui library, Remember do not use all the cdns but for particular tasks you can use them and if used also mention the CDN link and implementation but do not give the entire code just the implementation details/code, use the exact version and link of cdn as given in following:- ${cdnList}. For whichever cdn's you are using mention there name and their cdn link clearly as this step is very very important mention only the cdn link's which are being used and how to use them using script tag as some may need import maps so give them the entire tutorial with respect to that and show them exactly how to use the cdn and whether they need to use the cdn in a simple script tag with src or an import map if using import map tell the user that how should they import the cdn in the script type module.Note:- Do not add any specific url of any sorts of images just do not give you are not accurate do not give even it is for a texture or a image. ${orientationNote}`;


        switch (this.checkpoint) {
          case 0:
            //** FFExpermental
            const modelReq = await modelModelQuery.generateContent([structuredClone(Ai.imageDataURL)], `**Role:** You are a Lead 3D Asset Supervisor specializing in **Low-Poly / Prototype** environments.

**Objective:** Analyze the input and generate a strictly formatted JSON manifest of 3D assets.

### PART 1: THE NAMING PROTOCOL (Rigorous Logic)

You must determine the \`asset_name\` by applying the **"Visual Essentialism Test"**.
Ask yourself: *"If I search for this object on a free low-poly asset store (like poly.pizza), would a generic model suffice?"*

**RULE A: The "Manufactured Object" Reduction (Generic Geometry)**

  * **Logic:** For cars, planes, electronics, or furniture, specific brands or models are **irrelevant** at a distance or in low-poly style. You **MUST** reduce them to their class name.
  * *Reasoning:* A "Ferrari" and a "Ford" both look like a "car" when squinting.
      * \`Ferrari\` $\rightarrow$ **car**
      * \`De Havilland Plane\` $\rightarrow$ **plane**
      * \`iPhone 15\` $\rightarrow$ **phone**

**RULE B: The "Celestial Body" Exception (Specific Texture)**

  * **Logic:** For Major Solar System bodies, a generic sphere is **insufficient** because their identity is defined by specific surface features (continents, craters). You **MUST** keep the specific name.
  * *Reasoning:* A generic "planet" does not look like "Earth". A generic "moon" does not look like "Phobos".
      * \`Planet Earth\` $\\rightarrow$ **Earth** (IRREDUCIBLE)
      * \`Jupiter\` $\\rightarrow$ **Jupiter** (IRREDUCIBLE)
  * **Sub-Clause:** Distant cosmic objects (random stars, black holes) lack distinct surface features and **MUST** be reduced.
      * \`Star Betelgeuse\` $\\rightarrow$ **star**
      * \`Black Hole Sgr A*\` $\\rightarrow$ **blackhole**

**RULE C: Word Count Hard Limits**

  * **Constraint:** **STRICTLY 1 WORD.** (Zero exceptions).
  * **The "Ambiguity" Clause:** You may use **MAXIMUM 2 WORDS** *only* if a single word creates a critical misunderstanding of the object's shape(you should not use 2 words if you want to do the following:- Ex. "car drawing" is not the correct way to use 2 word instead do "car").
      * *Allowed:* \`fighter jet\` (If "jet" implies a passenger plane).
      * *Allowed:* \`pine tree\` (If "tree" implies a generic round deciduous tree).
      * *Forbidden:* \`red car\` (Adjective is not structural).
      * *Forbidden:* \`wooden table\` (Material is not structural).
  * **Syntax:**
      * NO Underscores (\`racing_car\`, \`car_side_profile_sketch\` = ILLEGAL).
      * NO Adjectives (\`red\`, \`big\`, \`wooden\` = ILLEGAL).
      * NO Verbs (\`flying\`, \`broken\` = ILLEGAL).
      * NO Determiners (\`the\`, \`a\` = ILLEGAL).
      * NO Preposition (\`in\`, \`on\`, \`at\` = ILLEGAL)
  * **Normalization:**
      * \`simple_pendulum\` $\\rightarrow$ \`pendulum\`
      * \`de havilland plane\` $\\rightarrow$ \`plane\`

-----

### PART 2: THE DECOMPOSITION LOGIC (Animation Dependent)

**1. The "Cohesive Unit" Default**

  * Treat objects as **indivisible wholes** by default (e.g., Car, Forest, House).
  * *Input:* "A car driving fast." $\rightarrow$ Output: \`car\`.

**2. The "Animation" Override**

  * Only break an object into parts if the requirements explicitly describe independent movement of those parts.
  * *Input:* "A car where the door opens." $\\rightarrow$ Output: \`chassis\`, \`door\`.

**3. The "Procedural" Override**

  * If the requirement implies generating a group (e.g., "Create a forest"), list the atomic unit.
  * *Input:* "Generate a forest." $\\rightarrow$ Output: \`tree\`, \`rock\`.

-----

### PART 3: OUTPUT FORMAT (JSON)

**Constraints:**

1.  **asset_name:** Common nouns (mostly). Proper nouns allowed ONLY for Rule B (Planets). No underscores. Max 2 words (prefer 1).
2.  **description:** Strictly < 20 words. Describes placement/function.

**EXAMPLES:**

**❌ INCORRECT:**

\`\`\`json
[
  { "asset_name": "Ferrari_488", "description": "Red car." }, // ERROR: Specific Brand
  { "asset_name": "planet", "description": "It is Earth." },   // ERROR: Earth is irreducible
  { "asset_name": "simple_pendulum", "description": "Swinging." } // ERROR: Underscore
]
\`\`\`

**✅ CORRECT:**

\`\`\`json
[
  { "asset_name": "car", "description": "Vehicle driving on the road." },
  { "asset_name": "Earth", "description": "Large sphere with blue and green texture." },
  { "asset_name": "plane", "description": "Aircraft flying above the clouds." },
  { "asset_name": "pendulum", "description": "Swinging back and forth." }
]
\`\`\`

**Analyze the attached input and generate the JSON list now:** ${this.description}`)
            console.log(modelReq.response.text())
            this.checkpoint = 1;
          case 1:
              this.switchDebugState(false);
              this.checkpoint = 2;
              console.log(this.checkpoint)
          case 2:
            let recipe = await model.generateContentStream([structuredClone(Ai.imageDataURL), recipePrompt]);
            let completeResponse = "";
            let firstResponse = true;
            for await(const chunk of recipe.stream){
              if(firstResponse){
                this.switchDebugState(true)
              }
              firstResponse = false;
               const chunkText = chunk.text();
              if (chunkText) {
                completeResponse += chunkText;
                // this.responseText.textContent += chunkText; // append text progressively
                this.showMD(completeResponse)
              }
            }
            this.recipeText = completeResponse;
            this.checkpoint = 3;
            console.log(this.checkpoint)
          case 3:
            let fullPrompt = `Create HTML code using internal CSS in style tag in head, and internal JavaScript in script tag in body after all html elements in body and. the HTML code is based on the following requirement:- ${this.description}. the image's description and summary of the given image on which the required HTML code was needed to visualize or illustrate some aspects is as follow ${this.metaPrompt}${this.mockupMode? ".Use this image as a mockup design of the final webpage":""}.Give a description and title to the HTML code. This should be a full body interface not bounded in a container div but make the page scrollable and *Do not add any comments in the code especially js*. don't add any comments it is a strict warning, do not add comments not at all as this cause lots of error as the code which you write gets commented along with the comment in js, even if you use comments use multiline comments in js to exactly specify the start and end of the comment. format the html code properly with lines and indentations
    ${rectificationPrompt}
    Style guide:- 
    Primary color:#ff5100
    Body TAG Background-color:Transparent if not conflicting with the below requirements.
    Follow the following tutorial/step-by-step guide to build the HTML code:-
    ${this.recipeText}${this.recipeText.toLowerCase().includes("gemini ")?`\n\nBelow is the implementation and usage of some features in gemini and how to properly import it:-\n${STD_CDN.filter(e => e.name == "Gemini")[0]["cdnlink&Usage"]}`:""}
    Note:- Do not add any specific url other than the given cdn links for importing the libraries or framework. Remove urls of any sorts of images just do not give you are not accurate do not give even it is for a texture or a image.
    Do Not Forget to add the cdn links in the html page you have to add it from your side if you forget to add the cdn links from your side then the entire html code will fail use the cdn links which are mentioned above which are mentioned above strictly.
    Important Note:-${orientationNote}
    NOTE:- If you are using a string with the innerContent being </script> then escape it to be <\\/script> for example:-\n <script>let a = "</script>";</script> is wrong and will throw error instead <script>let a = "<\\/script>";</script> \n this can come into play when you want to dynamically change the inner document of an iframe and in this process you set it to a string representing the html which contains this script tag in the string or when you display a code snippet on the screen and dynamically update it then. a good rule of thumb is if you are using any html tag in a string then properly escape it. replacing <,> with &lt;, &gt; might not work always as seen in the iframe example where the string is still going to converted into actual html element via innerHTML or something else`;
            console.log(fullPrompt)
            // console.log(Ai.imageDataURL)
            // console.log(genAI);
    
            const result = await modelApplet.generateContentStream([structuredClone(Ai.imageDataURL), fullPrompt]);
            let completeCode = "";
            for await(const chunk of result.stream){
              const chunkText = chunk.text();
              if (chunkText) {
                completeCode += chunkText;
                // this.responseText.textContent += chunkText; // append text progressively
                this.showCode(completeCode);
                this.debugView.scrollTo({
                  top: this.debugView.scrollHeight,
                  behavior: "instant"
                });
              }
            }
            console.log(completeCode);
            // console.log(result.response.text())
            // console.log(JSON.parse(result.response.text()))
            // console.log(JSON.parse(result.response.text()).html)
            // this.parent.innerText = result.response.text();
            // const rectifiedHTML = await modelRectify.generateContent([`${JSON.parse(result.response.text()).html}${rectificationPrompt}`])
            this.switchDebugState(false);
            this.appletInfo = JSON.parse(completeCode);
            this.appletInfo.html = html_beautify(this.appletInfo.html, beautifyOptions);
            // this.appletInfo.html = JSON.parse(result.response.text()).html;
            this.coolDown = new Date();
            this.iframe.srcdoc = injectErrorHandlerIntoHTML(this.appletInfo.html, this.id);
            console.log(this.versionControlObject)
            this.versionControlObject.root = new Version(this.appletInfo.html, this.description, 0, this.versionControlObject, this);
            this.versionControlObject.selectedVersion = this.versionControlObject.root;
            this.showVersions();
            this.submitEdit.disabled = false;
            this.canModify = true;
            console.log(this.appletInfo.html)
            this.checkpoint = Infinity;
            console.log(this.checkpoint);
          default:
            break;
        }
        // console.log(recipeText)
    }

    iframeError(){
        window.addEventListener('message', (event) => {
            if (event.data.type !== 'iframe-error'){return;}
            if (event.data.id !== this.id){return;}
            console.error('Iframe error:', event.data);
            this.canSolve = true;
            this.solveError.disabled = false;
            this.errors.push(event.data)
            if((new Date() - this.coolDown) > 10000){
              let confirmed = confirm("An error occured. should I auto-fix bug")
              if(confirmed){
                this.solveError.click();
              }
              else{
                this.coolDown = new Date();
              }
            }
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
        this.isActive = true;
    }

    inactive(){
        this.parent.style.display = "none"
        this.isActive = false;
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
        console.log(versionControlObject)
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
        currentVersionButton.setAttribute("tooltip","Go to " + currentVersionButton.innerText)
        let forks = document.createElement("div");
        currentVersionWrapper.appendChild(currentVersionButton)
        initialWrapper.appendChild(currentVersionWrapper)
        initialWrapper.appendChild(forks);
        initialWrapper.classList.add("initialWrapper");
        currentVersionWrapper.classList.add("currentVersionWrapper");
        currentVersionButton.classList.add("currentVersionButton");
        forks.classList.add("forks");
        let bindedFunc = this.switchToThisVersion.bind(this)
        currentVersionButton.addEventListener("click", bindedFunc)
        
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

    switchToThisVersion(){
      console.log(this.versionControlObject);
      this.versionControlObject.selectedVersion = this;
      // this.versionControlObject.selectedVersion.switchToThisVersion();
      this.applet.errors = [];
      this.applet.solveError.disabled = true;
      this.applet.iframe.srcdoc = injectErrorHandlerIntoHTML(this.html, this.applet.id);
      this.applet.appletInfo.html = this.html;
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
        );return false;
      }; window.addEventListener("unhandledrejection", function(e) {parent.postMessage({ type: 'iframe-error-promise', message:e.reason.message, error: e.reason.stack, id:${id} },'*');return false;});
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
    let linesAround = `${lines[e.lineno - 15]}${lines[e.lineno - 14]}\n${lines[e.lineno - 13]}\n${lines[e.lineno - 12]}\n${lines[e.lineno - 11]} \/\/<-- Error occurred here\n${lines[e.lineno - 10]}\n${lines[e.lineno - 9]}\n${lines[e.lineno - 8]}\n${lines[e.lineno - 7]}`
    return `${e.message}:- at line number(${e.lineno - 11}) and column number(${e.colno}) that is ${e.error?.replace(/\n/g, " ")})).\nIt occurred in the block of code below:-\n${linesAround}`
}

function cleanStreamedHtml(str) {
    let s = str;
    const prefixRegex = /^\{\s*"html"\s*:\s*"/;
    s = s.replace(prefixRegex, "");
    const suffixRegexes = [
        /"\s*\}\s*$/,
        /",\s*\}\s*$/
    ];
    for (const re of suffixRegexes) {
        if (re.test(s)) {
            s = s.replace(re, "");
            break;
        }
    }
    return s;
}

async function getIframeSnapshot(iframeElement) {
    if (!iframeElement || iframeElement.tagName !== 'IFRAME') {
        throw new Error("Element is not an iframe");
    }
    const doc = iframeElement.contentDocument;
    if (!doc) {
        throw new Error("CORS Blocked: Cannot access iframe content.");
    }
    // Capture
    return await htmlToImage.toPng(doc.body);
}

const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);
const appletManager = new AppletManager(Canvas, model, Ai, ai);