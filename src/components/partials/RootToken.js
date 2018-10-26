import { createAsset } from '/store/actions'
import { Coins, rootToken } from '/api/coins'
import { getRandomMnemonic } from '/api/bip39'

export default function RootToken(totalAsset, res) {    
    const seedArray = []
    try {
        if (totalAsset === 0) {
            rootToken.forEach((symbol) => {
                let Coin = Coins[symbol]
                const seedWords = getRandomMnemonic()
                const wallet = Coin.getWalletFromSeed({ seed: seedWords })
                const address = wallet.address
                createAsset(Coin.type, symbol, address)               
                seedArray.push(seedWords)
            });
        }    
    } catch (e) {
        console.log("Token Create Error: " + e)
    }    
    return seedArray
}