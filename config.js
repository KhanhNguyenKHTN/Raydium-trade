import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import bs58 from 'bs58'

export const owner = Keypair.fromSecretKey(bs58.decode('4MHSPYyksFXASAb9Xd73Jka1MwLMeQGB8NFauhGpeBpmLV3zHTXPP8NcbqYf8uiePzxu7tMkFgHFNYk3HQw5CCsx'))
export const connection = new Connection('https://api.mainnet-beta.solana.com') //<YOUR_RPC_URL>

export const fetchTokenAccountData = async () => {
    const solAccountResp = await connection.getAccountInfo(owner.publicKey)
    const tokenAccountResp = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
    const token2022Req = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
    const tokenAccountData = parseTokenAccountResp({
      owner: owner.publicKey,
      solAccountResp,
      tokenAccountResp: {
        context: tokenAccountResp.context,
        value: [...tokenAccountResp.value, ...token2022Req.value],
      },
    })
    console.log(tokenAccountData);
    
    return tokenAccountData
  }