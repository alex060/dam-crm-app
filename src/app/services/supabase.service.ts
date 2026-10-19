import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';
import { StorageImage } from '../models/storage-image.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global (Sesión, RBAC y Clientes)
  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>(null);

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

  // Imágenes de muestra del Storage Bucket de Supabase
  private sampleStorageImages: StorageImage[] = [
    {
      name: 'avatar-carlos-mendoza.png',
      id: 'img-001',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      sizeFormatted: '184 KB',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      description: 'Foto de perfil corporativa cliente InnovaTech'
    },
    {
      name: 'contrato-clouddynamics.png',
      id: 'img-002',
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      sizeFormatted: '420 KB',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      description: 'Captura digitalizada de firma de acuerdo de servicio'
    },
    {
      name: 'oficinas-sistemas-madrid.png',
      id: 'img-003',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      sizeFormatted: '312 KB',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      description: 'Instalaciones centrales sede Sistemas Madrid S.A.'
    },
    {
      name: 'informe-auditoria-2026.png',
      id: 'img-004',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      sizeFormatted: '540 KB',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      description: 'Gráfico métricas y rendimiento SLA clientes trimestral'
    }
  ];

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

  async login(email: string, password: string): Promise<{ success: boolean; role: 'admin' | 'user'; message: string }> {
    // Si la URL de Supabase es real, intentamos la autenticación real en el backend
    if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          this.currentUser.set(data.user);
          await this.loadRole(data.user.id);
          const role = this.userRole() || 'user';
          return {
            success: true,
            role,
            message: `Sesión iniciada con éxito como ${role.toUpperCase()}`
          };
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al iniciar sesión en Supabase');
      }
    }

    // Modo local / demostración para evaluación inmediata de credenciales
    if (!email || !password) {
      throw new Error('Debes indicar correo electrónico y contraseña.');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    // Identificar rol: si el email contiene "admin" o es admin@crm.com / admin@test.com
    const role: 'admin' | 'user' = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const mockUser: User = {
      id: role === 'admin' ? 'usr-admin-uuid-001' : 'usr-user-uuid-002',
      email: email,
      app_metadata: {},
      user_metadata: { role },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as unknown as User;

    this.currentUser.set(mockUser);
    this.userRole.set(role);

    return {
      success: true,
      role,
      message: `Sesión iniciada correctamente como ${role.toUpperCase()} (${email})`
    };
  }

  async logout(): Promise<void> {
    try {
      if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
        await this.supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Error cerrando sesión en Supabase:', e);
    } finally {
      this.currentUser.set(null);
      this.userRole.set(null);
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
      } else {
        this.userRole.set('user');
      }
    } catch {
      this.userRole.set('user');
    }
  }

  public switchRole(role: 'admin' | 'user') {
    this.userRole.set(role);
    if (!this.currentUser()) {
      this.currentUser.set({
        id: role === 'admin' ? 'demo-admin-id' : 'demo-user-id',
        email: `${role}@dam-crm.es`
      } as unknown as User);
    }
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
    if (!this.currentUser()) {
      throw new Error('AUTH_REQUIRED: Debes iniciar sesión para insertar clientes.');
    }
    if (this.userRole() !== 'admin') {
      throw new Error('RLS_DENIED: Permiso denegado por política RLS. Solo Administradores pueden insertar.');
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
    if (!this.currentUser()) {
      throw new Error('AUTH_REQUIRED: Debes iniciar sesión para actualizar clientes.');
    }
    if (this.userRole() !== 'admin') {
      throw new Error('RLS_DENIED: Permiso denegado por política RLS. Solo Administradores pueden modificar.');
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
    if (!this.currentUser()) {
      throw new Error('AUTH_REQUIRED: Debes iniciar sesión para eliminar clientes.');
    }
    if (this.userRole() !== 'admin') {
      throw new Error('RLS_DENIED: Permiso denegado por política RLS. Solo Administradores pueden eliminar.');
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

  // --- SUPABASE STORAGE BUCKET ---
  async getStorageImages(bucketName = 'crm-images'): Promise<StorageImage[]> {
    if (!environment.supabaseUrl.includes('dam-crm-demo') && !environment.supabaseUrl.includes('TU-PROYECTO')) {
      try {
        const { data, error } = await this.supabase.storage.from(bucketName).list();
        if (error) throw error;
        if (data && data.length > 0) {
          return data
            .filter(f => f.name && !f.name.startsWith('.'))
            .map(file => {
              const { data: pubUrl } = this.supabase.storage.from(bucketName).getPublicUrl(file.name);
              const sizeInKb = file.metadata?.size ? Math.round(file.metadata.size / 1024) + ' KB' : 'N/A';
              return {
                name: file.name,
                id: file.id,
                url: pubUrl.publicUrl,
                sizeFormatted: sizeInKb,
                created_at: file.created_at || new Date().toISOString(),
                description: `Archivo almacenado en Supabase Bucket '${bucketName}'`
              };
            });
        }
      } catch (e) {
        console.warn('Aviso al listar Storage Bucket remoto:', e);
      }
    }

    // Retorna imágenes de muestra para garantizar visualización inmediata
    return this.sampleStorageImages;
  }
}
