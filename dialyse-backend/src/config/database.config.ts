import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// URL de connexion PostgreSQL (Render)
const POSTGRES_URL = 'postgresql://dialyse_user:RxipD4kAINXvnDLymGdJramt46oDYbOe@dpg-d87e970g4nts73dqv2i0-a.ohio-postgres.render.com/dialyse';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: POSTGRES_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  ssl: { rejectUnauthorized: false },
};
