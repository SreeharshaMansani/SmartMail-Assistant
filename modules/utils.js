// Extract domain from an email address
export function extractDomain(senderEmail) {
    if (!senderEmail) return "";
    const match = senderEmail.match(/@([\w.-]+)/);
    return match ? match[1].toLowerCase() : "";
}

// Decode Base64-encoded email body content
export function decodeBase64(data) {
    try {
        const str = window.atob(data.replace(/-/g, "+").replace(/_/g, "/"));
        return decodeURIComponent(
            str.split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
    } catch {
        return "";
    }
}

// Recursively extract readable text content from email payloads
export function getTextFromPayload(payload) {
    if (!payload) return "";
    if (payload.mimeType === "text/plain" && payload.body?.data) return decodeBase64(payload.body.data);
    if (payload.mimeType === "text/html" && payload.body?.data) return decodeBase64(payload.body.data);
    if (payload.parts) return payload.parts.map(getTextFromPayload).join(" ");
    return "";
}

// Retrieve a specific email header value (e.g., Subject, From)
export function getHeader(headers, name) {
    return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

// Preprocess email text — strip HTML, normalize spaces, keep ASCII, truncate
export function preprocessEmailText(text, maxLength = 1500) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = text;
    let cleanText = tmp.textContent || tmp.innerText || "";
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    cleanText = cleanText.replace(/[^\x00-\x7F]/g, "");
    if (cleanText.length > maxLength) {
        cleanText = cleanText.substring(0, maxLength);
    }
    return cleanText;
}
