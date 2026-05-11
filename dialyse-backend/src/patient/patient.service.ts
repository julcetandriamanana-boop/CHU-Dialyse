import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient) // Injection du repository pour l'entité Patient
    private patientRepository: Repository<Patient>,
  ) {}

  // Méthode pour obtenir tous les patients
  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  // Méthode pour créer un nouveau patient
  async create(patient: Partial<Patient>): Promise<Patient> {
    const newPatient = this.patientRepository.create(patient);
    return this.patientRepository.save(newPatient);
  }

  // Méthode pour tester la connexion à la base de données
  async testConnection(): Promise<string> {
    try {
      // Essayer de compter les patients pour vérifier la connexion
      const count = await this.patientRepository.count();
      return `Connexion réussie à la base de données. Nombre de patients : ${count}`;
    } catch (error) {
      return `Erreur de connexion : ${error.message}`;
    }
  }
}