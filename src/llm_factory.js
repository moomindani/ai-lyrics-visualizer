import {WebLlm} from './webLlm'
import {OpenAiLlm} from './openAiLlm'

export function createLlm(type) {
    switch (type) {
        case 'webllm':
            console.log("Initializing LLM using WebLLM");
            return new WebLlm();
        case 'openai':
            console.log("Initializing LLM using OpenAI");
            return new OpenAiLlm();
        default:
            throw new Error('Invalid llm type');
    }
}
