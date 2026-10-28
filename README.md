# AYAKA STORE - Digital Marketplace Neo-Brutalism

Platform marketplace digital modern dengan fitur top-up QRIS otomatis, SMM Panel API Integration (Indosmm), dan Manajemen Database Serverless (Turso).

## 🚀 Fitur Utama
- **Styling Neo-Brutalism**: Desain bold & kontras tinggi.
- **Dynamic QRIS Generator**: Generator QRIS standar ISO/IEC 13239 dengan hitung mundur expired 2 menit.
- **Indosmm API Ready**: Modul untuk menghubungkan marketplace dengan penyedia SMM Panel.
- **Turso Database HTTP Client**: Konek ke Turso (libSQL) via REST API untuk real-time metrics.

## 🛠️ Cara Konfigurasi API

### 1. Konfigurasi Turso DB
Buka file `assets/js/config.js` dan isi URL serta Auth Token dari dashboard Turso Anda:
```javascript
TURSO: {
    URL: "[https://nama-database-anda.turso.io](https://nama-database-anda.turso.io)",
    AUTH_TOKEN: "your_turso_jwt_token"
}
