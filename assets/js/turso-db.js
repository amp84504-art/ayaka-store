/**
 * Turso Database (LibSQL HTTP) API Integration Module
 */
class TursoDBClient {
    constructor() {
        this.url = CONFIG.TURSO.URL;
        this.token = CONFIG.TURSO.AUTH_TOKEN;
    }

    // Eksekusi query SQL langsung ke database Turso via HTTP Pipeline
    async executeQuery(sql, args = []) {
        if (!this.url || this.url.includes("your-turso-db-name")) {
            console.warn("[TURSO DB] Token/URL Turso belum dikonfigurasi.");
            return null;
        }

        try {
            const response = await fetch(`${this.url}/v2/pipeline`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requests: [
                        { type: "execute", stmt: { sql: sql, args: args } },
                        { type: "close" }
                    ]
                })
            });

            const data = await response.json();
            return data.results[0]?.response?.result;
        } catch (error) {
            console.error("[TURSO DB Error]", error);
            return null;
        }
    }

    // Mengambil hitungan nyata statistik dari database Turso
    async fetchRealtimeStats() {
        try {
            const queryOrders = "SELECT COUNT(*) FROM orders;";
            const queryUsers = "SELECT COUNT(*) FROM users;";
            const queryProducts = "SELECT COUNT(*) FROM products;";

            const [resOrders, resUsers, resProducts] = await Promise.all([
                this.executeQuery(queryOrders),
                this.executeQuery(queryUsers),
                this.executeQuery(queryProducts)
            ]);

            const ordersCount = resOrders?.rows?.[0]?.[0]?.value ?? 0;
            const usersCount = resUsers?.rows?.[0]?.[0]?.value ?? 0;
            const productsCount = resProducts?.rows?.[0]?.[0]?.value ?? 0;

            return {
                ordersCount,
                usersCount,
                productsCount
            };
        } catch (err) {
            console.error("[TURSO STATS ERROR]", err);
            return null;
        }
    }

    // Fungsi untuk menyimpan transaksi/pesanan baru secara nyata ke Turso DB
    async createOrder(userId, productId, targetDest, totalPrice) {
        const sql = "INSERT INTO orders (user_id, product_id, target_dest, total_price, status) VALUES (?, ?, ?, ?, 'completed');";
        return await this.executeQuery(sql, [
            { type: "integer", value: String(userId || 1) },
            { type: "integer", value: String(productId || 1) },
            { type: "text", value: String(targetDest || "guest") },
            { type: "float", value: totalPrice }
        ]);
    }
}

const tursoClient = new TursoDBClient();
