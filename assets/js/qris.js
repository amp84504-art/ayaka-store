/**
 * Dynamic QRIS Generator & Timer Logic
 */
let qrisCountdownTimer = null;
let qrisTimeRemaining = 120; // 2 Menit
let qrcodeInstance = null;

// Algoritma CRC16 untuk Generasi QRIS Standar ISO/IEC 13239
function convertCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    return hex.length === 3 ? "0" + hex : (hex.length === 2 ? "00" + hex : (hex.length === 1 ? "000" + hex : hex));
}

// Generasi QRIS Dinamis berdasarkan Nominal
function generateDynamicQRISString(nominal) {
    let base = CONFIG.STATIC_QRIS_PAYMENT.slice(0, -4);
    base = base.replace("530336054045000", "5303360");
    let parts = base.split("5802ID");
    let amountStr = nominal.toString();
    let amountTag = "54" + (amountStr.length < 10 ? "0" + amountStr.length : amountStr.length) + amountStr;
    let dynamicBase = parts[0] + amountTag + "5802ID" + parts[1];
    let crc = convertCRC16(dynamicBase);
    return dynamicBase + crc;
}

function setTopupAmount(amount) {
    document.getElementById('topup-amount').value = amount;
    calculateTopupBonus();
}

function calculateTopupBonus() {
    const val = Number(document.getElementById('topup-amount').value) || 0;
    const summaryEl = document.getElementById('summary-saldo');
    summaryEl.innerText = `Rp ${val.toLocaleString('id-ID')}`;
}

function renderQRCodeDirectly(qrText) {
    const wrapper = document.getElementById('qris-canvas-wrapper');
    wrapper.innerHTML = '';
    
    if (typeof QRCode !== 'undefined') {
        qrcodeInstance = new QRCode(wrapper, {
            text: qrText,
            width: 220,
            height: 220,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    } else {
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;
        wrapper.appendChild(img);
    }
}

function submitTopup(e) {
    if (e) e.preventDefault();
    const val = Number(document.getElementById('topup-amount').value);
    if (!val || val < 1000) {
        showToast('Nominal minimum top up adalah Rp 1.000!');
        return;
    }

    const dynamicString = generateDynamicQRISString(val);
    document.getElementById('qris-expired-overlay').style.display = 'none';
    renderQRCodeDirectly(dynamicString);
    document.getElementById('qris-timer-container').style.display = 'inline-flex';

    openModal('modal-qris');
    startQrisTimer(120);
    showToast(`QRIS Dinamis Rp ${val.toLocaleString('id-ID')} berhasil dibuat!`);
}

function startQrisTimer(seconds) {
    clearInterval(qrisCountdownTimer);
    qrisTimeRemaining = seconds;
    updateTimerDisplay();

    qrisCountdownTimer = setInterval(() => {
        qrisTimeRemaining--;
        updateTimerDisplay();

        if (qrisTimeRemaining <= 0) {
            clearInterval(qrisCountdownTimer);
            onQrisExpired();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(qrisTimeRemaining / 60);
    const secs = qrisTimeRemaining % 60;
    const formatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    document.getElementById('qris-timer-text').innerText = formatted;
}

function onQrisExpired() {
    document.getElementById('qris-expired-overlay').style.display = 'flex';
    showToast('⚠️ Waktu pembayaran QRIS telah habis (Expired)!');
}

function regenerateQris() {
    const val = Number(document.getElementById('topup-amount').value) || 1000;
    document.getElementById('topup-amount').value = val;
    submitTopup();
}
