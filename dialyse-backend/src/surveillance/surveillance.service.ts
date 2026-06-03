import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveillanceSeance } from '../entities/surveillance-seance.entity';
import { SurveillanceLigne } from '../entities/surveillance-ligne.entity';

@Injectable()
export class SurveillanceService {
  constructor(
    @InjectRepository(SurveillanceSeance) private repo: Repository<SurveillanceSeance>,
    @InjectRepository(SurveillanceLigne)  private ligneRepo: Repository<SurveillanceLigne>,
  ) {}

  async findByRendezVous(rendezVousId: number): Promise<SurveillanceSeance | null> {
    return this.repo.findOne({
      where: { rendez_vous_id: rendezVousId },
      relations: ['patient', 'lignes'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<SurveillanceSeance> {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['patient', 'lignes'],
    });
    if (!s) throw new NotFoundException(`Surveillance #${id} introuvable`);
    return s;
  }

  async create(data: any): Promise<SurveillanceSeance> {
    const entity = this.repo.create({
      rendez_vous_id:          data.rendez_vous_id,
      patient_id:              data.patient_id,
      orifice_catheter:        data.orifice_catheter,
      kt_v:                    data.kt_v,
      volume_sang_traite:      data.volume_sang_traite,
      delta_vs:                data.delta_vs,
      pru:                     data.pru,
      recirculation:           data.recirculation,
      temps_compression_veine: data.temps_compression_veine,
      piege_bulle:             data.piege_bulle,
      dealeur:                 data.dealeur,
      infirmier_nom:           data.infirmier_nom,
    });
    const saved = await this.repo.save(entity);

    // Créer les lignes si fournies
    if (Array.isArray(data.lignes)) {
      for (let i = 0; i < data.lignes.length; i++) {
        const l = data.lignes[i];
        await this.ligneRepo.save(this.ligneRepo.create({
          surveillance_seance_id: saved.id,
          ordre: i,
          heure:               l.heure,
          ta:                  l.ta,
          pouls:               l.pouls,
          debit_sang:          l.debit_sang,
          pression_veineuse:   l.pression_veineuse,
          pression_arterielle: l.pression_arterielle,
          uf_affiche:          l.uf_affiche,
          uf_obtenue:          l.uf_obtenue,
          ptm:                 l.ptm,
          incidents_cliniques: l.incidents_cliniques,
        }));
      }
    }

    return this.findById(saved.id);
  }

  async update(id: number, data: any): Promise<SurveillanceSeance> {
    await this.findById(id);

    const updateData: any = {
      orifice_catheter:        data.orifice_catheter,
      kt_v:                    data.kt_v,
      volume_sang_traite:      data.volume_sang_traite,
      delta_vs:                data.delta_vs,
      pru:                     data.pru,
      recirculation:           data.recirculation,
      temps_compression_veine: data.temps_compression_veine,
      piege_bulle:             data.piege_bulle,
      dealeur:                 data.dealeur,
      infirmier_nom:           data.infirmier_nom,
    };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    if (Object.keys(updateData).length > 0) {
      await this.repo.update(id, updateData);
    }

    // Remplacer les lignes si fournies
    if (Array.isArray(data.lignes)) {
      await this.ligneRepo.delete({ surveillance_seance_id: id });
      for (let i = 0; i < data.lignes.length; i++) {
        const l = data.lignes[i];
        await this.ligneRepo.save(this.ligneRepo.create({
          surveillance_seance_id: id,
          ordre: i,
          heure:               l.heure,
          ta:                  l.ta,
          pouls:               l.pouls,
          debit_sang:          l.debit_sang,
          pression_veineuse:   l.pression_veineuse,
          pression_arterielle: l.pression_arterielle,
          uf_affiche:          l.uf_affiche,
          uf_obtenue:          l.uf_obtenue,
          ptm:                 l.ptm,
          incidents_cliniques: l.incidents_cliniques,
        }));
      }
    }

    return this.findById(id);
  }

  async upsertByRendezVous(rendezVousId: number, data: any): Promise<SurveillanceSeance> {
    const existing = await this.findByRendezVous(rendezVousId);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create({ ...data, rendez_vous_id: rendezVousId });
  }
}
