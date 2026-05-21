import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.repo.find({ order: { created_at: 'DESC' }, take: 50 });
  }

  async getUnreadCount(): Promise<number> {
    return this.repo.count({ where: { is_read: false } });
  }

  async markAsRead(id: number): Promise<void> {
    await this.repo.update(id, { is_read: true });
  }

  async markAllAsRead(): Promise<void> {
    await this.repo.update({ is_read: false }, { is_read: true });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} notifications existent déjà` };

    const notifs = [
      { title: 'Nouvelle demande d\'avis', message: 'Demande STAT reçue pour Elena Ross', type: 'warning', category: 'demande_avis', link: '/demandes-avis', icon: 'emergency' },
      { title: 'Prescription validée', message: 'Héparine 5000 UI validée pour Marcus Jensen', type: 'success', category: 'prescription', link: '/dialyses/prescriptions-validees', icon: 'check_circle' },
      { title: 'Rendez-vous confirmé', message: 'RDV le 12 Mai pour Elena Ross', type: 'info', category: 'rdv', link: '/rendez-vous', icon: 'event' },
      { title: 'Alerte maintenance', message: '3 unités à désinfecter dans 2h', type: 'error', category: 'systeme', link: '/dashboard', icon: 'build' },
      { title: 'Kit prescrit', message: 'Ordonnance Kit validée pour Hélène Bernard', type: 'success', category: 'prescription', link: '/dialyses/prescriptions-validees', icon: 'prescriptions' },
      { title: 'Rappel RDV', message: 'Séance demain pour Marcus Jensen', type: 'info', category: 'rdv', link: '/rendez-vous', icon: 'event_available' },
      { title: 'Nouveau patient', message: 'Dossier créé pour Sophie Martin', type: 'info', category: 'systeme', link: '/dashboard', icon: 'person_add' },
    ];

    for (const n of notifs) {
      await this.repo.save(this.repo.create({ ...n, is_read: Math.random() > 0.5 }));
    }
    return { message: '7 notifications créées' };
  }
}
