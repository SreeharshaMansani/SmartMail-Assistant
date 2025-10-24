import { signIn, getEmails } from './modules/gmailApi.js';
import { hybridClassify } from './modules/classification.js';
import { processEmail } from './modules/emailProcessor.js';
import summarize from './modules/summarize.js';

window.onload = () => {
  const hash = window.location.hash;
  const signInBtn = document.getElementById('signInBtn');
  const loadBtn = document.getElementById('loadEmailsBtn');
  const output = document.getElementById('output');

  if (hash.includes('access_token')) {
    window.accessToken = new URLSearchParams(hash.substring(1)).get('access_token');
    loadBtn.disabled = false;
    output.textContent = 'Signed in successfully!';
    signInBtn.disabled = true;
  }

  signInBtn.addEventListener('click', signIn);
  loadBtn.addEventListener('click', loadEmails);
};

async function loadEmails() {
  const list = document.getElementById('email-list');
  const output = document.getElementById('output');

  list.innerHTML = '';
  output.textContent = 'Loading emails...';

  try {
    const emails = await getEmails();
    if (!emails || emails.length === 0) {
      output.textContent = 'No emails found.';
      return;
    }

    output.textContent = 'Analyzing emails...';

    for (const email of emails) {
      const category = await hybridClassify(email);
      const summary = await summarize(email);

      if (category !== 'Promotional' && category !== 'spam') {
        const { generatedResponse, generatedSubject } = await processEmail({ email, summary });

        const li = document.createElement('li');
        li.style.marginBottom = '20px';

        const safeSummary = summary ? summary.replace(/"/g, '&quot;') : '';
        const safeResponse = generatedResponse ? generatedResponse.replace(/"/g, '&quot;') : '';

        li.innerHTML = `
          <p><strong>From:</strong> ${email.sender}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>Category:</strong> <span style="color:blue;">${category}</span></p>
          <p><strong>Summary:</strong>
            <span title="${safeSummary}" style="cursor: help;">
              ${summary && summary.length > 300 ? summary.substring(0, 300) + "..." : summary || ''}
            </span>
          </p>
          <p class="generated-response"><strong>Generated Response:</strong>
            <span title="${safeResponse}" style="cursor: help;">
              ${generatedResponse && generatedResponse.length > 300 ? generatedResponse.substring(0, 300) + "..." : generatedResponse || ''}
            </span>
          </p>
        `;

        const replyBtn = document.createElement('button');
        replyBtn.textContent = 'Reply with Generated Email';
        replyBtn.style.marginRight = '5px';
        replyBtn.addEventListener('click', () => {
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.sender)}&su=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(generatedResponse)}`;
          window.open(gmailUrl, '_blank');
        });

        if (generatedResponse === 'unable to generate response') {
          replyBtn.disabled = true;
          replyBtn.style.opacity = '0.6';
          replyBtn.style.cursor = 'not-allowed';
        }

        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Try Again';
        retryBtn.addEventListener('click', async () => {
          output.textContent = 'Retrying response generation...';
          await retryGenerating({ li, email, summary });
          output.textContent = 'Emails ready.';
        });

        li.appendChild(replyBtn);
        li.appendChild(retryBtn);
        list.appendChild(li);
      } else {
        const li = document.createElement('li');
        li.style.marginBottom = '20px';
        li.innerHTML = `
          <p><strong>From:</strong> ${email.sender}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>Category:</strong> <span style="color:blue;">${category}</span></p>
          <p><strong>Summary:</strong> ${summary || ''}</p>
        `;
        list.appendChild(li);
      }
    }

    output.textContent = 'Emails loaded successfully.';
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    console.error(err);
  }
}

// ✅ Retry function
async function retryGenerating({ li, email, summary }) {
  const responsePara = li.querySelector('.generated-response span');
  responsePara.textContent = 'Regenerating...';

  const { generatedResponse } = await processEmail({ email, summary });

  responsePara.textContent =
    generatedResponse.length > 300
      ? generatedResponse.substring(0, 300) + '...'
      : generatedResponse;
}
