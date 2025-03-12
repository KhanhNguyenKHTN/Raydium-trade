import { Connection, PublicKey } from '@solana/web3.js'
import axios from "axios";
import { performSwap } from './swapToken.js';

// Raydium Program ID
const RAYDIUM_PROGRAM_ID = new PublicKey(
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
);

// Solana Mainnet Connection
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  {
    commitment: "finalized"
  }
);
let hasSwap = false;

const monitorNewPools = async () => {
  try {
    // Subscribe to all transaction logs
    connection.onLogs(
      "all", // Subscribe to all logs
      async (log) => {
        const { signature, logs, err } = log;
        if (err) {
          return;
        }

        // Kiểm tra xem nhật ký có chứa lệnh 'initialize2' hay không
        // && logLine.includes('InitializeAccount')
        if (
          logs.some((logLine) =>
            logLine.includes(RAYDIUM_PROGRAM_ID.toBase58())
          ) &&
          logs.some((logLine) =>
            logLine.includes("initialize2: InitializeInstruction2")
          )
        ) {
          console.log(
            `New pool interaction detected in transaction: ${signature}`
          );
        // console.log("Logs:", logs);

          // Delay fetching Radium accounts by 100 seconds
          waitForTransaction(connection, signature)
            .then((txDetails) => console.log(txDetails))
            .catch((err) => console.error(err));
        }
      }
    );

    console.log("Listening for new pools created via Raydium...");
  } catch (error) {
    console.error("Error monitoring pools:");
  }
};

async function waitForTransaction(
  connection,
  signature,
  retries = 10,
  delay = 10000
) {
  for (let i = 0; i < retries; i++) {
    const txDetails = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 4,
      commitment: "finalized",
      encoding: "jsonParsed",
    });

    if (txDetails) {
      const logText = txDetails.meta.logMessages
        .filter((log) => log.includes("initialize2: InitializeInstruction2"))
        .toString();
      const match = logText.match(
        /init_pc_amount: (\d+), init_coin_amount: (\d+)/
      );
      const address1 = txDetails.meta.preTokenBalances.at(0).mint;
      const amount = parseFloat(match[1]) / 1000000000;
      const address2 = txDetails.meta.preTokenBalances.at(1).mint;
      const amount2 = parseFloat(match[2]) / 1000000000;
      const res = await verifyToken(address2);

      console.log("address1 :", address1);
      console.log("amount :", amount > amount2 ? amount2 : amount);
      console.log("address2 :", address2);
      console.log("amount2 :", amount > amount2 ? amount : amount2);
      console.log("address2 :", getExplorerUrl(signature));
      console.log("address2 :", getExplorerUrl(address2));
      console.log("token:", res.token)
      console.log("score :", res.score);
      // if(!hasSwap) {
      //   await performSwap(address2, 0.002, true);
      //   hasSwap = true;
      // }
      console.log("***************************************");
      console.log("***************************************");
      return;
    }

    console.log(`Retrying... (${i + 1}/${retries})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Transaction not finalized after retries");
}

async function verifyToken(token) {
  try {
    const url = `https://api.rugcheck.xyz/v1/tokens/${token}/report`;

    const headers = {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      authorization: "", // Empty as per the curl command
      "content-type": "application/json",
      origin: "https://rugcheck.xyz",
      priority: "u=1, i",
      "sec-ch-ua":
        '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "x-wallet-address": "null", // Ensure this is a string if you're setting it to 'null'
    };
    const res = await axios.get(url, { headers });
    return {score: res.data?.score, token: res.data?.fileMeta?.symbol};
  } catch (err) {
    console.log(err);
    return { score: 4000, token: ''};
  }
}

// Hàm để tìm nạp các tài khoản Radium
async function fetchRadiumAccounts() {
  fetch(
    "https://api.rugcheck.xyz/v1/tokens/4dBZmY59u9bbgRXcVq79iRT6ELqbTAB4nZo2G3xKpump/report",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzIzODkzOTIsImlkIjoiRHBrNktBRWtDMTlaVjczQVpBWkI2MkVnSExEOTZNdWs1VXQydHluY0U3OUcifQ.XJjqNA0j4Y0Ek2EKKck-x73UhdOioZwbU7WNpbbRQOg",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-wallet-address": "Dpk6KAEkC19ZV73AZAZB62EgHLD96Muk5Ut2tyncE79G",
      },
      referrerPolicy: "same-origin",
      body: null,
      method: "GET",
    }
  );
}

// Hàm để tạo URL Explorer
function getExplorerUrl(signature) {
  return `https://solscan.io/tx/${signature}`;
}

monitorNewPools();
