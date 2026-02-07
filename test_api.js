const axios = require("axios");

async function testApi() {
    try {
        console.log("Requesting /api/socket...");
        const res = await axios.get("http://localhost:3000/api/socket");
        console.log("Status:", res.status);
        console.log("Headers:", res.headers);
        process.exit(0);
    } catch (err) {
        console.error("API Error:", err.message);
        if (err.response) {
            console.error("Data:", err.response.data);
            console.error("Status:", err.response.status);
        }
        process.exit(1);
    }
}

testApi();
