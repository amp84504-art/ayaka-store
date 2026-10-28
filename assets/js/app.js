/**
 * Main Application Controller - Ayaka Store
 */
const DB = {
    products: [
        { id: 1, type: 'app', name: 'Canva Pro 1 Tahun', desc: 'Akses penuh ke semua elemen & template premium Canva.', status: 'unavailable', price: 'Rp 35.000', icon: '🎨' },
        { id: 2, type: 'app', name: 'Netflix Premium 1 Bulan', desc: 'Private profile, Ultra HD 4K, Bebas Iklan.', status: 'unavailable', price: 'Rp 45.000', icon: '🎬' },
        { id: 3, type: 'app', name: 'Spotify Individual 1 Bulan', desc: 'Bebas putar musik tanpa iklan & bisa download offline.', status: 'unavailable', price: 'Rp 25.000', icon: '🎵' },
        { id: 4, type: 'app', name: 'CapCut Pro', desc: 'Fitur AI pro editing dan hapus latar belakang.', status: 'unavailable', price: 'Rp 30.000', icon: '🎬' },
        { id: 10, type: 'app', name: 'Alight Motion', desc: 'Akses fitur motion graphics dan efek video premium.', status: 'unavailable', price: 'Varian', icon: '📹' },
        { id: 5, type: 'game', name: 'Mobile Legends Diamond', desc: 'Top up Instant MLBB via User ID & Zone ID.', status: 'unavailable', price: 'Varian', icon: '⚔️' },
        { id: 6, type: 'game', name: 'Free Fire Diamonds', desc: 'Pengisian kilat Free Fire via Player ID resmi.', status: 'unavailable', price: 'Varian', icon: '🔥' },
        { id: 7, type: 'game', name: 'Genshin Impact Genesis Crystal', desc: 'Blessing of the Welkin Moon & Genesis Crystals.', status: 'unavailable', price: 'Varian', icon: '✨' }
    ],
    smmServices: [],
    indosmmKey: localStorage.getItem('indosmm_api_key') || (typeof CONFIG !== 'undefined' ? CONFIG.INDOSMM.API_KEY : ''),
    currentUser: JSON.parse(localStorage.getItem('ayaka_user')) || null,
    userBalance: Number(localStorage.getItem('ayaka_balance')) || 0
};

// --- BANNER CAROUSEL ---
let currentBannerIdx = 0;
const totalBanners = 3;
let bannerTimer = null;

function setBanner(index) {
    currentBannerIdx = index;
    const wrapper = document.getElementById('banner-wrapper');
    if (wrapper) wrapper.style.transform = `translateX(-${currentBannerIdx * 100}%)`;
    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentBannerIdx));
    resetBannerTimer();
}

function moveBanner(direction) {
    let nextIndex = currentBannerIdx + direction;
    if (nextIndex >= totalBanners) nextIndex = 0;
    if (nextIndex < 0) nextIndex = totalBanners - 1;
    setBanner(nextIndex);
}

function startBannerAutoSlide() {
    bannerTimer = setInterval(() => { moveBanner(1); }, 4000);
}

function resetBannerTimer() {
    clearInterval(bannerTimer);
    startBannerAutoSlide();
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
            else entry.target.classList.remove('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    
    const navEl = document.getElementById(`nav-${viewName}`);
    if (navEl) navEl.classList.add('active');

    const sideEl = document.getElementById(`side-${viewName}`);
    if (sideEl) sideEl.classList.add('active');

    const bnavEl = document.getElementById(`bnav-${viewName}`);
    if (bnavEl) bnavEl.classList.add('active');

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('active');

    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'admin') renderAdminPanel();
    if (viewName === 'stats') updateRealtimeStats();

    setTimeout(() => { window.dispatchEvent(new Event('scroll')); }, 50);
}

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    sidebar.classList.toggle('active');
}

function renderProducts() {
    const appGrid = document.getElementById('app-grid');
    const gameGrid = document.getElementById('game-grid');

    if (appGrid) appGrid.innerHTML = '';
    if (gameGrid) gameGrid.innerHTML = '';

    DB.products.forEach(p => {
        if (p.type === 'app' && appGrid) {
            appGrid.innerHTML += `
                <div class="brutal-card product-card">
                    <div>
                        <div class="product-header">
                            <div class="product-icon-box"><span>${p.icon}</span></div>
                            <div>
                                <div class="product-title">${p.name}</div>
                                <span class="badge-unavailable">Belum Tersedia</span>
                            </div>
                        </div>
                        <div class="product-desc">${p.desc}</div>
                        <div class="product-price">${p.price}</div>
                    </div>
                    <div class="product-footer">
                        <button class="brutal-btn disabled" disabled>Belum Tersedia</button>
                    </div>
                </div>`;
        } else if (p.type === 'game' && gameGrid) {
            gameGrid.innerHTML += `
                <div class="brutal-card product-card">
                    <div>
                        <div class="product-header">
                            <div class="product-icon-box"><span>${p.icon}</span></div>
                            <div>
                                <div class="product-title">${p.name}</div>
                                <span class="badge-unavailable">TOP UP BELUM TERSEDIA</span>
                            </div>
                        </div>
                        <div class="product-desc">${p.desc}</div>
                    </div>
                    <div class="product-footer">
                        <button class="brutal-btn disabled" disabled>Belum Tersedia</button>
                    </div>
                </div>`;
        }
    });

    renderSmmTable();
}

