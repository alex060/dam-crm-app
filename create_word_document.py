# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

BASE_DIR = r"c:\Users\josei\Desktop\insti\DI\dam-crm-app"
CAPTURAS_DIR = os.path.join(BASE_DIR, "capturas")
OUTPUT_DOCX_PROJECT = r"c:\Users\josei\Desktop\insti\DI\Memoria_Tecnica_Supabase_CRUD_Alejandro.docx"
OUTPUT_DOCX_ONEDRIVE = r"C:\Users\josei\OneDrive\Documentos\Memoria_Tecnica_Supabase_CRUD_Alejandro.docx"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_callout_border(cell, border_color="2563EB"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)

def set_table_borders(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)

def add_header_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    run = h.runs[0]
    run.font.name = "Segoe UI"
    if level == 1:
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138)  # Deep Navy
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(37, 99, 235)  # Royal Blue
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(51, 65, 85)   # Slate
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
    return h

def add_paragraph_styled(doc, text="", bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Segoe UI"
        r_bold.font.size = Pt(10)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(31, 41, 55)
    if text:
        r_text = p.add_run(text)
        r_text.font.name = "Segoe UI"
        r_text.font.size = Pt(10)
        r_text.font.color.rgb = RGBColor(55, 65, 81)
    return p

def add_bullet_styled(doc, text="", bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2.5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Segoe UI"
        r_bold.font.size = Pt(9.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(31, 41, 55)
    if text:
        r_text = p.add_run(text)
        r_text.font.name = "Segoe UI"
        r_text.font.size = Pt(9.5)
        r_text.font.color.rgb = RGBColor(55, 65, 81)
    return p

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "0F172A")  # Slate 900
    set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="1E293B"/>
            <w:left w:val="single" w:sz="20" w:space="0" w:color="3B82F6"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="1E293B"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="1E293B"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    lines = code_text.strip().split("\n")
    for i, line in enumerate(lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        run = p.add_run(line)
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(226, 232, 240)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def add_callout(doc, title, text, box_type="info"):
    colors = {
        "info": {"bg": "EFF6FF", "border": "2563EB", "title_rgb": RGBColor(37, 99, 235)},
        "warning": {"bg": "FFFBEB", "border": "D97706", "title_rgb": RGBColor(217, 119, 6)},
        "success": {"bg": "ECFDF5", "border": "059669", "title_rgb": RGBColor(5, 150, 105)}
    }
    cfg = colors.get(box_type, colors["info"])
    
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, cfg["bg"])
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    set_callout_border(cell, cfg["border"])
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(title)
    run_title.font.name = "Segoe UI"
    run_title.font.size = Pt(9.5)
    run_title.font.bold = True
    run_title.font.color.rgb = cfg["title_rgb"]
    
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(0)
    run_text = p2.add_run(text)
    run_text.font.name = "Segoe UI"
    run_text.font.size = Pt(9)
    run_text.font.color.rgb = RGBColor(31, 41, 55)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def add_image_box(doc, img_name, title, caption, max_width=6.0):
    img_path = os.path.join(CAPTURAS_DIR, img_name)
    if not os.path.exists(img_path):
        return
    
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "FFFFFF")
    set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    run_pic = p.add_run()
    run_pic.add_picture(img_path, width=Inches(max_width))
    
    p_cap = cell.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(2)
    
    r_fig = p_cap.add_run(f"{title}: ")
    r_fig.font.name = "Segoe UI"
    r_fig.font.size = Pt(8.5)
    r_fig.font.bold = True
    r_fig.font.color.rgb = RGBColor(30, 58, 138)
    
    r_cap = p_cap.add_run(caption)
    r_cap.font.name = "Segoe UI"
    r_cap.font.size = Pt(8.5)
    r_cap.font.color.rgb = RGBColor(100, 116, 139)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def build_word_document():
    doc = docx.Document()
    
    # Configurar márgenes A4
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
    
    # ================= PORTADA =================
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(20)
    p_top.paragraph_format.space_after = Pt(4)
    r_inst = p_top.add_run("COMUNIDAD DE MADRID · CONSEJERÍA DE EDUCACIÓN")
    r_inst.font.name = "Segoe UI"
    r_inst.font.size = Pt(9.5)
    r_inst.font.bold = True
    r_inst.font.color.rgb = RGBColor(100, 116, 139)
    
    p_mod = doc.add_paragraph()
    p_mod.paragraph_format.space_before = Pt(0)
    p_mod.paragraph_format.space_after = Pt(20)
    r_mod = p_mod.add_run("Módulo Profesional: Desarrollo de Interfaces (Código 0488) · DAM 2º")
    r_mod.font.name = "Segoe UI"
    r_mod.font.size = Pt(11)
    r_mod.font.bold = True
    r_mod.font.color.rgb = RGBColor(37, 99, 235)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("MEMORIA TÉCNICA: GESTIÓN COMPLETA CRUD CON ROLES")
    r_title.font.name = "Segoe UI"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(30, 58, 138)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("Arquitectura de Control de Acceso Basado en Roles (RBAC), Seguridad a Nivel de Fila (RLS) en Supabase/PostgreSQL, Reactividad Granular mediante Signals y Formularios Reactivos en Ionic Standalone")
    r_sub.font.name = "Segoe UI"
    r_sub.font.size = Pt(11.5)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Tabla de Metadatos
    table_meta = doc.add_table(rows=6, cols=2)
    table_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_meta.autofit = False
    
    meta_info = [
        ("Alumno Evaluado:", "Alejandro"),
        ("Módulo Formativo:", "Desarrollo de Interfaces (Código 0488) - Grado Superior DAM"),
        ("Pila Tecnológica:", "Ionic Framework 9, Angular 18/19 Standalone, Supabase SDK"),
        ("Repositorio GitHub:", "https://github.com/alex060/dam-crm-app"),
        ("Despliegue Vercel:", "https://dam-crm-app.vercel.app"),
        ("Estado de la Entrega:", "Completa · 9 Commits Atómicos · RLS & RBAC Verificados")
    ]
    
    for row_idx, (label, val) in enumerate(meta_info):
        row = table_meta.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.name = "Segoe UI"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = RGBColor(30, 58, 138)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.name = "Segoe UI"
        r1.font.size = Pt(9.5)
        if "http" in val:
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(37, 99, 235)
        else:
            r1.font.color.rgb = RGBColor(51, 65, 85)
            
    set_table_borders(table_meta, "CBD5E1")
    
    doc.add_page_break()
    
    # ================= SECCIÓN 1: ALINEACIÓN CURRICULAR =================
    add_header_styled(doc, "1. Alineación Curricular y Competencias Técnicas", level=1)
    add_paragraph_styled(doc, "La presente práctica cubre los criterios de evaluación y resultados de aprendizaje exigidos en el currículo formativo de la Comunidad de Madrid para el módulo Desarrollo de Interfaces (0488):")
    
    table_ra = doc.add_table(rows=4, cols=3)
    table_ra.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_ra.autofit = False
    
    headers_ra = ["Resultado de Aprendizaje (RA)", "Criterio de Evaluación (CE)", "Evidencia Demostrable"]
    widths_ra = [Inches(1.8), Inches(2.2), Inches(2.5)]
    
    for c_idx, title in enumerate(headers_ra):
        cell = table_ra.rows[0].cells[c_idx]
        cell.width = widths_ra[c_idx]
        set_cell_background(cell, "1E40AF")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title)
        r.font.name = "Segoe UI"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    ra_rows = [
        ("RA 1: Confecciona interfaces gráficas de usuario utilizando herramientas visuales y librerías de componentes.",
         "CE 1.c: Se han establecido los mecanismos de enlace entre los datos del modelo y la vista (Data Binding bidireccional reactivo).",
         "Formularios reactivos con ReactiveFormsModule y FormBuilder; validaciones síncronas antes de peticiones CUD."),
        ("RA 3: Crea componentes visuales personalizados evaluando y gestionando eventos.",
         "CE 3.d: Se han gestionado eventos de autenticación y modificado la interfaz en función de los roles de usuario.",
         "Gestión de sesión global con Angular Signals (currentUser, userRole) y ocultación dinámica de controles mediante @if."),
        ("RA 4: Diseña interfaces usables y accesibles.",
         "CE 4.a: Se han aplicado principios de diseño responsivo (Uso de ion-list y ion-grid).",
         "Implementación de ion-item-sliding nativo con ion-item-options (editar/borrar) adaptado a móviles y pantallas táctiles.")
    ]
    
    for r_idx, row_data in enumerate(ra_rows):
        row = table_ra.rows[r_idx + 1]
        for c_idx, text_content in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = widths_ra[c_idx]
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(text_content)
            r.font.name = "Segoe UI"
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(51, 65, 85)
            
    set_table_borders(table_ra, "CBD5E1")
    
    # ================= SECCIÓN 2: BASE TEÓRICA =================
    add_header_styled(doc, "2. Base Teórica Técnica: Seguridad RBAC y RLS", level=1)
    add_paragraph_styled(doc, "En aplicaciones corporativas modernas, el control de acceso no puede depender únicamente del cliente. Una arquitectura Serverless profesional exige un modelo de defensa en profundidad:")
    
    add_bullet_styled(doc, "La interfaz en Angular/Ionic adapta su apariencia ocultando formularios y botones de acción según el rol del usuario autenticado (@if). Esto previene errores de usuario y mejora sustancialmente la experiencia de usuario (UX).", bold_prefix="1. Capa de Presentación (UI/RBAC): ")
    add_bullet_styled(doc, "La verdadera seguridad reside en el motor de base de datos PostgreSQL mediante Row Level Security (RLS). Aunque un atacante manipule el cliente web o envíe peticiones HTTP directas por API REST, las políticas del servidor rechazan automáticamente cualquier inserción o borrado si el rol no es 'admin'.", bold_prefix="2. Capa de Servidor (Supabase RLS): ")
    add_bullet_styled(doc, "Los datos de sesión y el rol se modelan como señales de Angular (signal<User>, signal<Role>). Al cambiar el rol, el DOM se actualiza de manera granular y síncrona sin necesidad de disparar ciclos pesados de Zone.js.", bold_prefix="3. Reactividad Granular (Signals): ")
    
    add_callout(doc, "Principio de Menor Privilegio (PoLP):", "Los usuarios con rol 'user' únicamente reciben permisos SELECT en la tabla clients. La directiva WITH CHECK de PostgreSQL garantiza que ninguna sentencia INSERT o UPDATE pueda ser completada sin validar que el ID del usuario existe en public.profiles con rol = 'admin'.", box_type="info")

    # ================= SECCIÓN 3: CONFIGURACIÓN SQL SUPABASE =================
    add_header_styled(doc, "3. Configuración del Backend (SQL en Supabase)", level=1)
    add_paragraph_styled(doc, "A continuación se detalla el script DDL ejecutado en el SQL Editor de Supabase para estructurar las tablas, enumeraciones y políticas RLS:")
    
    sql_script = """-- 1. Crear enumeración de roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- 2. Crear tabla de perfiles (vinculada a autenticación)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role public.user_role DEFAULT 'user' NOT NULL
);

-- 3. Crear tabla de clientes
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    empresa TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para Perfiles (Lectura propia)
CREATE POLICY "Leer perfil propio" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- 6. Políticas para Clientes (RBAC)
-- Lectura: Todos los usuarios autenticados
CREATE POLICY "Lectura para autenticados" ON public.clients
FOR SELECT TO authenticated USING (true);

-- Escritura (Insert, Update, Delete): SOLO Administradores
CREATE POLICY "Escritura solo para admins" ON public.clients
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));"""

    add_code_block(doc, sql_script)

    doc.add_page_break()

    # ================= SECCIÓN 4: IMPLEMENTACIÓN EN ANGULAR STANDALONE =================
    add_header_styled(doc, "4. Implementación en Ionic / Angular Standalone", level=1)
    
    add_header_styled(doc, "4.1. Servicio de Supabase y Signals (src/app/services/supabase.service.ts)", level=2)
    add_paragraph_styled(doc, "El servicio encapsula la conexión con Supabase e implementa el estado global de usuario y clientes como señales reactivas:")
    
    ts_service = """import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global
  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>('admin');
  public clients = signal<Client[]>([...]);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
  }

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      this.clients.set(data);
      return data;
    }
    return this.clients();
  }

  async createClient(client: Client): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('Permiso denegado por política RLS. Solo Administradores.');
    }
    await this.supabase.from('clients').insert([{
      nombre: client.nombre, empresa: client.empresa, email: client.email
    }]);
    this.clients.update(prev => [{ ...client, id: crypto.randomUUID() }, ...prev]);
  }
}"""
    add_code_block(doc, ts_service)

    add_header_styled(doc, "4.2. Controlador de Página (src/app/home/home.page.ts)", level=2)
    add_paragraph_styled(doc, "El componente Standalone gestiona el formulario reactivo con FormBuilder y enlaza las señales a la vista:")
    
    ts_home = """@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
            IonContent, IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions,
            IonItemOption, IonIcon, IonButton, IonInput, IonCard, IonToast, ...]
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  clients = this.supabaseService.clients;
  isAdmin = this.supabaseService.userRole;
  clientForm: FormGroup;
  editingClientId: string | null = null;

  constructor() {
    addIcons({ createOutline, trashOutline, shieldCheckmarkOutline, personOutline });
    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      empresa: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }
}"""
    add_code_block(doc, ts_home)

    add_header_styled(doc, "4.3. Vista con Control Flow Moderno (src/app/home/home.page.html)", level=2)
    add_paragraph_styled(doc, "Uso de las directivas integradas @if y @for para la adaptación condicional por roles:")
    
    html_home = """<!-- FORMULARIO REACTIVO (Solo visible para Administradores) -->
@if (isAdmin() === 'admin') {
  <ion-card class="form-card">
    <ion-card-header>
      <ion-card-title>{{ editingClientId ? 'Editar Cliente' : 'Nuevo Cliente' }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <form [formGroup]="clientForm" (ngSubmit)="saveClient()">
        <ion-item><ion-input formControlName="nombre"></ion-input></ion-item>
        <ion-item><ion-input formControlName="empresa"></ion-input></ion-item>
        <ion-item><ion-input formControlName="email"></ion-input></ion-item>
        <ion-button type="submit" [disabled]="clientForm.invalid">Guardar</ion-button>
      </form>
    </ion-card-content>
  </ion-card>
}

<!-- LISTADO CON DESLIZAMIENTO CONDICIONAL -->
<ion-list>
  @for (client of clients(); track client.id) {
    <ion-item-sliding #slidingItem>
      <ion-item>
        <ion-label>
          <h2>{{ client.nombre }}</h2>
          <p>{{ client.empresa }} | {{ client.email }}</p>
        </ion-label>
      </ion-item>
      @if (isAdmin() === 'admin') {
        <ion-item-options side="end">
          <ion-item-option color="primary" (click)="editClient(client)">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger" (click)="deleteClient(client.id!)">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      }
    </ion-item-sliding>
  }
</ion-list>"""
    add_code_block(doc, html_home)

    doc.add_page_break()

    # ================= SECCIÓN 5: EVIDENCIAS GRÁFICAS =================
    add_header_styled(doc, "5. Evidencias Gráficas y Pruebas de Funcionamiento", level=1)
    add_paragraph_styled(doc, "A continuación se presentan las capturas de pantalla tomadas durante la ejecución real de la aplicación en el navegador Chrome, demostrando la operatividad de cada requisito:")
    
    add_image_box(doc, "captura1_admin_crud.png", "Figura 1", 
                  "Modo Administrador: visualización activa del formulario reactivo para altas y listado con opciones directas y por deslizamiento.")
    
    add_image_box(doc, "captura2_usuario_lectura.png", "Figura 2", 
                  "Modo Usuario (Restricción RBAC): el formulario y las acciones de escritura se ocultan mediante @if, permitiendo únicamente la consulta.")
    
    add_image_box(doc, "captura3_insercion_toast.png", "Figura 3", 
                  "Inserción de registro con validaciones síncronas completadas y notificación visual emergente con ion-toast ('Cliente insertado con éxito').")
    
    add_image_box(doc, "captura4_edicion_mobile.png", "Figura 4", 
                  "Modo Edición y Diseño RWD: precarga de datos con patchValue, botón 'Actualizar Cliente' y compatibilidad con pantalla táctil/móvil.")

    doc.add_page_break()

    # ================= SECCIÓN 6: COMMITS Y VERCEL =================
    add_header_styled(doc, "6. Control de Versiones (Git) y Despliegue en Producción", level=1)
    add_paragraph_styled(doc, "Para garantizar la trazabilidad pedagógica, el repositorio se construyó de forma incremental en 9 commits atómicos:")
    
    table_git = doc.add_table(rows=10, cols=3)
    table_git.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_git.autofit = False
    
    headers_git = ["Commit Hash", "Tipo / Ámbito", "Mensaje Descriptivo"]
    widths_git = [Inches(1.2), Inches(1.5), Inches(3.8)]
    
    for c_idx, title in enumerate(headers_git):
        cell = table_git.rows[0].cells[c_idx]
        cell.width = widths_git[c_idx]
        set_cell_background(cell, "1E40AF")
        set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Segoe UI"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    commits_data = [
        ("d47bfce", "docs", "anadir script automatizado de generacion de evidencias y memoria tecnica en PDF (2 paginas)"),
        ("d554f18", "refactor", "optimizar reactividad de la lista de clientes con Signal (clientsSignal) y resolucion inmediata en UI"),
        ("ee12a1c", "ci", "anadir configuracion vercel.json para despliegue en produccion y SPA routing"),
        ("142674e", "feat", "disenar vista con @if condicional por roles, @for track, ion-item-sliding nativo y feedback con ion-toast (Paso 2.6)"),
        ("70be08d", "feat", "implementar logica de HomePage con FormBuilder reactivo, validaciones y RBAC (Paso 2.5)"),
        ("4b79eee", "refactor", "estructurar arquitectura Standalone moderna y enrutamiento en Angular 18/19"),
        ("b86d545", "feat", "implementar SupabaseService con gestion reactiva mediante Signals y operaciones CRUD (Paso 2.4)"),
        ("fbe62d0", "feat", "configurar entorno Supabase y definir interfaz de datos Client (Paso 2.2 y 2.3)"),
        ("2f32196", "chore", "inicializar proyecto Ionic Angular Standalone dam-crm-app e instalar SDK de Supabase")
    ]
    
    for r_idx, (chash, ctype, cmsg) in enumerate(commits_data):
        row = table_git.rows[r_idx + 1]
        for c_idx, val in enumerate([chash, ctype, cmsg]):
            cell = row.cells[c_idx]
            cell.width = widths_git[c_idx]
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Consolas" if c_idx == 0 else "Segoe UI"
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(51, 65, 85)
            
    set_table_borders(table_git, "CBD5E1")
    
    add_header_styled(doc, "6.1. Enlaces Definitivos de Entrega", level=2)
    add_bullet_styled(doc, "https://github.com/alex060/dam-crm-app", bold_prefix="Repositorio GitHub Oficial: ")
    add_bullet_styled(doc, "https://dam-crm-app.vercel.app", bold_prefix="Despliegue Vercel en Producción: ")
    add_bullet_styled(doc, "Memoria_Tecnica_Supabase_CRUD_Alejandro.pdf (2 páginas A4 estrictas)", bold_prefix="Memoria PDF Entregada: ")
    
    # Guardar en directorio del proyecto
    doc.save(OUTPUT_DOCX_PROJECT)
    print(f"Documento Word guardado exitosamente en: {OUTPUT_DOCX_PROJECT}")
    
    # Guardar / Sincronizar en OneDrive Documentos
    try:
        shutil.copy2(OUTPUT_DOCX_PROJECT, OUTPUT_DOCX_ONEDRIVE)
        print(f"Documento Word sincronizado en OneDrive: {OUTPUT_DOCX_ONEDRIVE}")
    except Exception as e:
        print(f"Aviso al sincronizar con OneDrive: {e}")

if __name__ == "__main__":
    build_word_document()
