import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Infirmier } from '../entities/infirmier.entity';

@Injectable()
export class InfirmierService {
  constructor(
    @InjectRepository(Infirmier)
    private repo: Repository<Infirmier>,
  ) {}

  async findAll(): Promise<Infirmier[]> {
    return this.repo.find({
      where: { actif: true },
      order: { nom_complet: 'ASC' },
    });
  }

  async findById(id: number): Promise<Infirmier> {
    const inf = await this.repo.findOne({ where: { id } });
    if (!inf) throw new NotFoundException(`Infirmier #${id} introuvable`);
    return inf;
  }

  async create(data: Partial<Infirmier>): Promise<Infirmier> {
    return this.repo.save(this.repo.create({
      ...data,
      actif: true,
      service_nom: data.service_nom || 'Dialyse',
    }));
  }

  async update(id: number, data: Partial<Infirmier>): Promise<Infirmier> {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async desactiver(id: number): Promise<Infirmier> {
    await this.findById(id);
    await this.repo.update(id, { actif: false });
    return this.findById(id);
  }
}
