import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonBadge, IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  imageOutline,
  refreshOutline,
  cloudDownloadOutline,
  folderOutline,
  shieldCheckmarkOutline,
  arrowBackOutline,
  eyeOutline,
  timeOutline,
  documentOutline
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase.service';
import { StorageImage } from '../models/storage-image.model';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.page.html',
  styleUrls: ['./storage.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonButtons,
    IonBackButton,
    IonSpinner
  ]
})
export class StoragePage implements OnInit {
  private supabaseService = inject(SupabaseService);

  public images = signal<StorageImage[]>([]);
  public isLoading = signal<boolean>(true);
  public bucketName = 'crm-images';

  constructor() {
    addIcons({
      imageOutline,
      refreshOutline,
      cloudDownloadOutline,
      folderOutline,
      shieldCheckmarkOutline,
      arrowBackOutline,
      eyeOutline,
      timeOutline,
      documentOutline
    });
  }

  async ngOnInit() {
    await this.loadImages();
  }

  async loadImages() {
    this.isLoading.set(true);
    try {
      const data = await this.supabaseService.getStorageImages(this.bucketName);
      this.images.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }
}
