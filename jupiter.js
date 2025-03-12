const axios = require("axios");

(async () => {
    const inputMint = "InputTokenMintAddress"; // e.g., USDC
    const outputMint = "OutputTokenMintAddress"; // e.g., RAY
    const amount = 10000000; // Amount in smallest units of the input token

    const response = await axios.get(
        `https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
    );

    const routes = response.data.data;
    if (routes.length > 0) {
        console.log("Best Route:", routes[0]);

        const swapRoute = routes[0];
        const transactionResponse = await axios.post(
            "https://quote-api.jup.ag/v4/swap",
            {
                route: swapRoute,
                userPublicKey: "YourPublicKeyHere", // Replace with your public key
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Transaction Signature:", transactionResponse.data.txid);
    } else {
        console.log("No routes found for the swap.");
    }
})();
