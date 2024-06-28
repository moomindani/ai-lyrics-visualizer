import {Llm} from './llm'
import * as webllm from "@mlc-ai/web-llm";


export class WebLlm extends Llm {
    constructor() {
        super();
        this.engine = null;
        this.model = "Llama-3-8B-Instruct-q4f32_1-MLC";
        // this.model = "Llama-3-70B-Instruct-q3f16_1-MLC";

    }

    getResponse(prompt) {
        this.callWebLlmAPI(prompt);
    }

    setApiKey(key) {
        throw new Error('WebLLM does not require API key');
    }

    async callWebLlmAPI(prompt) {
        const initProgressCallback = (report) => {
            console.log("initProgressCallback: " + report.text);
        };

        this.engine = await webllm.CreateWebWorkerMLCEngine(
            new Worker(new URL("./ww.ts", import.meta.url), {type: "module"}),
            this.model,
            {initProgressCallback: initProgressCallback},
        );

        let n = 1;
        const request = {
            messages: [
                // {
                //   role: "system",
                //   content:
                //     "You are a helpful, respectful and honest assistant who are good at analyzing Japanese lyrics. " +
                //     "Make sure that you reply with marking lyrics with XML.",
                // },
                {role: "user", content: prompt},
            ],
            n: n,
            temperature: 0.2,
            max_tokens: 2048,
        };

        const reply0 = await this.engine.chat.completions.create(request);
        console.log(reply0);

        let replyAll = ''
        for (let i = 0; i < n; i++) {
            replyAll += reply0.choices[0].message.content + '\n';
        }
        console.log("getReply reply0=" + replyAll);
        setLabel("generate-label", replyAll);
        console.log(reply0.usage);
        return replyAll;
    }
}