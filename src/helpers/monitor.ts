import { setToLocalStorage, getFromStorage } from './localStorage'
import { BigNumber, ethers, Wallet } from "ethers";
import useStore from '../store/useStore'
import { AAContext } from './AAContext'

export class monitor  {
  private balanceCron: any

  async setBalanceCron (interval: number): Promise<void> {
    clearInterval(this.balanceCron)
    if (interval !== 0) {
      this.balanceCron = setInterval(() => this.checkBalance(), interval * 1000)
    }
  }

  async checkBalance (): Promise<void> {
    console.log("start check balance...")
    const { selectedAccount, selectedNetwork } = useStore.getState()
    console.log("🚀 ~ file: monitor.ts:19 ~ monitor ~ checkBalance ~ selectedAccount:", selectedAccount)
    const provider = new ethers.providers.JsonRpcProvider(selectedNetwork.rpcUrls[0])
    const address:any = selectedAccount?.address
    const oldBalance = getFromStorage(address) ?? "0"
    console.log("oldBalance========="+oldBalance)
    const newBalance = await provider.getBalance(address)
    console.log("newBalance========="+newBalance)
    if (BigNumber.from(newBalance).gt(BigNumber.from(oldBalance))) {
      alert("Create AA or not")
      console.log("newBalance2========="+newBalance)
      const aa = new AAContext()
      const walletOwner = Wallet.fromMnemonic(selectedAccount?.mnemonic as string).connect(provider)
      const aaAddress:string = await aa.activateWallet(walletOwner)

      await walletOwner.sendTransaction({
        to: aaAddress,
        value: BigNumber.from(newBalance).sub(21000) 
      });

      aa.transferEth(walletOwner, aaAddress, [selectedAccount?.address as string, selectedAccount?.address as string])

    }
    setToLocalStorage(address, newBalance.toString())
  }
}