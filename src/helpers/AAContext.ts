import { Wallet, ethers } from "ethers";
import { Bundler, SoulWalletLib, IUserOpReceipt, UserOperation, ITransaction } from 'soul-wallet-lib';
import { NumberLike, toNumber } from "soul-wallet-lib/dist/defines/numberLike";
import { Utils } from "./Utils";
import { JsonRpcProvider } from '@ethersproject/providers'


export class AAContext  {
    entryPointAddress:string
    walletLogicAddress:string
    bundlerUrl:string
    walletFactoryAddressHas:string
    provider:JsonRpcProvider
    chainId:any;
    soulWalletLib:SoulWalletLib
    bundler:Bundler
    slat:number
    log = (message?: any, ...optionalParams: any[]) => { console.log(message, ...optionalParams) };
    
    constructor () {
        this.entryPointAddress = '0x0576a174d229e3cfa37253523e645a78a0c91b57';
        this.walletLogicAddress = '0x0F8065973c4F7AB41E739302152c5cB6aC7590BA';
        this.walletFactoryAddressHas ="0xC544A5107d887c9df046Cd8C5fB9D61e7559c229"
        this.bundlerUrl = "http://bundler-pol-mumbai.plancker.org/rpc"
        this.provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/MD-3rBtr93tbYyDY518rqsBGupOGuvOV")
        this.soulWalletLib = new SoulWalletLib(SoulWalletLib.Defines.SingletonFactoryAddress);
        this.chainId = this.provider._network.chainId
        this.slat = 0
        this.bundler = new this.soulWalletLib.Bundler(this.entryPointAddress, this.provider, this.bundlerUrl);
        
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
        await this.bundler.init();
        const upgradeDelay = 30;
        const guardianDelay = 30;

        const walletAddress = await this.soulWalletLib.calculateWalletAddress(
            this.walletLogicAddress,
            this.entryPointAddress,
            walletOwner.address,
            upgradeDelay,
            guardianDelay,
            SoulWalletLib.Defines.AddressZero,
            this.slat
        );

        this.log('walletAddress: ' + walletAddress);
        this.log('walletBalance: ' + await this.provider.getBalance(walletAddress), 'wei');
        
        //#region
        const activateOp = this.soulWalletLib.activateWalletOp(
            this.walletLogicAddress,
            this.entryPointAddress,
            walletOwner.address,
            upgradeDelay,
            guardianDelay,
            SoulWalletLib.Defines.AddressZero,
            '0x',
            10000000000,// 100Gwei
            1000000000,// 10Gwei
            this.slat
        );
        await this.estimateUserOperationGas(this.bundler, activateOp);

        const requiredPrefund = await (await activateOp.requiredPrefund()).requiredPrefund;
        this.log('requiredPrefund: ', ethers.utils.formatEther(requiredPrefund));

        await walletOwner.sendTransaction({
            to: walletAddress,
            value: requiredPrefund
        });

        const balance = await this.provider.getBalance(walletAddress);
        this.log('walletBalance: ' + balance, 'wei');

        const userOpHash = activateOp.getUserOpHashWithTimeRange(this.entryPointAddress, this.chainId, walletOwner.address);
        activateOp.signWithSignature(
            walletOwner.address,
            Utils.signMessage(userOpHash, walletOwner.privateKey)
        );

        const validation = await this.bundler.simulateValidation(activateOp);
        if (validation.status !== 0) {
            throw new Error(`error code:${validation.status}`);
        }
        this.log(`simulateValidation result:`, validation);
        const simulate = await this.bundler.simulateHandleOp(activateOp);
        if (simulate.status !== 0) {
            throw new Error(`error code:${simulate.status}`);
        }
        this.log(`simulateHandleOp result:`, simulate);

        
        let activated = false;
        const bundlerEvent = this.bundler.sendUserOperation(activateOp, 1000 * 60 * 5);
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
        
        const walletAddressCode = await this.provider.getCode(walletAddress);
        this.log('walletAddressCode: ' + walletAddressCode);

        return walletAddress
    }

    async transferEth(walletOwner:Wallet, walletAddress:string, accounts:string[]) {
        await this.bundler.init();
        
        let nonce = await this.soulWalletLib.Utils.getNonce(walletAddress, this.provider);

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
        const ConvertedOP = this.soulWalletLib.Utils.fromTransaction(
            rawtx,
            nonce,
            10000000000,// 100Gwei
            1000000000// 10Gwei
        );
        await this.estimateUserOperationGas(this.bundler, ConvertedOP);
        const ConvertedOPuserOpHash = ConvertedOP.getUserOpHashWithTimeRange(this.entryPointAddress, this.chainId, walletOwner.address);
        const ConvertedOPSignature = Utils.signMessage(ConvertedOPuserOpHash, walletOwner.privateKey)

        ConvertedOP.signWithSignature(walletOwner.address, ConvertedOPSignature);
        let validation = await this.bundler.simulateValidation(ConvertedOP);
        if (validation.status !== 0) {
            throw new Error(`error code:${validation.status}`);
        }
        let simulate = await this.bundler.simulateHandleOp(ConvertedOP);
        if (simulate.status !== 0) {
            throw new Error(`error code:${simulate.status}`);
        }

        // get balance of accounts[1].address
        let finish = false
        const bundlerEvent = this.bundler.sendUserOperation(ConvertedOP, 1000 * 60 * 5);
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