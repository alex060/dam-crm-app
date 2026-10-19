import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global (RBAC y Clientes)
  public currentUser = signal<User | null>({
    id: 'usr-admin-demo-uuid',
    app_metadata: {},
    user_metadata: { role: 'admin' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as unknown as User);

  public userRole = signal<'admin' | 'user' | null>('admin');

  public clients = signal<Client[]>([
    {
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      nombre: 'Carlos Mendoza',
      empresa: 'InnovaTech Soluciones',
      email: 'carlos.mendoza@innovatech.es',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'a1b2c3d4-0002-4000-8000-000000000002',
      nombre: 'Lucía Fernández',
      empresa: 'CloudDynamics SL',
      email: 'l.fernandez@clouddynamics.com',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'a1b2c3d4-0003-4000-8000-000000000003',
      nombre: 'Marcos Rivas',
      empresa: 'Sistemas Madrid S.A.',
      email: 'marcos.rivas@sistemasmadrid.com',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ]);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
  }

  // --- AUTENTICACIÓN Y ROLES ---
  private async initSession() {
    if (environment.supabaseUrl.includes('dam-crm-demo') || environment.supabaseUrl.includes('TU-PROYECTO')) {
      return;
    }
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        this.currentUser.set(session.user);
        await this.loadRole(session.user.id);
      }
    } catch (e) {
      console.warn('Modo demo local activado para Supabase Auth:', e);
    }
  }

  async login(email: string, password: string) {
    if (environment.supabaseUrl.includes('dam-crm-demo') || environment.supabaseUrl.includes('TU-PROYECTO')) {
      const role: 'admin' | 'user' = email.includes('admin') ? 'admin' : 'user';
      this.userRole.set(role);
      this.currentUser.set({ id: 'demo-user-id', email } as unknown as User);
      return;
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        this.currentUser.set(data.user);
        await this.loadRole(data.user.id);
      }
    } catch {
      const role: 'admin' | 'user' = email.includes('admin') ? 'admin' : 'user';
      this.userRole.set(role);
      this.currentUser.set({ id: 'demo-user-id', email } as unknown as User);
    }
  }

  private async loadRole(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (!error && data) {
        this.userRole.set(data.role);
      }
    } catch {
      // Mantiene el rol actual si no conecta
    }
  }

  public switchRole(role: 'admin' | 'user') {
    this.userRole.set(role);
  }

  // --- CRUD CLIENTES ---
  async getClients(): Promise<Client[]> {
    if (environment.supabaseUrl.includes('dam-crm-demo') || environment.supabaseUrl.includes('TU-PROYECTO')) {
      return this.clients();
    }

    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.clients.set(data);
        return data;
      }
      return this.clients();
    } catch {
      return this.clients();
    }
  }

  async createClient(client: Client): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden insertar.');
    }

    const newClient: Client = {
      ...client,
      id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now(),
      created_at: new Date().toISOString()
    };

    if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
      try {
        await this.supabase.from('clients').insert([{
          nombre: client.nombre,
          empresa: client.empresa,
          email: client.email
        }]);
      } catch (e) {
        console.warn('Supabase remote sync warning:', e);
      }
    }

    this.clients.update(prev => [newClient, ...prev]);
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden modificar.');
    }

    if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
      try {
        await this.supabase.from('clients').update(client).eq('id', id);
      } catch (e) {
        console.warn('Supabase remote sync warning:', e);
      }
    }

    this.clients.update(prev => prev.map(c => c.id === id ? { ...c, ...client } : c));
  }

  async deleteClient(id: string): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden eliminar.');
    }

    if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
      try {
        await this.supabase.from('clients').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase remote sync warning:', e);
      }
    }

    this.clients.update(prev => prev.filter(c => c.id !== id));
  }
}
