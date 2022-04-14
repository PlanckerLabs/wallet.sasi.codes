import Davatar from '@davatar/react'
import { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'
import { shortenAddress } from '../helpers/shorten'
import useStore from '../store/useStore'
import { GitHub } from 'react-feather'
import Tooltip from './Tooltip'
import { ethers } from 'ethers'
import NetworkSelect from './NetworkSelect'

const Header = () => {
  const { generateNewWallet, selectedAccount, selectedNetwork } = useStore()
  const [showBlockie, setShowBlockie] = useState(true)
  const [burnerBalance, setBurnerBalance] = useState('0')

  const provider = new ethers.providers.JsonRpcProvider(
    selectedNetwork?.rpcUrls[0]
  )

  const getBalance = async () => {
    const data = await provider.getBalance(selectedAccount?.address || '')
    setBurnerBalance(ethers.utils.formatUnits(data))
  }

  useEffect(() => {
    getBalance()
  }, [selectedNetwork])

  useEffect(() => {
    if (!selectedAccount) generateNewWallet()
  }, [])

  if (!selectedAccount) {
    return <div className="grid place-items-center">Loading...</div>
  }

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowBlockie((b) => !b)}>
            {showBlockie ? (
              <img
                src={`https://stamp.fyi/avatar/${selectedAccount.address}`}
                className="rounded-full w-9 h-9"
                draggable={false}
                alt=""
              />
            ) : (
              <Davatar
                size={36}
                address={selectedAccount?.address}
                generatedAvatarType="jazzicon"
              />
            )}
          </button>
          <span className="flex flex-col items-start">
            <button className="text-2xl outline-none">
              <CopyToClipboard
                text={selectedAccount.address}
                onCopy={() => toast.success('Address copied 🎉')}
              >
                <span>{shortenAddress(selectedAccount.address)}</span>
              </CopyToClipboard>
            </button>
            <span className="h-4 text-xs bg-gray-900 rounded-full">
              {burnerBalance} {selectedNetwork?.nativeCurrency?.symbol}
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center pt-2 space-x-4">
        <NetworkSelect />
        <Tooltip placement="bottom" content="Source Code">
          <a
            title="Source Code"
            href="https://github.com/sasicodes/wallet.sasi.codes"
            className="flex items-center"
            target="_blank"
            rel="noreferrer"
          >
            <GitHub className="w-4 h-4" />
          </a>
        </Tooltip>
      </div>
    </div>
  )
}

export default Header
