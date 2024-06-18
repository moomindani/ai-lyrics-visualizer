import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngineInterface = null;

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

async function run() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  const selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC";

  engine = await webllm.CreateWebWorkerMLCEngine(
    new Worker(new URL("./ww.ts", import.meta.url), { type: "module" }),
    selectedModel,
    { initProgressCallback: initProgressCallback },
  );
}

export async function getAnalyzedList(prompt: string) {
  console.log("wwllm getAnalyzedList prompt=" + prompt);
  setLabel("prompt-label", prompt);

  let n= 1;
  const request: webllm.ChatCompletionRequest = {
    messages: [
      // {
      //   role: "system",
      //   content:
      //     "You are a helpful, respectful and honest assistant who are good at analyzing Japanese lyrics. " +
      //     "Make sure that you reply with marking lyrics with XML.",
      // },
      { role: "user", content: prompt },
    ],
    n: n,
    temperature: 0.2,
    max_tokens: 2048,
  };

  const reply0 = await engine.chat.completions.create(request);
  console.log(reply0);

  let replyAll = ''
  for(let i=0; i<n; i++){
    replyAll += reply0.choices[0].message.content + '\n';
  }
  console.log("getReply reply0=" + replyAll);
  setLabel("generate-label", replyAll);
  console.log(reply0.usage);
  return replyAll;
}


run();