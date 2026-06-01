import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

const MY_SERVICE_ID = process.env.DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';
const MY_CHU_ID     = process.env.DIALYSE_CHU_ID     || '1e5bbbb7-fa10-4d59-8848-2d0ce96a9394';

// Mapping urgence → type interne
function urgenceToType(urgence: number): string {
  if (urgence >= 5) return 'error';
  if (urgence >= 3) return 'warning';
  if (urgence >= 2) return 'info';
  return 'success';
}

// Mapping type externe → icône
function typeToIcon(type: string): string {
  const map: Record<string, string> = {
    MEDICAL_ALERT:    'emergency',
    RDV_CONFIRMED:    'event_available',
    PRESCRIPTION:     'prescriptions',
    SEANCE:           'medical_services',
    MAINTENANCE:      'build',
    SYSTEME:          'settings',
    DEMANDE_AVIS:     'forum',
  };
  return map[type?.toUpperCase()] || 'notifications';
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  // ── Lecture ────────────────────────────────────
  async findAll(): Promise<Notification[]> {
    return this.repo.find({
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async findUnread(): Promise<Notification[]> {
    return this.repo.find({
      where: { is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async getUnreadCount(): Promise<number> {
    return this.repo.count({ where: { is_read: false } });
  }

  async findById(id: number): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ── Écriture ───────────────────────────────────
  async create(data: Partial<Notification>): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }

  async markAsRead(id: number): Promise<void> {
    await this.repo.update(id, {
      is_read: true,
      read_at: new Date(),
    });
  }

  async markAllAsRead(): Promise<void> {
    await this.repo.update(
      { is_read: false },
      { is_read: true, read_at: new Date() },
    );
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Webhook : réception depuis service externe ──
  async receiveFromExternalService(payload: any): Promise<Notification | null> {
    const {
      type, motif, urgence, sourceServiceId, sourceServiceName,
      targetServiceId, emitterName, patientId, sentAt,
      entiteRefType, entiteRefId, ringtone, channels,
      payload: extraPayload,
    } = payload;

    // ✅ Filtrage strict : ignorer si pas pour notre service
    if (targetServiceId && targetServiceId !== MY_SERVICE_ID) {
      console.log(`🚫 Notification ignorée — targetServiceId: ${targetServiceId} ≠ ${MY_SERVICE_ID}`);
      return null;
    }

    // Eviter les doublons si external_id fourni
    const externalId = payload.id || payload.notificationId || null;
    if (externalId) {
      const existing = await this.repo.findOne({ where: { external_id: externalId } });
      if (existing) {
        console.log(`⚠️ Notification déjà reçue : ${externalId}`);
        return existing;
      }
    }

    const urgenceNum = parseInt(urgence) || 1;

    const notif = this.repo.create({
      // Champs internes
      title:    `${type || 'Notification'} — ${sourceServiceName || sourceServiceId || 'Externe'}`,
      message:  motif,
      type:     urgenceToType(urgenceNum),
      category: type?.toLowerCase() || 'externe',
      icon:     typeToIcon(type),
      link:     entiteRefType ? `/notifications` : '/notifications',
      is_read:  false,
      source:   'externe',

      // Champs externes
      external_id:       externalId,
      source_service_id: sourceServiceId,
      source_service_name: sourceServiceName,
      target_service_id: MY_SERVICE_ID,
      chu_id:            MY_CHU_ID,
      urgence:           urgenceNum,
      emitter_name:      emitterName,
      patient_ref_id:    patientId,
      payload:           extraPayload,
      channels:          channels || ['WEB'],
      ringtone:          ringtone || 'ping',
      sent_at:           sentAt ? new Date(sentAt) : new Date(),
      entite_ref_type:   entiteRefType,
      entite_ref_id:     entiteRefId,
    });

    const saved = await this.repo.save(notif);
    console.log(`✅ Notification externe reçue et sauvegardée : ID ${saved.id}`);
    return saved;
  }

  // ── Envoyer vers le service externe ────────────
  async sendToExternalService(data: {
    motif: string;
    type: string;
    targetServiceId: string;
    targetServiceName?: string;
    urgence?: number;
    patientId?: string;
    emitterName?: string;
  }): Promise<any> {
    try {
      const res = await fetch('https://service-notification.onrender.com/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:              data.type,
          motif:             data.motif,
          urgence:           data.urgence || 1,
          sourceServiceId:   MY_SERVICE_ID,
          sourceServiceName: 'Dialyse CHU Andrainjato',
          targetServiceId:   data.targetServiceId,
          targetServiceName: data.targetServiceName || '',
          emitterId:         MY_SERVICE_ID,
          emitterName:       data.emitterName || 'Service Dialyse',
          patientId:         data.patientId,
          sentAt:            new Date().toISOString(),
          channels:          ['WEB', 'SOUND'],
        }),
      });
      return res.json();
    } catch (err) {
      console.error('❌ Erreur envoi externe:', err);
      throw err;
    }
  }

  // ── Polling depuis le service externe ──────────
  async pollExternalNotifications(): Promise<number> {
    try {
      const res = await fetch(
        `https://service-notification.onrender.com/notifications?status=unread`,
      );
      if (!res.ok) return 0;

      const data = await res.json();
      const notifs = Array.isArray(data) ? data : (data.data || data.notifications || []);

      let count = 0;
      for (const n of notifs) {
        // Filtrer celles qui nous sont destinées
        if (n.targetServiceId && n.targetServiceId !== MY_SERVICE_ID) continue;
        const saved = await this.receiveFromExternalService(n);
        if (saved && saved.id) count++;
      }
      return count;
    } catch (err) {
      console.error('❌ Erreur polling externe:', err);
      return 0;
    }
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} notifications existent déjà` };

    const notifs = [
      { title: "Alerte Médicale", message: "Patient en détresse — Rakoto Jean", type: 'error', category: 'medical_alert', link: '/notifications', icon: 'emergency', urgence: 5, source: 'externe' },
      { title: "Prescription validée", message: "Héparine 5000 UI validée pour Marcus Jensen", type: 'success', category: 'prescription', link: '/dialyses/prescriptions-validees', icon: 'check_circle', urgence: 2, source: 'interne' },
      { title: "RDV confirmé", message: "RDV le 12 Mai pour Elena Ross", type: 'info', category: 'rdv', link: '/rendez-vous', icon: 'event', urgence: 1, source: 'interne' },
      { title: "Maintenance requise", message: "3 machines à désinfecter dans 2h", type: 'warning', category: 'maintenance', link: '/dashboard', icon: 'build', urgence: 3, source: 'externe' },
      { title: "Demande d'avis reçue", message: "Demande STAT — Neurologie", type: 'warning', category: 'demande_avis', link: '/demandes-avis', icon: 'forum', urgence: 4, source: 'externe' },
    ];

    for (const n of notifs) {
      await this.repo.save(this.repo.create({
        ...n,
        is_read:          Math.random() > 0.5,
        target_service_id: MY_SERVICE_ID,
        chu_id:            MY_CHU_ID,
      }));
    }
    return { message: '5 notifications créées' };
  }
}
