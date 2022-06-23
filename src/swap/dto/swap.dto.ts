import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
