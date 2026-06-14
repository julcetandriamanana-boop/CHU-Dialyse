import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Infirmier } from '../entities/infirmier.entity';
import { InfirmierController } from './infirmier.controller';
import { InfirmierService } from './infirmier.service';

@Module({
  imports: [TypeOrmModule.forFeature([Infirmier])],
  controllers: [InfirmierController],
  providers: [InfirmierService],
  exports: [InfirmierService],
})
export class InfirmierModule {}
