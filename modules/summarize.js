import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

async function summarize(mail) {
    const client = await Client.connect("Harsha000007/t5-model");
    const result = await client.predict("/predict", [mail]);

    return result.data[0];
}

export default summarize;
