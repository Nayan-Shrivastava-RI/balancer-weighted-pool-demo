import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ApproveTokensDto, BatchSwapDto, SwapDto } from './dto/swap.dto';
import Web3 from 'web3';
import { ConfigService } from '@nestjs/config';
import { vaultContractABI } from 'src/swap/abi/vault-abi';
import { ERC20ABI } from './abi/erc20-abi';
@Injectable()
export class SwapService {
  private web3: Web3;
  private scalpingContract: any;
  private vaultContract: any;
  private poolId: string;
  private privateKey: string;
  private accountAddress: string;
  private network = 'kovan';
  private blockExplorerUrl = 'https://kovan.etherscan.io/';
  private chainId = 42;
  private gasPrice = 2;
  private vaultAddress: string;
  constructor(private configService: ConfigService) {
    const httpProvider = new Web3.providers.HttpProvider(
      this.configService.get('NETWORK_URL'),
    );
    this.vaultAddress = this.configService.get('VAULT_ADDRESS');
    this.web3 = new Web3(httpProvider);
    this.vaultContract = new this.web3.eth.Contract(
      vaultContractABI,
      this.vaultAddress,
    );
    this.setPoolId(this.configService.get('POOL_ID'));
    this.setPrivateKey(this.configService.get('PRIVATE_KEY'));
    this.accountAddress = this.web3.eth.accounts.privateKeyToAccount(
      this.privateKey,
    ).address;
  }

  async setPrivateKey(privateKey: string) {
    this.privateKey = privateKey;
    this.accountAddress = this.web3.eth.accounts.privateKeyToAccount(
      this.privateKey,
    ).address;
  }

  async setPoolId(poolId: string) {
    this.poolId = poolId;
  }

  private async getTokendecimals(tokenAddress: string): Promise<number> {
    const tokenContract = new this.web3.eth.Contract(ERC20ABI, tokenAddress);
    const decimals = await tokenContract.methods.decimals().call();
    return decimals;
  }

