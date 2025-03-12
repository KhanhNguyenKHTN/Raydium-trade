import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
// import { Swap } from './raydium.js'
import { fetchTokenAccountData } from './config.js'
import { NATIVE_MINT } from '@solana/spl-token'



const test = async () => {
    const data = await fetchTokenAccountData();
    console.log(data.tokenAccountRawInfos);
    const inputTokenAcc = data.tokenAccounts.find((a) => NATIVE_MINT.toBase58() === a.mint.toBase58());
    console.log(inputTokenAcc);
};
test();
// // Solana Mainnet Connection
// const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
// // Địa chỉ của Radium Liquidity Pool V4
// const rest = async ()=> {
//     const txDetails = await connection.getParsedTransaction('5EVnDKsgSoDvyFMLYpiq7wpr4is12rfHEfLBZ4wx1RNiqm6uQU1jJYgtePbFf5EPyNP689AzP9SJA8L8iXvBkMSP', {
//         maxSupportedTransactionVersion: 4,
//         commitment: "finalized",
//         encoding: "jsonParsed",
//     });
//     // console.log('address1 :', txDetails.meta);
//     const logText = txDetails.meta.logMessages.filter(log => log.includes('initialize2: InitializeInstruction2')).toString( );
//     console.log('pretoken :', logText);

// // Regex to extract init_pc_amount and init_coin_amount
// const match = logText.match(/init_pc_amount: (\d+), init_coin_amount: (\d+)/);

// if (match) {
//     const init_pc_amount = match[1];
//     const init_coin_amount = match[2];
//     console.log(`init_pc_amount: ${parseFloat(init_pc_amount)/1000000000}`);
//     console.log(`init_coin_amount: ${parseFloat(init_coin_amount) /1000000000}`);
// } else {
//     console.log("Amounts not found in log");
// }
// };

// rest();

// Raydium Program ID
// const RAYDIUM_PROGRAM_ID = new PublicKey(
//     "BMBx962rPyqaUjM4r3E1CRgX3eFxijbAVuHqiwsbAgFb"
//   );

//   console.log(RAYDIUM_PROGRAM_ID.toBase58());
//Swap('PZkZdFmVQbP41q2JKDim7ytnUzTscrvBz2zMH6fpump', 0.01, true, 0.3);
  

//performSwap('', 0.002, false);