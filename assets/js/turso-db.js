/**
 * Turso Database (LibSQL HTTP) API Integration Module
 */
class TursoDBClient {
    constructor() {
        this.url = CONFIG.TURSO.URL;
        this.token = CONFIG.TURSO.AUTH_TOKEN;
    }

    // Melakukan query SQL langsung ke database Turso via HTTP Pipeline
    async executeQuery(sql, args = []) {
        if (!this.url || this.url.includes("your-turso-db-name")) {
            console.warn("[TURSO DB] Token/URL Turso belum dikonfigurasi. Menggunakan Fallback Mock.");
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
            throw error;
        }
    }

    // Ambil Data Statistik Real-time dari Turso Database
    async fetchStats() {
        const query = "SELECT COUNT(*) as total_orders FROM orders;";
        const result = await this.executeQuery(query);
        if (result && result.rows) {
            return { ordersCount: result.rows[0][0].value };
        }
        return null;
    }
}

const tursoClient = new TursoDBClient();
