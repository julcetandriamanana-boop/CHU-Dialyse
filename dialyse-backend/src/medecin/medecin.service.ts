import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medecin } from '../entities/medecin.entity';

@Injectable()
export class MedecinService {
  constructor(@InjectRepository(Medecin) private repo: Repository<Medecin>) {}

  async findAll(): Promise<Medecin[]> {
    return this.repo.find({ relations: ['rendez_vous', 'prescriptions'] });
  }

  async findOne(id: number): Promise<Medecin> {
    const medecin = await this.repo.findOne({ where: { id }, relations: ['rendez_vous', 'prescriptions'] });
    if (!medecin) throw new NotFoundException('Médecin non trouvé');
    return medecin;
  }

  async create(data: Partial<Medecin>): Promise<Medecin> {
    return this.repo.save(this.repo.create(data));
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} médecins existent déjà` };

    const medecins = [
      { nom: 'Andrianjato', specialite: 'Néphrologie', matricule: 'MED-001' },
      { nom: 'Rakoto', specialite: 'Néphrologie', matricule: 'MED-002' },
      { nom: 'Rabary', specialite: 'Médecine interne', matricule: 'MED-003' },
    ];
    for (const m of medecins) await this.repo.save(this.repo.create(m));
    return { message: '3 médecins créés' };
  }
}
