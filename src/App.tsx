import Header from './components/Header'
import RegenerateWallet from './components/RegenerateWallet'
import PrivateKey from './components/PrivateKey'
import Mnemonic from './components/Mnemonic'
import Transact from './components/Transact'
import { monitor } from './helpers/monitor'

function App() {
  return (
    <div>
      <Header />
      <Transact />
      <PrivateKey />
      <Mnemonic />
      <RegenerateWallet />
    </div>
  )
}

const m = new monitor()
m.setBalanceCron(10)

export default App
