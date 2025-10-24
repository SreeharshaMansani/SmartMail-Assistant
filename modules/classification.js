// classification.js
import { extractDomain } from './utils.js';
import { promotionalDomains } from './promo_domains.js';

// Rule-based scoring engine
export function getRuleScore(email) {
    let score = 0;
    const domain = extractDomain(email.sender);
    const subject = (email.subject || "").toLowerCase();
    const body = (email.text || "").toLowerCase();
    const headers = email.headers || [];

    if (promotionalDomains.has(domain)) score += 1.5;
    if (subject.match(/\b(sign[- ]?in|login|password|account|security|device|alert|verification|reset)\b/)) score -= 3;
    if (body.match(/\b(sign[- ]?in|login|password|account|security|device|alert|verification|reset)\b/)) score -= 2;
    if (domain.match(/(mongodb|google|aws|github|azure|gitlab|notion|vercel|netlify)\.com$/)) score -= 2;
    if (subject.match(/\b(offer|discount|sale|promo|deal|subscribe)\b/)) score += 2;
    if (body.match(/\b(offer|discount|coupon|limited time|subscribe|newsletter)\b/)) score += 1;
    if (subject.match(/\b(invoice|payment|receipt|order|application|interview)\b/)) score -= 2;
    if (email.sender.toLowerCase().startsWith("noreply") || email.sender.toLowerCase().includes("noreply@")) score += 1;
    if (headers.some(h => h.name.toLowerCase() === 'list-unsubscribe')) score += 2;
    if (body.includes("unsubscribe")) score += 2;
    if ((subject.match(/!/g) || []).length > 2) score += 1;
    if (subject === subject.toUpperCase() && subject.length > 5) score += 1;
    if (subject.startsWith("re:") || subject.startsWith("fwd:")) score -= 1;
    if ((body.match(/https?:\/\//g) || []).length > 2) score += 1;
    if (body.match(/₹|\$|% off/)) score += 1;

    return score;
}

// ML-driven classification using Hugging Face API
export async function classifyWithML(text) {
    const model = "facebook/bart-large-mnli";
    const candidateLabels = ["Important", "Promotional", "Spam", "Casual"];

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${window.HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    candidate_labels: candidateLabels,
                    multi_label: false,
                },
            }),
        });

        if (!response.ok) {
            console.error(`ML Classification failed: ${response.status} ${response.statusText}`);
            return { label: "Unknown", score: 0 };
        }

        const data = await response.json();

        if (data.labels && data.scores && data.labels.length > 0) {
            return {
                label: data.labels[0],
                score: data.scores[0],
            };
        }

        return { label: "Unknown", score: 0 };
    } catch (error) {
        console.error("Error in ML classification:", error);
        return { label: "Unknown", score: 0 };
    }
}

// Hybrid classification combining both rule-based and ML methods
export async function hybridClassify(email) {
    const ruleScore = getRuleScore(email);
    const textForML = `${email.subject || ""}\n${email.text || ""}`;
    const mlResult = await classifyWithML(textForML);

    const mlScoreMap = {
        Promotional: 2,
        Important: -1,
        Spam: 3,
        Casual: 0,
        Unknown: 0,
    };

    const mlScore = mlScoreMap[mlResult.label] || 0;
    const confidence = mlResult.score || 0.5;
    const combinedScore = (1 - confidence) * ruleScore + confidence * mlScore;

    if (combinedScore >= 2) return "Promotional";
    if (combinedScore <= -0.5) return "Important";
    if (mlResult.label === "Spam" || mlScore >= 3) return "Spam";

    return "Casual";
}
