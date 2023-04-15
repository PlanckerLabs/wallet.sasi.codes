import { Chain, ChainName } from './types'
export const INFURA_ID = '6924ef8bbfd54acabaee0eb521421d76'

/**
 * Data from Chainlist
 * @see https://chainlist.org
 */
export const chain: Record<ChainName, Chain> = {
  polygonTestnetMumbai: {
    id: 80_001,
    name: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://polygon-mumbai.g.alchemy.com/v2/MD-3rBtr93tbYyDY518rqsBGupOGuvOV'
    ],
    blockExplorers: [
      {
        name: 'Polygonscan',
        url: 'https://mumbai.polygonscan.com'
      }
    ],
    testnet: true
  }
}

export const allChains: Chain[] = Object.values(chain)

export const getCurrentChainInfo = (chainId: number): Chain => {
  allChains.forEach((n) => {
    if (n.id === chainId) return n
  })
  return chain.polygonTestnetMumbai
}