function renderSmmTable(filterText = '') {
    const smmTableBody = document.getElementById('smm-table-body');
    if (!smmTableBody) return;

    smmTableBody.innerHTML = '';

    if (DB.smmServices.length === 0) {
        smmTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color:#666; font-weight:700;">Belum ada layanan SMM. Silakan masukkan API Key Indosmm di config.js atau Panel Admin.</td></tr>`;
        return;
    }

    const filtered = DB.smmServices.filter(s => 
        s.name.toLowerCase().includes(filterText.toLowerCase()) || 
        (s.category && s.category.toLowerCase().includes(filterText.toLowerCase())) ||
        String(s.service).includes(filterText)
    );

    if (filtered.length === 0) {
        smmTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color:#666; font-weight:700;">Tidak ada layanan SMM yang cocok dengan pencarian Anda.</td></tr>`;
        return;
    }

    // Batasi render 150 data teratas agar performa browser tetap responsif
    const displayList = filtered.slice(0, 150);

    displayList.forEach(s => {
        smmTableBody.innerHTML += `
            <tr>
                <td>#${s.service}</td>
                <td>${s.name}</td>
                <td>${s.category || 'General'}</td>
                <td>Rp ${Number(s.rate).toLocaleString('id-ID')}</td>
                <td>${s.min} / ${s.max}</td>
                <td><span class="badge-available">AKTIF</span></td>
                <td><button class="brutal-btn" style="padding:4px 8px; font-size:11px;" onclick="handleBuySmm(${s.service}, '${s.name.replace(/'/g, "")}', ${s.rate})">PESAN</button></td>
            </tr>`;
    });
}

function filterSmmServices() {
    const query = document.getElementById('smm-search-input').value;
    renderSmmTable(query);
}

// Eksekusi pesanan nyata ke Indosmm & Turso DB
async function handleBuySmm(serviceId, serviceName, rate) {
    if (!DB.indosmmKey || DB.indosmmKey.includes("MASUKKAN_API_KEY")) {
        showToast('⚠️ Masukkan API Key Indosmm di config.js atau Panel Admin!');
        switchView('admin');
        return;
    }

    const target = prompt(`Masukkan Target (Link / Username) untuk Layanan #${serviceId}\n(${serviceName}):`);
    if (!target) return;

    const quantity = prompt("Masukkan Jumlah (Quantity) Pesanan:", "100");
    if (!quantity || isNaN(quantity)) return;

    showToast('⚡ Mengirim pesanan ke Indosmm API...');

    try {
        const result = await indosmmAPI.placeOrder(DB.indosmmKey, serviceId, target, quantity);
        
        if (result && result.order) {
            showToast(`✅ Berhasil! ID Order Indosmm: #${result.order}`);
            await tursoClient.createOrder(DB.currentUser ? DB.currentUser.id : 1, serviceId, target, Number(rate) * (quantity / 1000));
            updateRealtimeStats();
        } else {
            showToast(`❌ Gagal: ${result.error || 'Periksa kembali saldo/API Key Anda'}`);
        }
    } catch (err) {
        showToast('❌ Koneksi ke API Indosmm gagal.');
        console.error(err);
    }
}

function toggleFaq(element) { element.classList.toggle('active'); }

function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    if (!DB.currentUser) {
        container.innerHTML = `
            <div class="brutal-card" style="padding: 32px; text-align: center;">
                <h3>Anda Belum Login</h3>
                <p style="margin: 10px 0 20px 0; font-size:14px;">Silakan login terlebih dahulu untuk mengakses dashboard.</p>
                <button class="brutal-btn" onclick="openModal('modal-login')">Login Sekarang</button>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="brutal-card" style="padding: 20px; margin-bottom: 20px; background: var(--primary-light);">
            <h2 style="font-size:22px;">Selamat Datang, ${DB.currentUser.name}!</h2>
            <p style="font-weight:700; font-size:13px; margin-top:4px;">Role: ${DB.currentUser.role.toUpperCase()} | Email: ${DB.currentUser.email}</p>
        </div>
        <div class="stats-grid">
            <div class="brutal-card stat-card"><div class="stat-number">0</div><div class="stat-label">Pesanan Aktif</div></div>
            <div class="brutal-card stat-card"><div class="stat-number">Rp ${DB.userBalance.toLocaleString('id-ID')}</div><div class="stat-label">Saldo Wallet</div></div>
        </div>`;
}

