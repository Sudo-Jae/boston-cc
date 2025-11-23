"use client";

import { useState } from 'react';

export default function QuoteForm({ endpoint = 'http://localhost:3002/api/contact' }: { endpoint?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, any> = {};
    formData.forEach((v, k) => { payload[k] = v; });

    // Honeypot
    if (payload.hp) {
      setError('Spam detected');
      return;
    }

    if (!payload.name || !payload.email || !payload.message) {
      setError('Please provide name, email and a short description of what you need.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setMessage((json && json.message) || 'Thanks — we received your message. We’ll reply within 1 business day.');
        form.reset();
      } else {
        setError((json && json.error) || 'Server error — please try again later.');
      }
    } catch (err) {
      setError('Network error — try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="contactForm" onSubmit={handleSubmit} className="space-y-3" aria-label="Get a quote form">
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">Name *</label>
        <input name="name" className="px-3 py-2 rounded-md bg-transparent border border-white/10 text-white" required />

        <label className="text-sm">Email *</label>
        <input name="email" type="email" className="px-3 py-2 rounded-md bg-transparent border border-white/10 text-white" required />

        <label className="text-sm">Business / brand</label>
        <input name="business" className="px-3 py-2 rounded-md bg-transparent border border-white/10 text-white" />

        <label className="text-sm">Current website (if any)</label>
        <input name="website" className="px-3 py-2 rounded-md bg-transparent border border-white/10 text-white" placeholder="https://example.com" />

        <label className="text-sm">What are you trying to do? *</label>
        <textarea name="message" rows={5} className="px-3 py-2 rounded-md bg-transparent border border-white/10 text-white" required />

        <input name="hp" type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden />

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full bg-teal-400 text-black" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Get a quote'}</button>
          <div className="text-sm text-white/80">We’ll reply within 1 business day — no spam, no weird lists.</div>
        </div>

        {message && <div className="text-green-300 text-sm">{message}</div>}
        {error && <div className="text-red-300 text-sm">{error}</div>}
      </div>
    </form>
  );
}
