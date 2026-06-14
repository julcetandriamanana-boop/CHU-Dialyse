import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://chu-dialyse-frontend.onrender.com',
      'https://chu-dialyse.onrender.com',
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    credentials: true,
  });

  // ✅ Fix encodage UTF-8
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('CHU Andrainjato - API Dialyse')
    .setDescription('Documentation complète de l\'API du service de dialyse')
    .setVersion('2.4.1')
    .addTag('Patients',        'Gestion des patients')
    .addTag('Prescriptions',   'Gestion des prescriptions médicales')
    .addTag('Rendez-vous',     'Gestion des rendez-vous')
    .addTag('Rapports',        'Rapports avancés CHU Dialyse')
    .addTag('Notifications',   'Système de notifications')
    .addServer('http://localhost:3001',              'Serveur local (développement)')
    .addServer('https://chu-dialyse.onrender.com',  'Serveur Render (production)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log('🚀 Backend NestJS sur http://localhost:3001');
  console.log('📚 Swagger Docs  sur http://localhost:3001/api/docs');
  console.log('📊 Rapports      sur http://localhost:3001/rapports');
}
bootstrap();
