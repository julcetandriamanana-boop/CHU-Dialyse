import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionService } from './prescription.service';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionStatusHistory } from '../entities/prescription-history.entity';

describe('PrescriptionService', () => {
  let service: PrescriptionService;
  let repo: Repository<Prescription>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
  };

  const mockHistoryRepo = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        { provide: getRepositoryToken(Prescription), useValue: mockRepo },
        { provide: getRepositoryToken(PrescriptionStatusHistory), useValue: mockHistoryRepo },
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
    repo = module.get<Repository<Prescription>>(getRepositoryToken(Prescription));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findEnAttente', () => {
    it('should return prescriptions with status brouillon or actif', async () => {
      const mockData = [
        { id: 1, workflow_statut: 'actif' },
        { id: 2, workflow_statut: 'brouillon' },
      ];
      mockRepo.find.mockResolvedValue(mockData);

      const result = await service.findEnAttente();
      expect(result).toEqual(mockData);
      expect(mockRepo.find).toHaveBeenCalled();
    });

    it('should filter by specific status', async () => {
      const mockData = [{ id: 1, workflow_statut: 'actif' }];
      mockRepo.find.mockResolvedValue(mockData);

      const result = await service.findEnAttente('actif');
      expect(result).toEqual(mockData);
    });
  });

  describe('valider', () => {
    it('should update prescription status and create history', async () => {
      const prescription = { id: 3, workflow_statut: 'brouillon' };
      mockRepo.findOne.mockResolvedValue(prescription);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockHistoryRepo.save.mockResolvedValue({});

      const result = await service.valider(3, 1);
      expect(result.success).toBe(true);
      expect(result.ancien_status).toBe('brouillon');
      expect(result.nouveau_status).toBe('terminé');
      expect(mockHistoryRepo.save).toHaveBeenCalled();
    });

    it('should return error if prescription not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.valider(999, 1);
      expect(result.error).toBe('Prescription non trouvée');
    });
  });
});
