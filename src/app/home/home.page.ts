import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Client } from '../models/client.model';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton,
  IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
  IonBadge, IonButtons, IonSegment, IonSegmentButton, IonNote, IonModal, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  shieldCheckmarkOutline,
  personOutline,
  businessOutline,
  mailOutline,
  refreshOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  lockClosedOutline,
  logInOutline,
  logOutOutline,
  imagesOutline,
  keyOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonButton,
    IonInput,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToast,
    IonBadge,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonNote,
    IonModal,
    IonSpinner
  ],
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  clients = this.supabaseService.clients;
  clientForm: FormGroup;
  editingClientId: string | null = null;
  toastMessage = '';
  isToastOpen = false;

  // Señales de Sesión y Rol (RBAC)
  currentUser = this.supabaseService.currentUser;
  isAdmin = this.supabaseService.userRole;

  // Estado del Modal de Login solicitado por requerimiento
  isLoginModalOpen = false;
  loginReason = 'gestionar registros en Supabase';
  loginEmail = 'admin@dam-crm.es';
  loginPassword = '';
  loginError = '';
  isLoggingIn = false;

  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      shieldCheckmarkOutline,
      personOutline,
      businessOutline,
      mailOutline,
      refreshOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      lockClosedOutline,
      logInOutline,
      logOutOutline,
      imagesOutline,
      keyOutline,
      alertCircleOutline
    });

    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      empresa: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      await this.supabaseService.getClients();
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  // --- CONTROL DE ACCESO (LOGIN REQUERIDO PARA CUD) ---
  openLoginModal(actionReason = 'realizar esta operación en Supabase') {
    this.loginReason = actionReason;
    this.loginError = '';
    this.isLoginModalOpen = true;
  }

  closeLoginModal() {
    this.isLoginModalOpen = false;
    this.loginError = '';
  }

  async executeLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Por favor, ingresa el correo y la contraseña de Supabase.';
      return;
    }

    this.isLoggingIn = true;
    this.loginError = '';

    try {
      const result = await this.supabaseService.login(this.loginEmail, this.loginPassword);
      this.isLoginModalOpen = false;
      this.showToast(result.message);
    } catch (err: any) {
      this.loginError = err.message || 'Error de credenciales en Supabase Auth.';
    } finally {
      this.isLoggingIn = false;
    }
  }

  quickLogin(type: 'admin' | 'user') {
    if (type === 'admin') {
      this.loginEmail = 'admin@dam-crm.es';
      this.loginPassword = 'Password123!';
    } else {
      this.loginEmail = 'usuario@dam-crm.es';
      this.loginPassword = 'Password123!';
    }
    this.executeLogin();
  }

  async logout() {
    await this.supabaseService.logout();
    this.resetForm();
    this.showToast('Sesión cerrada. Inicia sesión para realizar operaciones.');
  }

  // --- OPERACIONES CUD CON VALIDACIÓN DE SESIÓN Y RLS ---
  async saveClient() {
    // 1. Exigir autenticación previa antes de insertar/actualizar
    if (!this.currentUser()) {
      this.openLoginModal(this.editingClientId ? 'actualizar clientes' : 'insertar clientes');
      return;
    }

    // 2. Comprobar permisos según RLS de Supabase
    if (this.isAdmin() !== 'admin') {
      this.showToast('RLS DENEGADO: Tu cuenta no tiene rol Administrador en la tabla profiles.');
      return;
    }

    if (this.clientForm.invalid) return;

    try {
      const formValue = this.clientForm.value;
      if (this.editingClientId) {
        await this.supabaseService.updateClient(this.editingClientId, formValue);
        this.showToast('Cliente actualizado correctamente en Supabase');
      } else {
        await this.supabaseService.createClient(formValue);
        this.showToast('Cliente insertado con éxito en Supabase');
      }
      this.resetForm();
    } catch (e: any) {
      this.showToast('Error de guardado (RLS): ' + e.message);
    }
  }

  editClient(client: Client) {
    if (!this.currentUser()) {
      this.openLoginModal('editar los datos del cliente');
      return;
    }
    if (this.isAdmin() !== 'admin') {
      this.showToast('RLS DENEGADO: Solo los Administradores pueden editar registros.');
      return;
    }

    this.editingClientId = client.id!;
    this.clientForm.patchValue({
      nombre: client.nombre,
      empresa: client.empresa,
      email: client.email
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async deleteClient(id: string) {
    if (!this.currentUser()) {
      this.openLoginModal('eliminar clientes');
      return;
    }
    if (this.isAdmin() !== 'admin') {
      this.showToast('RLS DENEGADO: Solo los Administradores pueden eliminar registros.');
      return;
    }

    try {
      await this.supabaseService.deleteClient(id);
      this.showToast('Cliente eliminado correctamente en Supabase');
    } catch (e: any) {
      this.showToast('Error eliminando: ' + e.message);
    }
  }

  resetForm() {
    this.clientForm.reset();
    this.editingClientId = null;
  }

  onRoleChange(event: any) {
    const selectedRole = event.detail.value as 'admin' | 'user';
    this.supabaseService.switchRole(selectedRole);
    if (selectedRole !== 'admin') {
      this.resetForm();
    }
    this.showToast(`Rol cambiado a: ${selectedRole.toUpperCase()}`);
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}
