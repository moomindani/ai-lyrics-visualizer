export class Llm {
    constructor() {
        this.apiKey = null;
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    getResponse(prompt) {
        throw new Error('getResponse method must be implemented by child classes');
    }
}