// Vercel Serverless Function — POST /api/submit
// Mengirim email notifikasi tiap ada peserta yang mengisi assessment.
// Pakai Resend (https://resend.com) lewat HTTP, tanpa dependency npm.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel Node runtime otomatis mem-parse JSON body.
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (_) { data = {}; }
  }

  const { nama, departemen, wa, email, dimScores, overall, promoShown, answers } = data || {};

  // Validasi minimal
  if (!nama || !departemen || !wa) {
    return res.status(400).json({ error: 'Data wajib tidak lengkap' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL     = process.env.FROM_EMAIL;      // mis. "WithMi <noreply@withmiautomation.com>"
  const NOTIFY_EMAIL   = process.env.NOTIFY_EMAIL;    // email kamu (tujuan notifikasi)

  if (!RESEND_API_KEY || !FROM_EMAIL || !NOTIFY_EMAIL) {
    return res.status(500).json({ error: 'Server belum dikonfigurasi (env var kurang)' });
  }

  const esc = s => String(s ?? '').replace(/[&<>]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m]));
  const dimRows = dimScores
    ? Object.entries(dimScores).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join('')
    : '';
  const answerRows = Array.isArray(answers)
    ? answers.map((a, i) => `<tr><td style="padding:3px 10px 3px 0;color:#888">${i + 1}. ${esc(a.dim)}</td><td>${esc(a.score)}/3</td></tr>`).join('')
    : '';

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;color:#111">
      <h2 style="margin:0 0 4px">Lead AI Readiness baru</h2>
      <p style="margin:0 0 16px;color:#666">${esc(nama)} — ${esc(departemen)}</p>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <tr><td style="padding:4px 12px 4px 0">WhatsApp</td><td><b>${esc(wa)}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0">Email</td><td>${esc(email) || '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0">Skor total</td><td><b>${esc(overall)}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0">Butuh kelas AI?</td><td>${promoShown ? '<b>Ya — skor rendah, promo tampil</b>' : 'Tidak'}</td></tr>
      </table>
      <h4 style="margin:0 0 6px">Skor per dimensi</h4>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">${dimRows}</table>
      <h4 style="margin:0 0 6px">Jawaban detail</h4>
      <table style="border-collapse:collapse;font-size:13px">${answerRows}</table>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        reply_to: email || undefined,
        subject: `AI Readiness: ${nama} (${departemen}) — skor ${overall}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: 'Gagal kirim email', detail });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
