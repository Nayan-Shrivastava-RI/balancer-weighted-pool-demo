import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNumber, IsNumber, IsString } from 'class-validator';

export class SwapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assetIn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assetOut: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  deadline: number;
}

class TokenData {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  decimals: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  limit: string;
}

class SwapStep {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  poolId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assetIn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assetOut: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: number;
}

export class SetPrivateKeyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  privateKey: string;
}

export class SetPoolIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  poolId: string;
}

export class ApproveTokensDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tokenAddress: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
export class BatchSwapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  deadline: number;

  @ApiProperty({ type: [TokenData] })
  @IsNotEmpty()
  tokenData: TokenData[];

  @ApiProperty({ type: [SwapStep] })
  @IsNotEmpty()
  swapSteps: SwapStep[];
}
