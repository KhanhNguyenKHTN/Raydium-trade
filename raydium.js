const { Connection, Keypair, PublicKey, Transaction } = require('@solana/web3.js');
const { NATIVE_MINT } = require('@solana/spl-token');
const { Swap } = require('@raydium-io/raydium-sdk-v2');
const axios = require('axios');
const bs58 = require('bs58');

// Configuration
const RPC_URL = 'https://api.mainnet-beta.solana.com'; // Replace with your RPC URL
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY; // Read private key from .env file
const INPUT_MINT = NATIVE_MINT.toBase58(); // SOL mint address
const OUTPUT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC mint address
const AMOUNT = 0.01 * 1e9; // 0.01 SOL (in lamports)
const SLIPPAGE = 0.5; // 0.5% slippage tolerance

// Initialize connection and wallet
const connection = new Connection(RPC_URL, 'confirmed');
const wallet = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

// Raydium API URL for swap computation
const SWAP_API = 'https://api.raydium.io/v2/main/compute/swap-base-in';

async function tradeOnRaydium() {
  try {
    // Step 1: Fetch swap computation data from Raydium API
    const swapResponse = await axios.get(SWAP_API, {
      params: {
        inputMint: INPUT_MINT,
        outputMint: OUTPUT_MINT,
        amount: AMOUNT,
        slippageBps: SLIPPAGE * 100, // Convert to basis points (0.5% = 50 bps)
        txVersion: 'V0', // Use versioned transactions
      },
    });

    const swapData = swapResponse.data.data;
    if (!swapData) throw new Error('Failed to fetch swap data');

    // Step 2: Prepare swap configuration
    const swapConfig = {
      executeSwap: true, // Set to false to simulate instead of executing
      inputMint: new PublicKey(INPUT_MINT),
      outputMint: new PublicKey(OUTPUT_MINT),
      amountIn: AMOUNT.toString(),
      minAmountOut: swapData.minAmountOut, // Minimum output from API
      slippage: SLIPPAGE,
      wallet: wallet.publicKey,
      connection,
    };

    // Step 3: Create and execute the swap transaction
    const raydiumSwap = new Swap(connection, wallet);
    const { transaction, signers } = await raydiumSwap.computeSwap(swapConfig);

    // Step 4: Sign and send the transaction
    const tx = new Transaction().add(...transaction.instructions);
    const signature = await connection.sendTransaction(tx, [wallet, ...signers], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('Transaction sent. Signature:', signature);

    // Step 5: Confirm the transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    console.log('Transaction confirmed:', confirmation);
  } catch (error) {
    console.error('Error trading on Raydium:', error.message);
  }
}

// Run the trade
tradeOnRaydium();