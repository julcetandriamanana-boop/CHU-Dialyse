import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SeanceHemodialyse } from '../entities/seance-hemodialyse.entity';

@Injectable()
export class SeanceService {
  constructor(@InjectRepository(SeanceHemodialyse) private repo: Repository<SeanceHemodialyse>) {}

  async findAll(patientId?: number): Promise<SeanceHemodialyse[]> {
    const where: any = {};
    if (patientId) where.patient = { id: patientId };
    return this.repo.find({ where, relations: ['patient'], order: { date_debut: 'DESC' } });
  }

  async findOne(id: number): Promise<SeanceHemodialyse> {
    const seance = await this.repo.findOne({ where: { id }, relations: ['patient'] });
    if (!seance) throw new NotFoundException('Séance non trouvée');
    return seance;
  }

  async getAujourdHui(): Promise<{ total: number; seances: SeanceHemodialyse[] }> {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const seances = await this.repo.find({
      where: { date_debut: Between(aujourdHui, demain) },
      relations: ['patient'],
      order: { date_debut: 'ASC' },
    });
    return { total: seances.length, seances };
  }

  async create(data: any): Promise<SeanceHemodialyse> {
    return this.repo.save(this.repo.create({
      patient: { id: data.patientId },
      date_debut: new Date(data.date_debut),
      date_fin: new Date(data.date_fin),
      poids_pre: data.poids_pre,
      poids_post: data.poids_post,
      observations: data.observations || '',
    }));
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} séances existent` };

    const maintenant = new Date();
    const seances = [
      { patient: { id: 1 }, date_debut: new Date(maintenant.getTime() - 2*3600000), date_fin: new Date(), poids_pre: 72.5, poids_post: 70.1, observations: 'Séance normale' },
      { patient: { id: 2 }, date_debut: new Date(maintenant.getTime() - 1*3600000), date_fin: new Date(), poids_pre: 85.0, poids_post: 82.3, observations: 'Légère hypotension' },
    ];
    for (const s of seances) await this.repo.save(this.repo.create(s));
    return { message: '2 séances créées' };
  }
}
