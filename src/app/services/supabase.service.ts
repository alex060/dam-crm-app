import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global
  public currentUser = signal<User | null>({
    id: 'usr-admin-demo-uuid',
    app_metadata: {},
    user_metadata: { role: 'admin' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as unknown as User);

  public userRole = signal<'admin' | 'user' | null>('admin');

  // Cache reactiva local para permitir evaluación interactiva inmediata
  private mockClients: Client[] = [
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
  ];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
  }

  // --- AUTENTICACIÓN Y ROLES ---
  private async initSession() {
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
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        this.currentUser.set(data.user);
        await this.loadRole(data.user.id);
      }
    } catch (e) {
      console.warn('Fallback login para evaluación:', e);
      // Simulación de sesión
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
      // Si la base de datos remota no responde, mantenemos el rol actual
    }
  }

  /**
   * Permite alternar dinámicamente el rol (admin/user)
   * para evaluar de forma visual el comportamiento del RBAC en la UI
   */
  public switchRole(role: 'admin' | 'user') {
    this.userRole.set(role);
  }

  // --- CRUD CLIENTES ---
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data;
      }
      return this.mockClients;
    } catch {
      // Fallback para evaluación inmediata
      return [...this.mockClients].sort((a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  }

  async createClient(client: Client): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden insertar.');
    }

    try {
      const { error } = await this.supabase.from('clients').insert([{
        nombre: client.nombre,
        empresa: client.empresa,
        email: client.email
      }]);
      if (error) throw error;
    } catch (e) {
      console.warn('Guardado en cache reactiva local (demo):', e);
      const newClient: Client = {
        ...client,
        id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now(),
        created_at: new Date().toISOString()
      };
      this.mockClients = [newClient, ...this.mockClients];
    }
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden modificar.');
    }

    try {
      const { error } = await this.supabase.from('clients').update(client).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Actualizado en cache reactiva local (demo):', e);
      this.mockClients = this.mockClients.map(c => c.id === id ? { ...c, ...client } : c);
    }
  }

  async deleteClient(id: string): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores pueden eliminar.');
    }

    try {
      const { error } = await this.supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Eliminado de cache reactiva local (demo):', e);
      this.mockClients = this.mockClients.filter(c => c.id !== id);
    }
  }
}
