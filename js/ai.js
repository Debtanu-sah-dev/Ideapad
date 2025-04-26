const prompt = "Explain the image and give a summary and conclusion of it with proper inference and related topics also if any question is proposed in the question then provide a solution to the given subject.";

class AI{
    constructor(manager, model, prompt, parent){
        this.manager = manager;
        this.prompt = prompt;
        this.model = model;
        this.parent = parent;
    }
}