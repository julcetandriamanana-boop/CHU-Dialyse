import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private repo: Repository<Patient>,
  ) {}

  async findAll(search?: string): Promise<Patient[]> {
    if (search) {
      return this.repo.find({
        where: [
          { nom:    Like(`%${search}%`) },
          { prenom: Like(`%${search}%`) },
        ],
        order: { nom: 'ASC' },
        take: 20,
      });
    }
    return this.repo.find({ order: { nom: 'ASC' } });
  }

  async findById(id: number): Promise<Patient> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Patient #${id} introuvable`);
    return p;
  }

  async create(patient: Partial<Patient>): Promise<Patient> {
    return this.repo.save(this.repo.create({
      ...patient,
      traitement_statut: 'actif',
    }));
  }

  // ✅ Clôturer le traitement avec motif
  async cloturerTraitement(
    id: number,
    motif: string,
    notes?: string,
  ): Promise<Patient> {
    const patient = await this.findById(id);

    await this.repo.update(id, {
      traitement_statut:       'terminé',
      traitement_motif_cloture: motif,
      traitement_date_cloture:  new Date(),
      traitement_notes_cloture: notes || null,
    });

    return this.findById(id);
  }

  // ✅ Suspendre le traitement
  async suspendrePTraitement(
    id: number,
    motif: string,
    notes?: string,
  ): Promise<Patient> {
    await this.findById(id);

    await this.repo.update(id, {
      traitement_statut:       'suspendu',
      traitement_motif_cloture: motif,
      traitement_date_cloture:  new Date(),
      traitement_notes_cloture: notes || null,
    });

    return this.findById(id);
  }

  // ✅ Réactiver le traitement
  async reactiverTraitement(id: number): Promise<Patient> {
    await this.findById(id);

    await this.repo.update(id, {
      traitement_statut:       'actif',
      traitement_motif_cloture: null,
      traitement_date_cloture:  null,
      traitement_notes_cloture: null,
    });

    return this.findById(id);
  }

  async testConnection(): Promise<string> {
    try {
      const count = await this.repo.count();
      return `Connexion réussie. ${count} patients`;
    } catch (error) {
      return `Erreur : ${error.message}`;
    }
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} patients existent déjà`, count };

    const patients = [
      { nom: 'Ross',    prenom: 'Elena',   dateNaissance: new Date('1968-03-15'), telephone: '0341234567' },
      { nom: 'Jensen',  prenom: 'Marcus',  dateNaissance: new Date('1981-07-22'), telephone: '0349876543' },
      { nom: 'Bernard', prenom: 'Hélène',  dateNaissance: new Date('1984-11-03'), telephone: '0334567890' },
    ];

    for (const p of patients) {
      await this.repo.save(this.repo.create({ ...p, traitement_statut: 'actif' }));
    }

    return { message: '3 patients créés', count: 3 };
  }
}
