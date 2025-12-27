
async function testConnection() {
    console.log("Testing connection to LM Studio at http://localhost:1234...");
    try {
        const response = await fetch('http://localhost:1234/v1/models');
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Connection Successful!");
            console.log("Available Models:", JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ Connection Failed: Status ${response.status}`);
        }
    } catch (error) {
        console.error("❌ Connection Error:", error.message);
        console.log("HINT: Ensure LM Studio is running and 'Start Server' is clicked.");
    }
}

testConnection();
