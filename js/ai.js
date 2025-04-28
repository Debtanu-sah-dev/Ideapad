import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});
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
        this.createResponseButton = document.createElement("button");
        this.createResponseButton.addEventListener("click", this.run)
        this.createResponseButton.innerText = "Explain";
        this.run = this.run.bind(this)
        this.parent.appendChild(this.createResponseButton);
        console.log(this.manager)
    }
    run = async () => {
        let url = this.manager.getDataUrl();
        this.imageDataURL.inlineData.data = url;
        const result = await model.generateContent([this.imageDataURL, this.prompt]);
        console.log(result.response.text());
    }

    createResponse(){
        this.run();
    }
}

const ai = document.querySelector("#ai");
const Ai = new AI(Canvas, model, prompt, ai);