import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⚠️ CRITICAL: Trust Proxy (مطلوب للـ Replit)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS Configuration - Dynamic Origin
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  // Add Replit Dev Domain dynamically
  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // في Replit، اسمح بكل شيء في Development
        if (process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security & Compression
  app.use(helmet({
    contentSecurityPolicy: false, // تعطيل CSP للـ Swagger
  }));
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Property Management API')
    .setDescription('API for Property Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health Check Endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      domain: process.env.REPLIT_DEV_DOMAIN || 'localhost',
      port: process.env.PORT || 3001
    });
  });

  // ⚠️ CRITICAL: Listen on 0.0.0.0 (مطلوب للـ Replit)
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log('════════════════════════════════════════');
  console.log('🚀 Backend is running!');
  console.log(`📍 Local: ${await app.getUrl()}`);
  console.log(`📚 Swagger: ${await app.getUrl()}/api/docs`);
  
  if (process.env.REPLIT_DEV_DOMAIN) {
    console.log(`🌐 Public: https://${process.env.REPLIT_DEV_DOMAIN}`);
    console.log(`📖 Swagger: https://${process.env.REPLIT_DEV_DOMAIN}/api/docs`);
  }
  console.log('════════════════════════════════════════');
}

bootstrap();
