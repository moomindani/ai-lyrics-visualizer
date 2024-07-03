import {Llm} from './llm'
import * as webllm from "@mlc-ai/web-llm";


export class WebLlm extends Llm {
    constructor() {
        super();
        this.engine = null;
        this.model = "Llama-3-8B-Instruct-q4f32_1-MLC";
        // this.model = "Llama-3-70B-Instruct-q3f16_1-MLC";

    }

    async getResponse(prompt) {
        return await this.callWebLlmAPI(prompt);
    }

    setApiKey(key) {
        throw new Error('WebLLM does not require API key');
    }

    async initializeEngine() {
        return new Promise(async (resolve, reject) => {
            try {
                const initProgressCallback = (report) => {
                    console.log("initProgressCallback: " + report.text);
                    if (report.text.includes("Finish loading on WebGPU")) {
                        console.log("WebGPU loading finished");
                    }
                };

                this.engine = await webllm.CreateWebWorkerMLCEngine(
                    new Worker(new URL("./ww.ts", import.meta.url), {type: "module"}),
                    this.model,
                    {initProgressCallback: initProgressCallback},
                );

                // エンジンが正しく初期化されたことを確認
                if (this.engine && this.engine.chat && this.engine.chat.completions) {
                    resolve(this.engine);
                } else {
                    reject(new Error("Engine initialization incomplete"));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async callWebLlmAPI(prompt) {
        try {
            if (!this.engine || !this.engine.chat || !this.engine.chat.completions) {
                await this.initializeEngine();
            }
        } catch (error) {
            console.error("Error during WebGPU loading:", error);
            throw error;
        }

        let n = 1;
        const request = {
            messages: [
                {role: "user", content: prompt},
            ],
            n: n,
            temperature: 0.2,
            max_tokens: 2048,
        };

        try {
            console.log("WebLLM request: " + prompt);
            const reply0 = await this.engine.chat.completions.create(request);
            let replyAll = ''
            for (let i = 0; i < n; i++) {
                replyAll += reply0.choices[0].message.content + '\n';
            }
            console.log("WebLLM response:" + replyAll);
            return replyAll;
        } catch (error) {
            console.error("Error during API call:", error);
            throw error;
        }
    }
}