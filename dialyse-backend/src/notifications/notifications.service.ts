import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

const MY_SERVICE_ID = process.env.DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';
const MY_CHU_ID     = process.env.DIALYSE_CHU_ID     || '1e5bbbb7-fa10-4d59-8848-2d0ce96a9394';

// Types acceptés par le service externe
const VALID_EXTERNAL_TYPES = [
  'ARRIVEE_PATIENT',
  'RENDEZ_VOUS',
  'AVIS_INTER_SERVICE',
  'ORDONNANCE',
  'STOCK_CRITIQUE',
  'MEDICAMENT_PATIENT',
  'DEMANDE_EXAMEN',
  'RESULTAT_EXAMEN',
  'TRANSFUSION',
  'TRANSFERT',
  'SORTIE_PATIENT',
  'CPA_DEMANDE',
  'VPA_RAPPEL',
  'BLOC_PROGRAMME',
  'COMMANDE_SANG',
];

// Mapping types métier internes -> types externes valides
const TYPE_MAPPING: Record<string, string> = {
  SEANCE_TERMINEE: 'ORDONNANCE',
  SEANCE_DIALYSE: 'ORDONNANCE',
  KIT_VALIDE: 'ORDONNANCE',
  PRESCRIPTION: 'ORDONNANCE',
  MEDICAL_ALERT: 'AVIS_INTER_SERVICE',
  DEMANDE_AVIS: 'AVIS_INTER_SERVICE',
  RDV_CONFIRMED: 'RENDEZ_VOUS',
  RDV_RAPPEL: 'RENDEZ_VOUS',
  MAINTENANCE: 'STOCK_CRITIQUE',
  RUPTURE_STOCK: 'STOCK_CRITIQUE',
  ARRIVEE: 'ARRIVEE_PATIENT',
  TRANSFERT_PATIENT: 'TRANSFERT',
  BILAN_DISPONIBLE: 'RESULTAT_EXAMEN',
  EXAMEN: 'DEMANDE_EXAMEN',
  MEDICAMENT: 'MEDICAMENT_PATIENT',
  ORDONNANCE: 'ORDONNANCE',
  RENDEZ_VOUS: 'RENDEZ_VOUS',
  AVIS_INTER_SERVICE: 'AVIS_INTER_SERVICE',
  STOCK_CRITIQUE: 'STOCK_CRITIQUE',
  DEMANDE_EXAMEN: 'DEMANDE_EXAMEN',
  RESULTAT_EXAMEN: 'RESULTAT_EXAMEN',
  TRANSFUSION: 'TRANSFUSION',
  TRANSFERT: 'TRANSFERT',
  SORTIE_PATIENT: 'SORTIE_PATIENT',
  CPA_DEMANDE: 'CPA_DEMANDE',
  VPA_RAPPEL: 'VPA_RAPPEL',
  BLOC_PROGRAMME: 'BLOC_PROGRAMME',
  COMMANDE_SANG: 'COMMANDE_SANG',
  ARRIVEE_PATIENT: 'ARRIVEE_PATIENT',
  MEDICAMENT_PATIENT: 'MEDICAMENT_PATIENT',
};

function resolveExternalType(type: string): string {
  const upper = (type || '').trim().toUpperCase();
  return TYPE_MAPPING[upper] || 'AVIS_INTER_SERVICE';
}

function urgenceToType(urgence: number): string {
  if (urgence >= 5) return 'error';
  if (urgence >= 3) return 'warning';
  if (urgence >= 2) return 'info';
  return 'success';
}

