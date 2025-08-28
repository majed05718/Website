
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthResponse {
  ok: boolean;
  build: string;
  env: string;
  timestamp: string;
  version: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        build: { type: 'string' },
        env: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' }
      }
    }
  })
  getHealth(): HealthResponse {
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const version = this.configService.get<string>('API_VERSION', 'v1');

    return {
      ok: true,
      build: buildTime,
      env: environment === 'production' ? 'production' : 'staging',
      timestamp: new Date().toISOString(),
      version
    };
  }
}
