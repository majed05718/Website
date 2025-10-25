import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Environment variables
  const port = parseInt(process.env.PORT || '3001', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Security - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Compression
  app.use(compression());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation (only in development or with AUTH in production)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Property Management API')
      .setDescription('Real Estate Management System API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Health check endpoint (no auth required)
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      port: port,
    });
  });

  // Listen on localhost only (Nginx will handle external access)
  await app.listen(port, '0.0.0.0');

  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 Backend is running!');
  console.log(`📍 Local URL:    http://localhost:${port}`);
  console.log(`📚 Environment:  ${nodeEnv}`);
  console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
  if (nodeEnv !== 'production') {
    console.log(`📖 Swagger UI:   http://localhost:${port}/api/docs`);
  }
  console.log('═══════════════════════════════════════════════════');
}

bootstrap();