function typeToIcon(type: string): string {
  const map: Record<string, string> = {
    MEDICAL_ALERT: 'emergency',
    AVIS_INTER_SERVICE: 'forum',
    RENDEZ_VOUS: 'event_available',
    ORDONNANCE: 'prescriptions',
    STOCK_CRITIQUE: 'warning',
    RESULTAT_EXAMEN: 'biotech',
    DEMANDE_EXAMEN: 'science',
    ARRIVEE_PATIENT: 'person_add',
    TRANSFUSION: 'bloodtype',
    TRANSFERT: 'transfer_within_a_station',
    SORTIE_PATIENT: 'logout',
    MEDICAMENT_PATIENT: 'medication',
    CPA_DEMANDE: 'assignment',
    VPA_RAPPEL: 'alarm',
    BLOC_PROGRAMME: 'calendar_today',
    COMMANDE_SANG: 'water_drop',
  };
  return map[type?.toUpperCase()] || 'notifications';
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.repo.find({ order: { created_at: 'DESC' }, take: 50 });
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

  async create(data: Partial<Notification>): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }

  async markAsRead(id: number): Promise<void> {
    await this.repo.update(id, { is_read: true, read_at: new Date() });
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

  async receiveFromExternalService(payload: any): Promise<Notification | null> {
    const {
      type, motif, urgence, sourceServiceId, sourceServiceName,
      targetServiceId, emitterName, patientId, sentAt,
      entiteRefType, entiteRefId, ringtone, channels,
      payload: extraPayload,
    } = payload;

    if (targetServiceId && targetServiceId !== MY_SERVICE_ID) {
      console.log(`🚫 Notification ignorée — targetServiceId: ${targetServiceId}`);
      return null;
    }

    const externalId = payload.id || payload.notificationId || null;
    if (externalId) {
      const existing = await this.repo.findOne({ where: { external_id: externalId } });
      if (existing) return existing;
    }

    const urgenceNum = parseInt(urgence) || 1;

    const notif = this.repo.create({
      title: `${type || 'Notification'} — ${sourceServiceName || sourceServiceId || 'Externe'}`,
      message: motif,
      type: urgenceToType(urgenceNum),
      category: type?.toLowerCase() || 'externe',
      icon: typeToIcon(type),
      link: '/notifications',
      is_read: false,
      source: 'externe',
      external_id: externalId,
      source_service_id: sourceServiceId,
      source_service_name: sourceServiceName,
      target_service_id: MY_SERVICE_ID,
      chu_id: MY_CHU_ID,
      urgence: urgenceNum,
      emitter_name: emitterName,
      patient_ref_id: patientId,
      payload: extraPayload,
      channels: channels || ['WEB'],
      ringtone: ringtone || 'ping',
      sent_at: sentAt ? new Date(sentAt) : new Date(),
      entite_ref_type: entiteRefType,
      entite_ref_id: entiteRefId,
    });

    const saved = await this.repo.save(notif);
    console.log(`✅ Notification externe reçue : ID ${saved.id}`);
    return saved;
  }

  async sendToExternalService(data: {
    motif: string;
    type: string;
    targetServiceId: string;
    targetServiceName?: string;
    urgence?: number;
    patientId?: string;
    emitterName?: string;
  }): Promise<any> {
    const resolvedType = resolveExternalType(data.type);

    const bodyToSend: any = {
      type: resolvedType,
      motif: data.motif,
      urgence: data.urgence || 1,
      sourceServiceId: MY_SERVICE_ID,
      sourceServiceName: 'Dialyse CHU Andrainjato',
      targetServiceId: data.targetServiceId,
      targetServiceName: data.targetServiceName || '',
      emitterId: MY_SERVICE_ID,
      emitterName: data.emitterName || 'Service Dialyse',
      sentAt: new Date().toISOString(),
      channels: ['WEB', 'SOUND'],
    };

    if (data.patientId) {
      bodyToSend.patientId = data.patientId;
    }

    console.log('📤 Envoi vers service externe :', bodyToSend);

    try {
      const res = await fetch('https://service-notification.onrender.com/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      const rawText = await res.text();

      let parsed: any = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsed = { raw: rawText };
      }

      console.log('📥 Réponse service externe :', {
        status: res.status,
        ok: res.ok,
        body: parsed,
      });

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          typeOriginal: data.type,
          typeEnvoye: resolvedType,
          error: parsed?.message || 'Erreur service externe',
          response: parsed,
        };
      }

      return {
        success: true,
        status: res.status,
        typeOriginal: data.type,
        typeEnvoye: resolvedType,
        response: parsed,
      };
    } catch (err: any) {
      console.error('❌ Erreur envoi externe:', err);
      return {
        success: false,
        typeOriginal: data.type,
        typeEnvoye: resolvedType,
        error: err?.message || 'Erreur réseau',
      };
    }
  }

  async pollExternalNotifications(): Promise<number> {
    try {
      const res = await fetch(
        'https://service-notification.onrender.com/notifications?status=unread',
      );
      if (!res.ok) return 0;

      const data = await res.json();
      const notifs = Array.isArray(data) ? data : (data.data || data.notifications || []);

      let count = 0;
      for (const n of notifs) {
        if (n.targetServiceId && n.targetServiceId !== MY_SERVICE_ID) continue;
        const saved = await this.receiveFromExternalService(n);
        if (saved?.id) count++;
      }
      return count;
    } catch {
      return 0;
    }
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} notifications existent déjà` };

    const notifs = [
      { title: 'Alerte Médicale', message: 'Patient en détresse — Rakoto Jean', type: 'error', category: 'avis_inter_service', link: '/notifications', icon: 'emergency', urgence: 5, source: 'externe' },
      { title: 'Prescription validée', message: 'Héparine 5000 UI pour Marcus Jensen', type: 'success', category: 'ordonnance', link: '/dialyses/prescriptions-validees', icon: 'check_circle', urgence: 2, source: 'interne' },
      { title: 'RDV confirmé', message: 'RDV le 12 Mai pour Elena Ross', type: 'info', category: 'rendez_vous', link: '/rendez-vous', icon: 'event', urgence: 1, source: 'interne' },
      { title: 'Stock critique', message: '3 machines à désinfecter', type: 'warning', category: 'stock_critique', link: '/dashboard', icon: 'build', urgence: 3, source: 'externe' },
      { title: 'Demande d’avis', message: 'Demande STAT — Neurologie', type: 'warning', category: 'avis_inter_service', link: '/demandes-avis', icon: 'forum', urgence: 4, source: 'externe' },
    ];

    for (const n of notifs) {
      await this.repo.save(this.repo.create({
        ...n,
        is_read: Math.random() > 0.5,
        target_service_id: MY_SERVICE_ID,
        chu_id: MY_CHU_ID,
      }));
    }
    return { message: '5 notifications créées' };
  }
}
