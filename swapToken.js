import {
    Connection,
    Keypair,
    Transaction,
    VersionedTransaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import axios from "axios";
  import bs58 from "bs58";
  
  export async function performSwap(token, amount, isBuy) {
    // Initialize connection and keypair
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const keypair = Keypair.fromSecretKey(bs58.decode("4MHSPYyksFXASAb9Xd73Jka1MwLMeQGB8NFauhGpeBpmLV3zHTXPP8NcbqYf8uiePzxu7tMkFgHFNYk3HQw5CCsx"));
  
    // Swap parameters
    const params = new URLSearchParams({
      from: isBuy ? "So11111111111111111111111111111111111111112" : token, // SOL
      to: isBuy ? token : "So11111111111111111111111111111111111111112", // USDC
      amount: amount, // From amount
      slip: 20, // Slippage
      payer: keypair.publicKey.toBase58(),
      fee: 0.0005, // Priority fee
      txType: "v0", // Change to "legacy" for legacy transactions
    });
  
    try {
      // Get swap transaction
      const response = await axios.get(
        `https://swap.solxtence.com/swap?${params}`
      );
      const { serializedTx, txType } = response.data.transaction;
  
      // Fetch the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
  
      // Deserialize and sign the transaction
      let transaction;
      if (txType === "v0") {
        transaction = VersionedTransaction.deserialize(
          Buffer.from(serializedTx, "base64")
        );
        transaction.message.recentBlockhash = blockhash;
        transaction.sign([keypair]);
      } else {
        transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
        transaction.recentBlockhash = blockhash;
        transaction.sign(keypair);
      }
      console.log(transaction);
  
      // Send and confirm the transaction
      const signature = await sendAndConfirmTransaction(connection, transaction);
      console.log("Swap successful! Transaction signature:", signature);
    } catch (error) {
      console.error("Error performing swap:", error);
    }
  }
  