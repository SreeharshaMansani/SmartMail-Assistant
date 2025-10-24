// emailProcessor.js
import { preprocessEmailText } from './utils.js';

// Gemini API call helper
export async function callGeminiAPI(text) {
    if (!text || !text.trim()) {
        console.warn("Empty text passed to callGeminiAPI");
        return "unable to generate response";
    }

    const payload = {
        contents: [
            {
                parts: [{ text }],
            },
        ],
    };

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": window.GEMINI_KEY_latest,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const generated =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "unable to generate response";

        return generated;
    } catch (error) {
        console.error("Error during Gemini API call:", error);
        return "unable to generate response";
    }
}

// Main email processing function
export async function processEmail({ email, summary }) {
    const preprocessedBody = preprocessEmailText(email.text || "");

    const responsePrompt = `
You are an AI email assistant. Read the email below and draft a professional, concise, and polite response.

Email from: ${email.sender || "Unknown"}
Subject: ${email.subject || "No subject"}
Body:
${preprocessedBody}

Instructions:
- If you clearly understand the email, write a professional and polite response (3–5 sentences).
- Address the sender by name if possible.
- Keep it concise and relevant.
- dont create any subject line in this reposnse
- Use proper grammar and punctuation.
- ⚠️ If the email content is unclear or nonsensical:
  Respond with EXACTLY this text (all lowercase, no punctuation, no extra words): did not understand
- If you output anything other than the exact phrase "did not understand", it will be treated as incorrect.
- Do NOT apologize, explain, or modify the phrase.
-strictly follow the instructions

`;

    let generatedResponse = await callGeminiAPI(responsePrompt);
    const cleaned = generatedResponse.trim().toLowerCase().replace(/\n+/g, " ");

    if (
        cleaned === "did not understand" ||
        cleaned.includes("sorry") ||
        cleaned.includes("unable") ||
        cleaned.includes("failed") ||
        cleaned.includes("cannot") ||
        cleaned.includes("couldn't")
    ) {
        generatedResponse = "unable to generate response";
    }

    const subjectPrompt = `
Based on the following email summary, generate one short, clear, and professional subject line.

Summary:
${summary || "No summary available"}

Subject:
`;
    const generatedSubject =
        (await callGeminiAPI(subjectPrompt)).split("\n")[0].trim() ||
        "Re: Your Email";

    return { generatedResponse, generatedSubject };
}