  async singleSwap(swapDto: SwapDto) {
    if (!this.poolId) {
      throw new NotAcceptableException('PoolId not set');
    }

    if (!this.privateKey) {
      throw new NotAcceptableException('privateKey not set');
    }

    const fund_settings = {
      sender: this.accountAddress,
      recipient: this.accountAddress,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    // // Pool IDs
    // const pool_BAL_WETH =
    //   '0x61d5dc44849c9c87b0856a2a311536205c96c7fd000200000000000000000000';

    // Token addresses (checksum format)
    swapDto.assetIn = swapDto.assetIn.toLowerCase();
    swapDto.assetOut = swapDto.assetOut.toLowerCase();

    // SwapKind is an Enum. This example handles a GIVEN_IN swap.
    // https://github.com/balancer-labs/balancer-v2-monorepo/blob/0328ed575c1b36fb0ad61ab8ce848083543070b9/pkg/vault/contracts/interfaces/IVault.sol#L497
    // 0 = GIVEN_IN, 1 = GIVEN_OUT

    const swap_kind = 0;
    const assetInDecimals = await this.getTokendecimals(swapDto.assetIn);

    const swap_struct = {
      poolId: this.poolId,
      kind: swap_kind,
      assetIn: this.web3.utils.toChecksumAddress(swapDto.assetIn),
      assetOut: this.web3.utils.toChecksumAddress(swapDto.assetOut),
      amount: (Number(swapDto.amount) * Math.pow(10, assetInDecimals))
        .toFixed(0)
        .toString(),
      userData: '0x',
    };

    const fund_struct = {
      sender: this.web3.utils.toChecksumAddress(swapDto.sender),
      fromInternalBalance: fund_settings['fromInternalBalance'],
      recipient: this.web3.utils.toChecksumAddress(swapDto.recipient),
      toInternalBalance: fund_settings['toInternalBalance'],
    };

    const token_limit = (Number(swapDto.limit) * Math.pow(10, assetInDecimals))
      .toFixed(0)
      .toString();

    const singleSwapFunction = this.vaultContract.methods.swap(
      swap_struct,
      fund_struct,
      token_limit,
      swapDto.deadline.toString(),
    );
    return await this.buildAndSend(singleSwapFunction, this.vaultAddress);
  }

  // pool_WETH_USDC =
  //   '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004';
  // pool_BAL_WETH =
  //   '0x61d5dc44849c9c87b0856a2a311536205c96c7fd000200000000000000000000';

  // // Token addresses (checksum format)
  // token_BAL = '0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7'.toLowerCase();
  // token_USDC = '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115'.toLowerCase();
  // token_WETH = '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1'.toLowerCase();

  // swap_steps = [
  //   {
  //     poolId: batchSwapDto.step,
  //     assetIn: token_USDC,
  //     assetOut: token_WETH,
  //     amount: 100,
  //   },
  //   {
  //     poolId: pool_BAL_WETH,
  //     assetIn: token_WETH,
  //     assetOut: token_BAL,
  //     amount: 0,
  //   },
  // ];

  async batchSwap(batchSwapDto: BatchSwapDto) {
    if (!this.poolId) {
      throw new NotAcceptableException('PoolId not set');
    }

    if (!this.privateKey) {
      throw new NotAcceptableException('privateKey not set');
    }
    const swapKind = 0;

    const fund_settings = {
      sender: batchSwapDto.sender,
      recipient: batchSwapDto.recipient,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const tokenAddresses = batchSwapDto.tokenData.map((data) => data.address);
    tokenAddresses.sort();
    const tokenIndices = {};
    for (let i = 0; i < tokenAddresses.length; i++) {
      tokenIndices[tokenAddresses[i]] = i;
    }

    const swapStepsStruct = [];
    for (const step of batchSwapDto.swapSteps) {
      const swapStepStruct = {
        poolId: step['poolId'],
        assetInIndex: tokenIndices[step['assetIn']],
        assetOutIndex: tokenIndices[step['assetOut']],
        amount: (
          step['amount'] *
          Math.pow(
            10,
            Number(
              batchSwapDto.tokenData.find(
                (data) => data.address === step['assetIn'],
              ).decimals,
            ),
          )
        ).toString(),
        userData: '0x',
      };
      swapStepsStruct.push(swapStepStruct);
    }
    const fundStruct = {
      sender: this.web3.utils.toChecksumAddress(fund_settings['sender']),
      fromInternalBalance: fund_settings['fromInternalBalance'],
      recipient: this.web3.utils.toChecksumAddress(fund_settings['recipient']),
      toInternalBalance: fund_settings['toInternalBalance'],
    };

    const tokenLimits = [];
    const checksumTokens = [];
    for (const token of tokenAddresses) {
      tokenLimits.push(
        (
          Number(
            batchSwapDto.tokenData.find((data) => data.address === token).limit,
          ) *
          Math.pow(
            10,
            Number(
              batchSwapDto.tokenData.find((data) => data.address === token)
                .decimals,
            ),
          )
        ).toString(),
      );
      checksumTokens.push(this.web3.utils.toChecksumAddress(token));
    }
    console.log(
      swapKind,
      swapStepsStruct,
      checksumTokens,
      fundStruct,
      tokenLimits,
      batchSwapDto.deadline.toString(),
    );
    const batchSwapFunction = this.vaultContract.methods.batchSwap(
      swapKind,
      swapStepsStruct,
      checksumTokens,
      fundStruct,
      tokenLimits,
      batchSwapDto.deadline.toString(),
    );

    return await this.buildAndSend(batchSwapFunction, this.vaultAddress);
  }

  private async buildAndSend(txFunction: any, to: string) {
    let gas_estimate;
    try {
      gas_estimate = await txFunction.estimateGas();
    } catch (err) {
      gas_estimate = 200000;
      console.log(
        'Failed to estimate gas, attempting to send with',
        gas_estimate,
        'gas limit...',
      );
    }

    const txObject = {
      chainId: this.chainId,
      gas: this.web3.utils.toHex(gas_estimate),
      gasPrice: this.web3.utils.toHex(
        this.web3.utils.toWei(this.gasPrice.toString(), 'gwei'),
      ),
      nonce: await this.web3.eth.getTransactionCount(this.accountAddress),
      data: txFunction.encodeABI(),
      to: to,
    };
    const receipt = await this.web3.eth.accounts
      .signTransaction(txObject, this.privateKey)
      .then((signed_tx) =>
        this.web3.eth.sendSignedTransaction(signed_tx['rawTransaction']),
      );
    console.log(receipt);
    return receipt;
  }

  async approveTokens(approveTokensDto: ApproveTokensDto) {
    const tokenContract = new this.web3.eth.Contract(
      ERC20ABI,
      approveTokensDto.tokenAddress,
    );
    const approveTokenFunction = tokenContract.methods.approve(
      this.vaultAddress,
      approveTokensDto.amount.toFixed(0),
    );
    return await this.buildAndSend(
      approveTokenFunction,
      approveTokensDto.tokenAddress,
    );
  }
}
