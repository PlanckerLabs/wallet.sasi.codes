import { Chain, ChainName } from './types'
export const INFURA_ID = process.env.INFURA_ID

/**
 * Data from Chainlist
 * @see https://chainlist.org
 */
export const chain: Record<ChainName, Chain> = {
  mainnet: {
    id: 1,
    name: 'Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [`https://mainnet.infura.io/v3/${INFURA_ID}`],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://etherscan.io'
      }
    ]
  },
  ropsten: {
    id: 3,
    name: 'Ropsten',
    nativeCurrency: { name: 'Ropsten Ether', symbol: 'ropETH', decimals: 18 },
    rpcUrls: [`https://ropsten.infura.io/v3/${INFURA_ID}`],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://ropsten.etherscan.io'
      }
    ],
    testnet: true
  },
  rinkeby: {
    id: 4,
    name: 'Rinkeby',
    nativeCurrency: { name: 'Rinkeby Ether', symbol: 'rETH', decimals: 18 },
    rpcUrls: [`https://rinkeby.infura.io/v3/${INFURA_ID}`],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://rinkeby.etherscan.io'
      }
    ],
    testnet: true
  },
  gnosis: {
    id: 100,
    name: 'Gnosis Chain',
    nativeCurrency: { name: 'xDai', symbol: 'xDAI', decimals: 18 },
    rpcUrls: ['https://rpc.gnosischain.com'],
    blockExplorers: [
      {
        name: 'Blockscout',
        url: 'https://blockscout.com'
      }
    ]
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'gETH', decimals: 18 },
    rpcUrls: [`https://goerli.infura.io/v3/${INFURA_ID}`],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://goerli.etherscan.io'
      }
    ],
    testnet: true
  },
  kovan: {
    id: 42,
    name: 'Kovan',
    nativeCurrency: { name: 'Kovan Ether', symbol: 'kETH', decimals: 18 },
    rpcUrls: [`https://kovan.infura.io/v3/${INFURA_ID}`],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://kovan.etherscan.io'
      }
    ],
    testnet: true
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://optimistic.etherscan.io'
      }
    ]
  },
  optimismKovan: {
    id: 69,
    name: 'Optimism Kovan',
    nativeCurrency: {
      name: 'Kovan Ether',
      symbol: 'KOR',
      decimals: 18
    },
    rpcUrls: ['https://kovan.optimism.io'],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://kovan-optimistic.etherscan.io'
      }
    ],
    testnet: true
  },
  polygonMainnet: {
    id: 137,
    name: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://matic-mainnet-full-rpc.bwarelabs.com'
    ],
    blockExplorers: [
      {
        name: 'Polygonscan',
        url: 'https://polygonscan.com'
      }
    ]
  },
  polygonTestnetMumbai: {
    id: 80_001,
    name: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://matic-mumbai.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-testnet-archive-rpc.bwarelabs.com'
    ],
    blockExplorers: [
      {
        name: 'Polygonscan',
        url: 'https://mumbai.polygonscan.com'
      }
    ],
    testnet: true
  },
  arbitrumOne: {
    id: 42_161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'AETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorers: [
      { name: 'Arbiscan', url: 'https://arbiscan.io' },
      {
        name: 'Arbitrum Explorer',
        url: 'https://explorer.arbitrum.io'
      }
    ]
  },
  arbitrumRinkeby: {
    id: 421_611,
    name: 'Arbitrum Rinkeby',
    nativeCurrency: {
      name: 'Arbitrum Rinkeby Ether',
      symbol: 'ARETH',
      decimals: 18
    },
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorers: [
      {
        name: 'Arbitrum Explorer',
        url: 'https://rinkeby-explorer.arbitrum.io'
      }
    ],
    testnet: true
  },
  avalanche: {
    id: 43_114,
    name: 'Avalanche Mainnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorers: [{ name: 'SnowTrace', url: 'https://snowtrace.io' }],
    testnet: false
  },
  avalancheFuji: {
    id: 43_113,
    name: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorers: [
      { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' }
    ],
    testnet: true
  }
}

export const allChains: Chain[] = Object.values(chain)

export const getCurrentChainInfo = (chainId: number): Chain => {
  allChains.forEach((n) => {
    if (n.id === chainId) return n
  })
  return chain.mainnet
}
