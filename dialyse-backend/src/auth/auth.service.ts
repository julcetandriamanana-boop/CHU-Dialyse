import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email, actif: true } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      nom: user.nom,
      prenom: user.prenom 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    };
  }

  async register(data: { email: string; password: string; nom: string; prenom: string; role?: string }) {
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) throw new UnauthorizedException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: (data.role as UserRole) || UserRole.SECRETAIRE,
    });
    await this.userRepository.save(user);

    const { password: _, ...result } = user;
    return this.login(result);
  }

  async seedAdmin() {
    const adminExists = await this.userRepository.findOne({ where: { email: 'admin@chu.mg' } });
    if (adminExists) return { message: 'Admin déjà existant' };

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = this.userRepository.create({
      email: 'admin@chu.mg',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'CHU',
      role: UserRole.ADMIN,
      matricule: 'ADM-001',
    });
    await this.userRepository.save(admin);

    // Créer aussi des utilisateurs de test
    const users = [
      { email: 'medecin@chu.mg', password: 'medecin123', nom: 'Andrianjato', prenom: 'Paul', role: UserRole.MEDECIN, matricule: 'MED-001' },
      { email: 'infirmier@chu.mg', password: 'infirmier123', nom: 'Rasoa', prenom: 'Marie', role: UserRole.INFIRMIER, matricule: 'INF-001' },
      { email: 'secretaire@chu.mg', password: 'secretaire123', nom: 'Rakoto', prenom: 'Jean', role: UserRole.SECRETAIRE, matricule: 'SEC-001' },
    ];

    for (const u of users) {
      const exists = await this.userRepository.findOne({ where: { email: u.email } });
      if (!exists) {
        await this.userRepository.save(this.userRepository.create({ ...u, password: await bcrypt.hash(u.password, 10) }));
      }
    }

    return { message: 'Utilisateurs créés : admin, medecin, infirmier, secretaire' };
  }
}
