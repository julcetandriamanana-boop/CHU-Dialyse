import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';

@Injectable()
export class PrescriptionKitEnvoyeeService {
  constructor(
    @InjectRepository(PrescriptionKitEnvoyee)
    private repo: Repository<PrescriptionKitEnvoyee>,
  ) {}

  async findAll(): Promise<PrescriptionKitEnvoyee[]> {
    return this.repo.find({
      relations: ['patient'],
      order: { date_envoi: 'DESC' },
    });
  }

  async findByPatient(patientId: number): Promise<PrescriptionKitEnvoyee[]> {
    return this.repo.find({
      where: { patient_id: patientId },
      order: { date_envoi: 'DESC' },
    });
  }

  async create(data: Partial<PrescriptionKitEnvoyee>): Promise<PrescriptionKitEnvoyee> {
    // Forcer date_envoi a maintenant (heure locale du serveur)
    return this.repo.save(this.repo.create({
      ...data,
      date_envoi: new Date(),
    }));
  }

  async findByPatientAndKit(patientId: number, kitId: string): Promise<PrescriptionKitEnvoyee | null> {
    return this.repo.findOne({
      where: { patient_id: patientId, kit_id: kitId },
      order: { date_envoi: 'DESC' },
    });
  }

  // Retourne map { patientId: true } pour patients ayant au moins 1 kit envoyé
  async getPatientsAvecKitEnvoye(): Promise<Record<number, { count: number; dernier: Date }>> {
    const all = await this.repo.find({ order: { date_envoi: 'DESC' } });
    const map: Record<number, { count: number; dernier: Date }> = {};
    for (const k of all) {
      if (!map[k.patient_id]) {
        map[k.patient_id] = { count: 1, dernier: k.date_envoi };
      } else {
        map[k.patient_id].count++;
      }
    }
    return map;
  }
}
