// gmailApi.js
import { getHeader, getTextFromPayload } from './utils.js';

// Gmail OAuth2 Sign-in
export async function signIn() {
    const redirectUri = window.location.origin;
    const scope =
        'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${window.GMAIL_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(
        scope
    )}`;
    window.location = authUrl;
}

// Fetch user emails using Gmail API
export async function getEmails() {
    const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=2&labelIds=INBOX',
        {
            headers: { Authorization: `Bearer ${window.accessToken}` },
        }
    );

    const data = await res.json();
    if (!data.messages) return [];

    const emails = [];
    for (const msg of data.messages) {
        // Fetch each email's full content
        const details = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
                headers: { Authorization: `Bearer ${window.accessToken}` },
            }
        );

        const content = await details.json();
        const sender = getHeader(content.payload.headers, 'From');
        const subject = getHeader(content.payload.headers, 'Subject');
        const text = getTextFromPayload(content.payload);

        emails.push({
            sender,
            subject,
            text,
            headers: content.payload.headers,
        });
    }

    return emails;
}
