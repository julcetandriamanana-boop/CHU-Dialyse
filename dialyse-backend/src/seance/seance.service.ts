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
    const aujourd = new Date();
    aujourd.setHours(0, 0, 0, 0);
    const demain = new Date(aujourd);
    demain.setDate(demain.getDate() + 1);
    const existing = await this.repo.count({ where: { date_debut: require('typeorm').Between(aujourd, demain) } });
    if (existing > 0) return { message: `${existing} séances existent déjà aujourd'hui` };

    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    const seances = [
      { patient: { id: 1 }, date_debut: new Date(y,m,d,7,30), date_fin: new Date(y,m,d,11,30), poids_pre: 72.5, poids_post: 70.1, observations: 'Séance normale' },
      { patient: { id: 2 }, date_debut: new Date(y,m,d,7,30), date_fin: new Date(y,m,d,11,30), poids_pre: 85.0, poids_post: 82.3, observations: 'Légère hypotension' },
      { patient: { id: 3 }, date_debut: new Date(y,m,d,8,0),  date_fin: new Date(y,m,d,12,0),  poids_pre: 68.0, poids_post: 66.5, observations: 'RAS' },
      { patient: { id: 4 }, date_debut: new Date(y,m,d,13,0), date_fin: new Date(y,m,d,17,0), poids_pre: 90.0, poids_post: 87.5, observations: 'Surveillance renforcée' },
    ];
    for (const s of seances) await this.repo.save(this.repo.create(s));
    return { message: `${seances.length} séances créées pour aujourd'hui` };
  }
}
