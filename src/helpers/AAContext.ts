import { Wallet, ethers } from "ethers";
import { Bundler, SoulWalletLib, IUserOpReceipt, UserOperation, ITransaction } from 'soul-wallet-lib';
import { NumberLike, toNumber } from "soul-wallet-lib/dist/defines/numberLike";
import { Utils } from "./Utils";


const log_on = true;
const log = (message?: any, ...optionalParams: any[]) => { if (log_on) console.log(message, ...optionalParams) };
const entryPointAddress = '0x0576a174d229e3cfa37253523e645a78a0c91b57';
const walletLogicAddress = '0x0F8065973c4F7AB41E739302152c5cB6aC7590BA';
const bundlerUrl = "http://bundler-pol-mumbai.plancker.org/rpc"

const walletFactoryAddressHas ="0xC544A5107d887c9df046Cd8C5fB9D61e7559c229"

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/MD-3rBtr93tbYyDY518rqsBGupOGuvOV")

     
const chainId = await (await provider.getNetwork()).chainId;


const soulWalletLib = new SoulWalletLib(SoulWalletLib.Defines.SingletonFactoryAddress);
       
const bundler:Bundler = new soulWalletLib.Bundler(entryPointAddress, provider, bundlerUrl);
await bundler.init();
const slat = 0

export class AAContext  {
    
    constructor () {
        log("chainId:", chainId);
    }

    async estimateUserOperationGas(bundler: Bundler, userOp: UserOperation) {
        const estimateData:any = await bundler.eth_estimateUserOperationGas(userOp);
        if (toNumber(userOp.callGasLimit) === 0) {
            userOp.callGasLimit = estimateData.callGasLimit;
        }
        userOp.preVerificationGas = estimateData.preVerificationGas;
        userOp.verificationGasLimit = estimateData.verificationGas;
    }


    async activateWallet(walletOwner:Wallet):Promise<string> {
        
        const upgradeDelay = 30;
        const guardianDelay = 30;

        const walletAddress = await soulWalletLib.calculateWalletAddress(
            walletLogicAddress,
            entryPointAddress,
            walletOwner.address,
            upgradeDelay,
            guardianDelay,
            SoulWalletLib.Defines.AddressZero,
            slat
        );

        log('walletAddress: ' + walletAddress);
        log('walletBalance: ' + await provider.getBalance(walletAddress), 'wei');
        
        //#region
        const activateOp = soulWalletLib.activateWalletOp(
            walletLogicAddress,
            entryPointAddress,
            walletOwner.address,
            upgradeDelay,
            guardianDelay,
            SoulWalletLib.Defines.AddressZero,
            '0x',
            10000000000,// 100Gwei
            1000000000,// 10Gwei
            slat
        );
        await this.estimateUserOperationGas(bundler, activateOp);

        const requiredPrefund = await (await activateOp.requiredPrefund()).requiredPrefund;
        log('requiredPrefund: ', ethers.utils.formatEther(requiredPrefund));

        await walletOwner.sendTransaction({
            to: walletAddress,
            value: requiredPrefund
        });

        const balance = await provider.getBalance(walletAddress);
        log('walletBalance: ' + balance, 'wei');

        const userOpHash = activateOp.getUserOpHashWithTimeRange(entryPointAddress, chainId, walletOwner.address);
        activateOp.signWithSignature(
            walletOwner.address,
            Utils.signMessage(userOpHash, walletOwner.privateKey)
        );

        const validation = await bundler.simulateValidation(activateOp);
        if (validation.status !== 0) {
            throw new Error(`error code:${validation.status}`);
        }
        log(`simulateValidation result:`, validation);
        const simulate = await bundler.simulateHandleOp(activateOp);
        if (simulate.status !== 0) {
            throw new Error(`error code:${simulate.status}`);
        }
        log(`simulateHandleOp result:`, simulate);

        
        let activated = false;
        const bundlerEvent = bundler.sendUserOperation(activateOp, 1000 * 60 * 5);
        bundlerEvent.on('error', (err: any) => {
            console.log(err);
        });
        bundlerEvent.on('send', (userOpHash: string) => {
            console.log('send: ' + userOpHash);
        });
        bundlerEvent.on('receipt', (receipt: IUserOpReceipt) => {
            console.log('receipt: ' + receipt);
        activated = true;
        
        });
        bundlerEvent.on('timeout', () => {
            console.log('timeout');
        });
        while (!activated) {
            console.log("send userOperration, waiting...");
            await new Promise(r => setTimeout(r, 3000));
        }
        
        const walletAddressCode = await provider.getCode(walletAddress);
        log('walletAddressCode: ' + walletAddressCode);

        return walletAddress
    }

    async transferEth(walletOwner:Wallet, walletAddress:string, accounts:string[]) {

        
        let nonce = await soulWalletLib.Utils.getNonce(walletAddress, provider);

        const rawtx: ITransaction[] = [{
            from: walletAddress,
            to: accounts[0],
            value: ethers.utils.parseEther('0.00001').toHexString(),
            data: '0x'
        }, {
            from: walletAddress,
            to: accounts[1],
            value: ethers.utils.parseEther('0.00002').toHexString(),
            data: '0x'
        }];
        const ConvertedOP = soulWalletLib.Utils.fromTransaction(
            rawtx,
            nonce,
            10000000000,// 100Gwei
            1000000000// 10Gwei
        );
        await this.estimateUserOperationGas(bundler, ConvertedOP);
        const ConvertedOPuserOpHash = ConvertedOP.getUserOpHashWithTimeRange(entryPointAddress, chainId, walletOwner.address);
        const ConvertedOPSignature = Utils.signMessage(ConvertedOPuserOpHash, walletOwner.privateKey)

        ConvertedOP.signWithSignature(walletOwner.address, ConvertedOPSignature);
        let validation = await bundler.simulateValidation(ConvertedOP);
        if (validation.status !== 0) {
            throw new Error(`error code:${validation.status}`);
        }
        let simulate = await bundler.simulateHandleOp(ConvertedOP);
        if (simulate.status !== 0) {
            throw new Error(`error code:${simulate.status}`);
        }

        // get balance of accounts[1].address
        let finish = false
        const bundlerEvent = bundler.sendUserOperation(ConvertedOP, 1000 * 60 * 5);
        bundlerEvent.on('error', (err: any) => {
            console.log(err);
        });
        bundlerEvent.on('send', (userOpHash: string) => {
            console.log('send: ' + userOpHash);
        });
        bundlerEvent.on('receipt', (receipt: IUserOpReceipt) => {
            console.log('receipt: ' + receipt);
            finish = true
        });
        bundlerEvent.on('timeout', () => {
            console.log('timeout');
        });

        while (!finish) {
            console.log("send userOperration, waiting...");
            await new Promise(r => setTimeout(r, 3000));
        }
        

    }


}