import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { Patient } from '../entities/patient.entity';

describe('PatientService', () => {
  let service: PatientService;

  const mockRepo = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        { provide: getRepositoryToken(Patient), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all patients', async () => {
    const mockPatients = [{ id: 1, nom: 'Ross', prenom: 'Elena' }];
    mockRepo.find.mockResolvedValue(mockPatients);

    const result = await service.findAll();
    expect(result).toEqual(mockPatients);
  });

  it('should create a patient', async () => {
    const newPatient = { nom: 'Test', prenom: 'Patient' };
    mockRepo.create.mockReturnValue(newPatient);
    mockRepo.save.mockResolvedValue({ id: 1, ...newPatient });

    const result = await service.create(newPatient);
    expect(result.nom).toBe('Test');
  });

  it('should test connection', async () => {
    mockRepo.count.mockResolvedValue(3);
    const result = await service.testConnection();
    expect(result).toContain('Connexion réussie');
    expect(result).toContain('3');
  });
});
