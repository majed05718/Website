
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from '../supabase/supabase.service';

interface HealthResponse {
  ok: boolean;
  build: string;
  env: string;
  timestamp: string;
  version: string;
  database?: {
    connected: boolean;
    type: string;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService
  ) {}

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
  async getHealth(): Promise<HealthResponse> {
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const version = this.configService.get<string>('API_VERSION', 'v1');

    let dbStatus = { connected: false, type: 'none' };
    
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true });
      dbStatus = { 
        connected: !error, 
        type: 'supabase' 
      };
    } catch (err) {
      console.log('Supabase health check error:', err.message);
    }

    return {
      ok: true,
      build: buildTime,
      env: environment === 'production' ? 'production' : 'staging',
      timestamp: new Date().toISOString(),
      version,
      database: dbStatus
    };
  }
}
