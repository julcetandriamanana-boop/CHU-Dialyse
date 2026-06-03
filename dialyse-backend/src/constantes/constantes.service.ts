import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstantesSeance } from '../entities/constantes-seance.entity';

@Injectable()
export class ConstantesService {
  constructor(
    @InjectRepository(ConstantesSeance)
    private repo: Repository<ConstantesSeance>,
  ) {}

  async findByRendezVous(rendezVousId: number): Promise<ConstantesSeance | null> {
    return this.repo.findOne({
      where: { rendez_vous_id: rendezVousId },
      relations: ['patient', 'rendez_vous'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<ConstantesSeance> {
    const c = await this.repo.findOne({ where: { id }, relations: ['patient'] });
    if (!c) throw new NotFoundException(`Constantes #${id} introuvable`);
    return c;
  }

  async create(data: any): Promise<ConstantesSeance> {
    const entity = this.repo.create({
      rendez_vous_id: data.rendez_vous_id,
      patient_id:     data.patient_id,
      poids_avant:    data.poids_avant,
      ta_avant:       data.ta_avant,
      fc_avant:       data.fc_avant,
      temp_avant:     data.temp_avant,
      o2_avant:       data.o2_avant,
      poids_apres:    data.poids_apres,
      ta_apres:       data.ta_apres,
      fc_apres:       data.fc_apres,
      temp_apres:     data.temp_apres,
      o2_apres:       data.o2_apres,
      heparine:       data.heparine,
      hbpm:           data.hbpm,
      dc:             data.dc,
      de:             data.de,
      kt_artere:      data.kt_artere,
      kt_veine:       data.kt_veine,
      infirmier_nom:  data.infirmier_nom,
    });
    return this.repo.save(entity);
  }

  async update(id: number, data: any): Promise<ConstantesSeance> {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async upsertByRendezVous(rendezVousId: number, data: any): Promise<ConstantesSeance> {
    const existing = await this.findByRendezVous(rendezVousId);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create({ ...data, rendez_vous_id: rendezVousId });
  }
}
