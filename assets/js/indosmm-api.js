/**
 * Indosmm SMM Panel API v2 Integration Module
 */
class IndosmmAPI {
    constructor() {
        this.baseUrl = "https://indosmm.id/api/v2";
    }

    // Mengambil seluruh ~9.686 layanan dari Indosmm secara real-time
    async getServices(apiKey) {
        if (!apiKey) {
            console.warn("[INDOSMM API] API Key kosong.");
            return [];
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    api_key: apiKey,
                    action: "services"
                })
            });

            const data = await response.json();
            if (Array.isArray(data)) {
                return data; // Mengembalikan array berisi ribuan layanan asli Indosmm
            }
            return [];
        } catch (err) {
            console.error("[INDOSMM API Error]", err);
            return [];
        }
    }

    // Eksekusi pesanan nyata ke Indosmm
    async placeOrder(apiKey, serviceId, target, quantity) {
        if (!apiKey) {
            throw new Error("API Key Indosmm belum diatur!");
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    api_key: apiKey,
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
