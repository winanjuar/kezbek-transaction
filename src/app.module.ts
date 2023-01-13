import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionDetail } from './entity/transaction-detail.entity';
import { TransactionDetailRepository } from './repository/transaction-detail.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRESQL_HOST'),
        port: configService.get<number>('POSTGRESQL_PORT'),
        username: configService.get<string>('POSTGRESQL_USERNAME'),
        password: configService.get<string>('POSTGRESQL_PASSWORD'),
        database: configService.get<string>('POSTGRESQL_DATABASE'),
        entities: [TransactionDetail],
        synchronize: true,
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'CustomerService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_CUSTOMER'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'PartnerService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_PARTNER'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'PromoService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_PROMO'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'LoyaltyService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_LOYALTY'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'MailerService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_MAILER'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'WalletService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_WALLET'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, TransactionDetailRepository],
})
export class AppModule {}
