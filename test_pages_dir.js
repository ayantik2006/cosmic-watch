const axios = require("axios");

async function testPages() {
    try {
        console.log("Requesting /test_dir...");
        const res = await axios.get("http://localhost:3000/test_dir");
        console.log("Status:", res.status);
        if (res.data.includes("Pages Directory is Working")) {
            console.log("SUCCESS: Pages directory is being served.");
        } else {
            console.log("FAILURE: Received unexpected response.");
        }
        process.exit(0);
    } catch (err) {
        console.error("API Error:", err.message);
        process.exit(1);
    }
}

testPages();
