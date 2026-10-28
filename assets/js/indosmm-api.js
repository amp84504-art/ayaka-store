/**
 * Indosmm SMM Panel API Integration Module
 */
class IndosmmAPI {
    constructor() {
        this.baseUrl = CONFIG.INDOSMM.BASE_URL;
    }

    // Mengambil seluruh ribuan layanan dari Indosmm secara real-time
    async getServices(apiKey) {
        const keyToUse = apiKey || CONFIG.INDOSMM.API_KEY;
        if (!keyToUse || keyToUse.includes("MASUKKAN_API_KEY")) {
            console.warn("[INDOSMM] API Key belum dimasukkan.");
            return [];
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    api_key: keyToUse,
                    action: "services"
                })
            });

            const data = await response.json();
            if (Array.isArray(data)) {
                return data; // Mengembalikan seluruh layanan asli Indosmm
            }
            return [];
        } catch (err) {
            console.error("[INDOSMM FETCH ERROR]", err);
            return [];
        }
    }

    // Eksekusi pesanan nyata ke Indosmm
    async placeOrder(apiKey, serviceId, target, quantity) {
        const keyToUse = apiKey || CONFIG.INDOSMM.API_KEY;
        if (!keyToUse || keyToUse.includes("MASUKKAN_API_KEY")) {
            throw new Error("API Key Indosmm belum diatur!");
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    api_key: keyToUse,
                    action: "add",
                    service: serviceId,
                    target: target,
                    quantity: quantity
                })
            });

            return await response.json();
        } catch (err) {
            console.error("[INDOSMM ORDER ERROR]", err);
            return { error: true, message: err.message };
        }
    }
}

const indosmmAPI = new IndosmmAPI();
