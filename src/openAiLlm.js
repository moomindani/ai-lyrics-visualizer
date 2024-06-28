import {Llm} from './llm'

export class OpenAiLlm extends Llm {
    getResponse(prompt) {
        this.callOpenAIAPI(prompt);
    }

    async callOpenAIAPI(prompt) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
        const body = JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {role: 'user', content: prompt}
            ]
        });
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('APIリクエストエラー:', error);
        }
    }
}