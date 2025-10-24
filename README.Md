# 📧 AI Gmail Analyzer (Web App)

> ⚠️ **Note:** This project is for testing purposes only and works on **localhost**. Do not deploy publicly.

A web application that connects to your Gmail account, classifies incoming emails using a hybrid rule-based + ML system, summarizes email content, and generates AI-driven draft responses using Google Gemini.  

---

## Features

- Gmail OAuth2 sign-in to fetch recent inbox emails.
- Rule-based + ML-based hybrid email classification (`Important`, `Promotional`, `Spam`, `Casual`).
- Summarization of email content using a hosted Gradio T5 model.
- AI-generated professional email responses with Gemini API.
- Interactive UI: view emails, summaries, categories, and generated responses.
- Reply directly from Gmail using the generated subject and response.
- Retry mechanism for regenerating AI responses.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (ES Modules)  
- **Backend:** Node.js, Express.js  
- **AI & NLP:**  
  - Hugging Face (`facebook/bart-large-mnli`) for email classification  
  - Gradio hosted T5 model for summarization  
  - Google Gemini API for response generation  
- **Email API:** Gmail API (OAuth2)

---

## Setup & Installation

**1. Clone the repository**  
    git clone <repository-url>  
    cd <project-folder>
**2.Install dependencies**
-This project uses only Express as a server dependency:

     `npm install express`


**3.Start the server**

    `node app.js`


**4.Open in browser**
 #Visit: http://localhost:5500

---
>Required API Keys

To fully use the app, you need the following API keys:

###1. Google/Gmail API

1.Go to Google Cloud Console
2.Create a new project.
3.Navigate to APIs & Services → OAuth consent screen and configure your app.
4.Enable Gmail API.
5.Go to Credentials → Create Credentials → OAuth Client ID.
6.Set application type to Web application and add http://localhost:5500 as Authorized redirect URI.
7.Copy the Client ID and set it in your browser as window.GMAIL_CLIENT_ID.

###2. Hugging Face API

1.Create an account at Hugging Face
2.Go to Settings → Access Tokens → New Token.
3.Copy the token and set it in your browser as window.HF_API_TOKEN.

###3. Google Gemini API

1.Enable Generative AI API in Google Cloud Console
2.Go to API Keys → Create Key.
3.Copy the key and set it in your browser as window.GEMINI_KEY_latest.
---

## Usage

1. Click **Sign in to Gmail**.
2. Allow the app to access your Gmail inbox.
3. Click **Load Latest Emails**.
4. The app will display each email's sender, subject, category, summary, and AI-generated response.
5. Use **Reply with Generated Email** to open Gmail with a prefilled subject and body.
6. Use **Try Again** if the AI response fails or needs regeneration.


***Promotional Domains***
>Emails from these domains are considered Promotional by default:


###Screenshot
!(./image.png)
