// Load dotenv if available (optional in dev)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional for quick dev runs where deps weren't installed yet
  console.warn('⚠️ dotenv not installed; skipping loading .env');
}

const express = require('express');
const cors = require('cors');

const app = express();
const fs = require('fs').promises;
const path = require('path');

const MESSAGES_FILE = path.resolve(__dirname, 'messages.json');
const CONTENT_FILE = path.resolve(__dirname, 'content.json');

// Admin token used to protect admin endpoints. Defaults to '101' for local/dev convenience.
// Override by setting ADMIN_TOKEN in backend/.env
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '101';

async function ensureMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch (err) {
    await fs.writeFile(MESSAGES_FILE, '[]', 'utf8');
  }
}

async function saveMessage(entry) {
  try {
    await ensureMessagesFile();
    const raw = await fs.readFile(MESSAGES_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.push(entry);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save message:', err);
  }
}

// Content helpers: load and save site content used by the frontend editor
function defaultContent() {
  return {
    heroTitle: 'Boston Canopy Care — Robotic canopy cleaning for QLD roofs & gutters',
    heroSubtitle: 'Fast, safe and compliant canopy cleaning across Brisbane, Gold Coast, Sunshine Coast and regional Queensland.',
    aboutText: '<p>Robotic canopy and gutter cleaning for commercial, council and large residential sites. Fast, safe and compliant cleaning with inspection reports on request.</p>'
  };
}

async function loadContent() {
  try {
    await fs.access(CONTENT_FILE);
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    const obj = JSON.parse(raw || '{}');
    return Object.assign({}, defaultContent(), obj);
  } catch (err) {
    // missing or invalid file -> return defaults
    return defaultContent();
  }
}

async function saveContent(content) {
  try {
    if (!content || typeof content !== 'object') throw new Error('Invalid content');
    await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save content:', err);
    return false;
  }
}

// Attempt to load SendGrid only if an API key is present.
// Loading is wrapped in try/catch so the server can run without the package installed.
let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (err) {
    sgMail = null;
    console.warn('⚠️ @sendgrid/mail not installed or failed to load — emails disabled.');
  }
} else {
  console.warn('⚠️ SENDGRID_API_KEY not set — emails will not be sent.');
}

// CORS: allow your static dev origin (adjust as needed)
app.use(
  cors({
    origin: [process.env.ALLOWED_ORIGIN || 'http://localhost:8000', 'http://127.0.0.1:8000'],
  })
);

app.use(express.json());

// Basic in-memory rate limiter (per-IP)
const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000); // ms
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 5); // requests per window
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || [];
  // keep only timestamps within window
  const windowed = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW);
  windowed.push(now);
  rateBuckets.set(ip, windowed);
  return windowed.length > RATE_LIMIT_MAX;
}

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

// Admin: list saved messages (protected by ADMIN_TOKEN)
app.get('/api/messages', async (req, res) => {
  // Accept a default admin token in dev for convenience. Can be overridden in backend/.env
  // NOTE: In production you should set a strong ADMIN_TOKEN env var.
  const token = req.get('Authorization')?.replace(/^Bearer\s+/i, '') || req.query.token;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    await ensureMessagesFile();
    const raw = await fs.readFile(MESSAGES_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    return res.json({ ok: true, messages: arr });
  } catch (err) {
    console.error('Failed to read messages:', err);
    return res.status(500).json({ ok: false, error: 'Failed to read messages' });
  }
});

// Content endpoints
app.get('/api/content', async (req, res) => {
  try {
    const content = await loadContent();
    return res.json({ ok: true, content });
  } catch (err) {
    console.error('Failed to load content', err);
    return res.status(500).json({ ok: false, error: 'Failed to load content' });
  }
});

app.put('/api/content', express.json(), async (req, res) => {
  const token = req.get('x-admin-token') || req.query.token;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const newContent = req.body;
  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid content body' });
  }

  const ok = await saveContent(newContent);
  if (!ok) return res.status(500).json({ ok: false, error: 'Failed to save content' });
  return res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, business, website, message } = req.body || {};
  // Honeypot check: simple spam defence. The frontend includes "hp" hidden input.
  if (req.body && req.body.hp) {
    console.warn('Spam detected: honeypot filled', req.ip);
    return res.status(400).json({ ok: false, error: 'Bad request' });
  }

  // Rate-limit by IP
  try {
    if (isRateLimited(req.ip)) {
      console.warn('Rate limit exceeded for', req.ip);
      return res.status(429).json({ ok: false, error: 'Rate limit exceeded' });
    }
  } catch (e) {
    // if the limiter fails for whatever reason, don't block normal flow
    console.warn('Rate limiter failed', e);
  }

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }

  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!to || !from) {
    console.warn('⚠️ Missing CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL in server env.');
    return res.status(500).json({ ok: false, error: 'Email configuration is missing on the server.' });
  }

  // persist the message locally for later review (regardless of email sending)
  try {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ip: req.ip,
      name,
      email,
      business: business || null,
      website: website || null,
      message: message || null,
    };
    saveMessage(entry);
  } catch (e) {
    console.warn('Could not persist contact message locally', e);
  }

  // If sgMail is not available (module not installed) respond with a successful acknowledgement
  // so frontend developers can test the flow without configuring SendGrid.
  if (!sgMail) {
    console.warn('⚠️ Send disabled: @sendgrid/mail not available or SENDGRID_API_KEY missing. Skipping actual send.');
    console.log('Contact received (not sent):', { name, email, business, website, message });
    return res.json({ ok: true, message: 'Contact received (email not sent in this dev build)' });
  }
  const subject = `New contact from ${name} (${email})`;
  const textLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    business ? `Business: ${business}` : '',
    website ? `Website: ${website}` : '',
    '',
    'Message:',
    message || '(no message provided)',
  ].filter(Boolean);

  const msg = {
    to,
    from,
    subject,
    text: textLines.join('\n'),
    html: textLines.map((line) => (line === '' ? '<br>' : `<p>${line}</p>`)).join(''),
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Contact email sent:', { name, email, business, website });
    return res.json({ ok: true, message: 'Email sent' });
  } catch (err) {
    console.error('❌ Error sending email:', (err && err.response && err.response.body) || err);
    return res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
