/**
 * Indosmm SMM Panel API v2 Integration Module
 */
class IndosmmAPI {
    constructor() {
        this.baseUrl = CONFIG.INDOSMM.BASE_URL;
        this.apiKey = CONFIG.INDOSMM.DEFAULT_API_KEY;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('indosmm_api_key', key);
    }

    // Request daftar layanan dari Indosmm SMM API
    async getServices() {
        if (!this.apiKey) {
            console.warn("[INDOSMM API] API Key kosong, menggunakan data simulasi.");
            return this.getMockServices();
        }

        try {
            const formData = new FormData();
            formData.append("api_key", this.apiKey);
            formData.append("action", "services");

            const response = await fetch(this.baseUrl, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("[INDOSMM API Error]", err);
            return this.getMockServices();
        }
    }

    // Order Layanan SMM via API
    async placeOrder(serviceId, target, quantity) {
        if (!this.apiKey) {
            throw new Error("API Key Indosmm belum diset!");
        }

        const formData = new FormData();
        formData.append("api_key", this.apiKey);
        formData.append("action", "add");
        formData.append("service", serviceId);
        formData.append("target", target);
        formData.append("quantity", quantity);

        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: formData
        });

        return await response.json();
    }

    // Data cadangan jika API belum diisi Key
    getMockServices() {
        return [
            { service: 101, name: '[API] Instagram Followers Indonesia Real 30 Hari', category: 'Instagram Followers', rate: '15000', min: '100', max: '10000', status: 'available' },
            { service: 102, name: '[API] TikTok Likes Instant High Quality', category: 'TikTok Likes', rate: '2500', min: '50', max: '50000', status: 'available' },
            { service: 103, name: '[API] YouTube Views Retention 100% Non-Drop', category: 'YouTube Views', rate: '32000', min: '500', max: '100000', status: 'available' },
            { service: 104, name: '[API] Telegram Channel Members Fast Speed', category: 'Telegram', rate: '12000', min: '200', max: '25000', status: 'available' }
        ];
    }
}

const indosmmAPI = new IndosmmAPI();
