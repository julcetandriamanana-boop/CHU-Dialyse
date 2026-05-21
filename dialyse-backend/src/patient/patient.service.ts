import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async create(patient: Partial<Patient>): Promise<Patient> {
    return this.patientRepository.save(this.patientRepository.create(patient));
  }

  async testConnection(): Promise<string> {
    try {
      const count = await this.patientRepository.count();
      return `Connexion réussie. ${count} patients`;
    } catch (error) {
      return `Erreur : ${error.message}`;
    }
  }

  async seed(): Promise<any> {
    const count = await this.patientRepository.count();
    if (count > 0) {
      return { message: `${count} patients existent déjà`, count };
    }

    const patients = [
      { nom: 'Ross', prenom: 'Elena', dateNaissance: new Date('1968-03-15'), telephone: '0341234567' },
      { nom: 'Jensen', prenom: 'Marcus', dateNaissance: new Date('1981-07-22'), telephone: '0349876543' },
      { nom: 'Bernard', prenom: 'Hélène', dateNaissance: new Date('1984-11-03'), telephone: '0334567890' },
    ];

    for (const p of patients) {
      await this.patientRepository.save(this.patientRepository.create(p));
    }

    return { message: '3 patients créés', count: 3 };
  }
}