function renderAdminPanel() {
    const container = document.getElementById('admin-product-list');
    if (!container) return;

    container.innerHTML = '';
    DB.products.forEach(p => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #111; padding: 10px 0;">
                <div>
                    <strong style="font-size:14px;">${p.name}</strong> <span style="font-size:11px;">(${p.type.toUpperCase()})</span>
                    <br><small style="font-size:12px;">Status: ${p.status}</small>
                </div>
                <button class="brutal-btn secondary" style="font-size:11px; padding:4px 8px;" onclick="toggleProductStatus(${p.id})">Ubah Status</button>
            </div>`;
    });
    const keyInput = document.getElementById('admin-indosmm-key');
    if (keyInput) keyInput.value = DB.indosmmKey;
}

function toggleProductStatus(id) {
    const product = DB.products.find(p => p.id === id);
    if (product) {
        product.status = product.status === 'available' ? 'unavailable' : 'available';
        renderProducts();
        renderAdminPanel();
        showToast(`Status ${product.name} diperbarui!`);
    }
}

async function saveIndosmmKey() {
    const key = document.getElementById('admin-indosmm-key').value.trim();
    DB.indosmmKey = key;
    localStorage.setItem('indosmm_api_key', key);
    showToast('API Key disimpan! Mengambil layanan Indosmm...');

    const services = await indosmmAPI.getServices(DB.indosmmKey);
    if (services && Array.isArray(services) && services.length > 0) {
        DB.smmServices = services;
        renderSmmTable();
        updateRealtimeStats();
        showToast(`✅ Berhasil memuat ${services.length.toLocaleString('id-ID')} layanan Indosmm!`);
    } else {
        showToast('❌ Gagal memuat layanan. Periksa kembali API Key Anda.');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const role = email.includes('admin') ? 'admin' : 'user';

    DB.currentUser = { id: 1, name: email.split('@')[0], email: email, role: role };
    localStorage.setItem('ayaka_user', JSON.stringify(DB.currentUser));
    
    updateAuthUI();
    closeModal('modal-login');
    showToast(`Login berhasil sebagai ${DB.currentUser.name}`);
    switchView('dashboard');
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;

    DB.currentUser = { id: 2, name: name, email: email, role: 'user' };
    localStorage.setItem('ayaka_user', JSON.stringify(DB.currentUser));

    updateAuthUI();
    closeModal('modal-register');
    showToast('Registrasi berhasil!');
    switchView('dashboard');
}

function handleLogout() {
    DB.currentUser = null;
    localStorage.removeItem('ayaka_user');
    updateAuthUI();
    showToast('Berhasil keluar dari akun.');
    switchView('landing');
}

function updateAuthUI() {
    const actions = document.getElementById('auth-actions');
    const adminMenu = document.getElementById('side-admin');

    if (DB.currentUser) {
        actions.innerHTML = `
            <span style="font-weight:800; font-size:12px; display:inline-block; max-width:80px; overflow:hidden; text-overflow:ellipsis;">${DB.currentUser.name}</span>
            <button class="brutal-btn dark" style="padding:4px 8px; font-size:11px;" onclick="handleLogout()">Keluar</button>`;
        if (adminMenu) adminMenu.style.display = DB.currentUser.role === 'admin' ? 'flex' : 'none';
    } else {
        actions.innerHTML = `
            <button class="brutal-btn secondary" onclick="openModal('modal-login')">Login</button>
            <button class="brutal-btn" onclick="openModal('modal-register')">Daftar</button>`;
        if (adminMenu) adminMenu.style.display = 'none';
    }
}

async function updateRealtimeStats() {
    const pCount = document.getElementById('stat-products-count');
    const oCount = document.getElementById('stat-orders-count');
    const uCount = document.getElementById('stat-users-count');

    const stats = await tursoClient.fetchRealtimeStats();
    const totalServicesCount = DB.smmServices.length > 0 ? DB.smmServices.length : 10;

    if (stats) {
        if (pCount) pCount.innerText = (stats.productsCount + totalServicesCount).toLocaleString('id-ID');
        if (oCount) oCount.innerText = stats.ordersCount.toLocaleString('id-ID');
        if (uCount) uCount.innerText = stats.usersCount.toLocaleString('id-ID');
    } else {
        if (pCount) pCount.innerText = totalServicesCount.toLocaleString('id-ID');
        if (oCount) oCount.innerText = "0";
        if (uCount) uCount.innerText = "0";
    }
}

function startRealtimeEngine() {
    updateRealtimeStats();
    setInterval(() => { updateRealtimeStats(); }, 10000);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', async () => {
    renderProducts();
    updateAuthUI();
    initScrollAnimations();
    startRealtimeEngine();
    startBannerAutoSlide();

    // Otomatis tarik ribuan layanan Indosmm saat halaman dimuat
    if (DB.indosmmKey && !DB.indosmmKey.includes("MASUKKAN_API_KEY")) {
        const services = await indosmmAPI.getServices(DB.indosmmKey);
        if (services && Array.isArray(services) && services.length > 0) {
            DB.smmServices = services;
            renderSmmTable();
            updateRealtimeStats();
            showToast(`✅ Berhasil memuat ${services.length.toLocaleString('id-ID')} layanan Indosmm!`);
        }
    }
});
