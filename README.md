# AI Readiness Check — Bootcamp Ismuhuyahya

Form registrasi + assessment kesiapan AI (6 dimensi, radar chart) yang mengirim
email notifikasi ke panitia tiap ada yang mengisi. Siap deploy ke Vercel.

## Isi folder
```
withmi-ai-readiness/
├── index.html        ← seluruh front-end (form, assessment, chart, promo)
├── api/
│   └── submit.js     ← fungsi serverless pengirim email (Resend)
└── README.md
```

---

## Yang harus kamu siapkan sendiri (tidak bisa saya lakukan)

1. **Akun Vercel** (gratis) — https://vercel.com
2. **Akun Resend** (gratis, untuk kirim email) — https://resend.com
   - Setelah daftar, buat **API Key** di dashboard Resend.
   - Untuk kirim dari domain sendiri (mis. `noreply@withmiautomation.com`), kamu harus
     verifikasi domain di Resend (tambah beberapa record DNS). Kalau belum sempat,
     untuk testing bisa pakai `onboarding@resend.dev` sebagai FROM — tapi hanya bisa
     mengirim ke email yang sama dengan akun Resend kamu.

---

## Langkah deploy (cara paling cepat)

### 1. Upload ke Vercel
Pilihan A — lewat GitHub (disarankan):
1. Buat repo baru di GitHub, upload isi folder ini.
2. Di Vercel → **Add New Project** → import repo tsb.
3. Framework preset: **Other** (biarkan default). Klik **Deploy**.

Pilihan B — tanpa GitHub (drag & drop):
1. Install Vercel CLI: `npm i -g vercel`
2. Di dalam folder ini jalankan: `vercel` lalu ikuti promptnya.

### 2. Isi Environment Variables
Di Vercel → project → **Settings → Environment Variables**, tambahkan 3 ini:

| Name             | Value (contoh)                                   |
|------------------|--------------------------------------------------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` (dari Resend)              |
| `FROM_EMAIL`     | `Bootcamp <noreply@withmiautomation.com>`        |
| `NOTIFY_EMAIL`   | `email-kamu@gmail.com` (tujuan notifikasi)       |

Setelah menambah env var, **Redeploy** sekali agar terbaca.

### 3. Edit link promo (di `index.html`)
Di bagian atas `<script>` ada blok **KONFIGURASI**:
```js
const CLASS_URL = "https://withmiautomation.com";  // ganti ke URL kelas AI
const CLASS_WA  = "https://wa.me/62XXXXXXXXXXX";    // ganti ke WA kelas AI
const PROMO_THRESHOLD = 50;                          // ambang skor tampil promo
```

### 4. (Opsional) Pakai domain withmiautomation.com
Di Vercel → project → **Settings → Domains** → tambahkan domain/subdomain
(mis. `daftar.withmiautomation.com`). Vercel akan memberi record DNS yang harus
kamu tambahkan di pengelola domain (Cloudflare/registrar). Pakai **subdomain**
kalau domain utama sudah dipakai website lain.

---

## Cara kerja singkat
- Peserta isi registrasi → 12 pertanyaan → skor 6 dimensi dihitung **di browser**
  (bukan angka karangan; tiap opsi punya nilai 0–3, dinormalisasi ke 0–100).
- Radar chart & skor total tampil langsung.
- Kalau skor total < ambang (default 50), muncul promo kelas AI.
- Data submission dikirim ke `/api/submit` → email masuk ke `NOTIFY_EMAIL`.

## Batasan yang perlu diketahui
- **Belum ada database.** Rekap permanen = kumpulan email di inbox kamu. Untuk
  8–15 peserta ini cukup. Kalau nanti mau dashboard/rekap tersimpan, perlu
  tambahan (mis. Vercel KV / Google Sheet) — bisa dikerjakan menyusul.
- Tombol "Panitia? Lihat rekap" di form hanya menampilkan data **sesi browser
  saat itu**, bukan seluruh peserta. Sumber kebenaran = email.
- Preview lokal (buka `index.html` langsung) menampilkan semua kecuali email —
  email baru aktif setelah di-deploy dengan env var terisi.
