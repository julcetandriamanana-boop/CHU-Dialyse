import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoinsSeance } from '../entities/soins-seance.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SoinsService {
  constructor(
    @InjectRepository(SoinsSeance) private repo: Repository<SoinsSeance>,
    private readonly notifService: NotificationsService,
  ) {}

  async findByRendezVous(rendezVousId: number): Promise<SoinsSeance | null> {
    return this.repo.findOne({
      where: { rendez_vous_id: rendezVousId },
      relations: ['patient', 'rendez_vous'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<SoinsSeance> {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['patient', 'rendez_vous'],
    });
    if (!s) throw new NotFoundException(`Soins #${id} introuvable`);
    return s;
  }

  async create(data: any): Promise<SoinsSeance> {
    const entity = this.repo.create({
      rendez_vous_id:               data.rendez_vous_id,
      patient_id:                   data.patient_id,
      acces_type:                   data.acces_type,
      acces_fistule:                data.acces_fistule,
      acces_thrill_bruit:           data.acces_thrill_bruit,
      acces_rougeur:                data.acces_rougeur,
      acces_douleur:                data.acces_douleur,
      acces_debit_sanguin:          data.acces_debit_sanguin,
      acces_observation:            data.acces_observation,
      ponction_antiseptique:        data.ponction_antiseptique,
      ponction_rougeur:             data.ponction_rougeur,
      ponction_saignement:          data.ponction_saignement,
      ponction_douleur:             data.ponction_douleur,
      ponction_site:                data.ponction_site,
      ponction_observation:         data.ponction_observation,
      pansement_heure_retrait:      data.pansement_heure_retrait,
      pansement_compression:        data.pansement_compression,
      pansement_hemostase:          data.pansement_hemostase,
      pansement_saignement_arrete:  data.pansement_saignement_arrete,
      pansement_type:               data.pansement_type,
      pansement_observation:        data.pansement_observation,
      validation_infirmier:         data.validation_infirmier ?? false,
      validation_medecin:           data.validation_medecin ?? false,
      infirmier_nom:                data.infirmier_nom,
    });
    return this.repo.save(entity);
  }

  async update(id: number, data: any): Promise<SoinsSeance> {
    await this.findById(id);
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async upsertByRendezVous(rendezVousId: number, data: any): Promise<SoinsSeance> {
    const existing = await this.findByRendezVous(rendezVousId);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create({ ...data, rendez_vous_id: rendezVousId });
  }

  // ✅ Validation finale + notification médecin
  async validerSoins(id: number, infirmierNom?: string): Promise<SoinsSeance> {
    const soins = await this.findById(id);

    await this.repo.update(id, {
      validation_infirmier: true,
      validation_date: new Date(),
      infirmier_nom: infirmierNom || soins.infirmier_nom,
    });

    const updated = await this.findById(id);

    // ✅ Notification au médecin
    try {
      await this.notifService.create({
        title: 'Soins infirmiers validés',
        message: `Soins validés pour ${updated.patient?.prenom || ''} ${updated.patient?.nom || ''} — RDV #${updated.rendez_vous_id}. Validation médecin requise.`,
        type: 'info',
        category: 'soins',
        icon: 'medical_services',
        link: `/dialyses/soins?patientId=${updated.patient_id}&rendezVousId=${updated.rendez_vous_id}`,
        urgence: 3,
        source: 'interne',
      });
    } catch (e) {
      console.error('Erreur notification médecin:', e);
    }

    return updated;
  }

  async validerMedecin(id: number): Promise<SoinsSeance> {
    await this.findById(id);
    await this.repo.update(id, {
      validation_medecin: true,
    });
    return this.findById(id);
  }
}
