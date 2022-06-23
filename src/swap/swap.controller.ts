import { Controller, Post, Body } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { SetPoolIdDto, SetPrivateKeyDto, SwapDto } from './dto/swap.dto';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post('single-swap')
  @ApiOkResponse({
    description: 'execute single swap',
  })
  async swap(@Body() swapDto: SwapDto) {
    return await this.swapService.swap(swapDto);
  }

  @Post('set-private-key')
  @ApiOkResponse({
    description: 'set private key',
  })
  async setPrivateKey(@Body() setPrivateKeyDto: SetPrivateKeyDto) {
    return await this.swapService.setPrivateKey(setPrivateKeyDto.privateKey);
  }

  @Post('set-pool-id')
  @ApiOkResponse({
    description: 'set pool id',
  })
  async setPoolId(@Body() setPoolIdDto: SetPoolIdDto) {
    return await this.swapService.setPoolId(setPoolIdDto.poolId);
  }
}
