import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .setTitle('API Docs')
  .setDescription('The API of the IoT project')
  .setVersion('1.0')
  .addTag('api')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
  // Cấu hình CORS
  app.enableCors({
    origin: '*', // Cho phép tất cả các origin, thay '*' bằng danh sách các origin cụ thể để tăng cường bảo mật
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được cho phép
    allowedHeaders: 'Content-Type, Accept', // Các tiêu đề được cho phép
    credentials: true,
  });

  // Cấu hình Swagger


  await app.listen(3333);
}
bootstrap();