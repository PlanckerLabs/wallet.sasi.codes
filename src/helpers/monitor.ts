import { setToLocalStorage, getFromStorage } from './localStorage'
import { BigNumber, ethers } from "ethers";
import useStore from '../store/useStore'
//import { AAContext } from './AAContext'

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
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/MD-3rBtr93tbYyDY518rqsBGupOGuvOV')
    const address:any = "0x6C812d6c8dcC8f1a9564E291dB9101Cd273242E5"
    const oldBalance = getFromStorage(address) ?? "0"
    console.log("oldBalance========="+oldBalance)
    const newBalance = await provider.getBalance(address)
    console.log("newBalance========="+newBalance)
    if (BigNumber.from(newBalance).gt(BigNumber.from(oldBalance))) {
      alert("Create AA or not")
      console.log("newBalance2========="+newBalance)
      //const aa = new AAContext()
      //aa.activateWallet()
    }
    setToLocalStorage(address, newBalance.toString())
  }
}