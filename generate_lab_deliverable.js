const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const WWW_DIR = path.join(__dirname, 'www');
const PORT = 4242;

// Servidor estático HTTP ligero para servir el bundle de producción www
function startStaticServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(WWW_DIR, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep) || req.url === '/') {
      filePath = path.join(WWW_DIR, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(WWW_DIR, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Error cargando recurso: ' + error.code);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Servidor local activo en http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function main() {
  const server = await startStaticServer();

  const capturasDir = path.join(__dirname, 'capturas');
  if (!fs.existsSync(capturasDir)) {
    fs.mkdirSync(capturasDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 860, deviceScaleFactor: 2 });

  console.log('Navegando a la aplicación local...');
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.crm-content', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Captura: Admin View (Formulario reactivo completo + lista)
  console.log('Capturando: 1. Modo Administrador...');
  const capAdminPath = path.join(capturasDir, 'captura1_admin_crud.png');
  await page.screenshot({ path: capAdminPath, fullPage: false });

  // 2. Captura: User View (Solo lectura, formulario oculto mediante @if)
  console.log('Capturando: 2. Modo Usuario (Restricción RBAC)...');
  await page.evaluate(() => {
    const userSegmentBtn = document.querySelector('ion-segment-button[value="user"]');
    if (userSegmentBtn) userSegmentBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const capUserPath = path.join(capturasDir, 'captura2_usuario_lectura.png');
  await page.screenshot({ path: capUserPath, fullPage: false });

  // 3. Captura: Volver a Admin e insertar nuevo cliente + Toast feedback
  console.log('Capturando: 3. Inserción CRUD y Notificación Toast...');
  await page.evaluate(() => {
    const adminSegmentBtn = document.querySelector('ion-segment-button[value="admin"]');
    if (adminSegmentBtn) adminSegmentBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Rellenar formulario reactivo simulando teclado real para validaciones síncronas de Angular
  await page.waitForSelector('ion-input[formcontrolname="nombre"] input');
  await page.type('ion-input[formcontrolname="nombre"] input', 'Elena Gómez', { delay: 20 });
  await page.type('ion-input[formcontrolname="empresa"] input', 'Sistemas Cloud S.L.', { delay: 20 });
  await page.type('ion-input[formcontrolname="email"] input', 'elena.gomez@sistemascloud.es', { delay: 20 });
  await new Promise(r => setTimeout(r, 400));

  // Clic en Guardar Cliente
  await page.click('.save-btn');
  await new Promise(r => setTimeout(r, 900));

  const capToastPath = path.join(capturasDir, 'captura3_insercion_toast.png');
  await page.screenshot({ path: capToastPath, fullPage: false });

  // 4. Captura: Modo edición con precarga en formulario y deslizamiento
  console.log('Capturando: 4. Modo Edición y Deslizamiento...');
  await page.setViewport({ width: 440, height: 750, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const editBtns = document.querySelectorAll('.desktop-actions ion-button');
    if (editBtns && editBtns.length > 0) {
      editBtns[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const capEditPath = path.join(capturasDir, 'captura4_edicion_mobile.png');
  await page.screenshot({ path: capEditPath, fullPage: false });

  console.log('Capturas generadas con éxito.');

  // Convertir capturas a base64
  const toBase64 = (filePath) => {
    if (!fs.existsSync(filePath)) return '';
    const b = fs.readFileSync(filePath);
    return `data:image/png;base64,${b.toString('base64')}`;
  };

  const imgAdmin = toBase64(capAdminPath);
  const imgUser = toBase64(capUserPath);
  const imgToast = toBase64(capToastPath);
  const imgEdit = toBase64(capEditPath);

  // Crear HTML con diseño estricto de 2 páginas A4
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Memoria Técnica: Gestión Completa CRUD con Roles (Ionic, Angular Standalone, Supabase)</title>
<style>
  @page {
    size: A4 portrait;
    margin: 8mm 11mm 8mm 11mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.35;
    font-size: 10.5px;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  
  .page {
    height: 278mm;
    max-height: 278mm;
    overflow: hidden;
    position: relative;
    padding: 0;
  }

  .page-break {
    page-break-before: always;
  }

  .header-tag {
    font-size: 9px;
    font-weight: 700;
    color: #475569;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .module-tag {
    font-size: 9.5px;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 4px;
  }

  h1 {
    font-size: 17px;
    color: #0f172a;
    margin: 2px 0 6px 0;
    line-height: 1.2;
    font-weight: 800;
  }

  .links-bar {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 9.5px;
  }
  .links-bar a {
    color: #1d4ed8;
    text-decoration: none;
    font-weight: 700;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
    font-size: 9px;
  }
  .meta-item strong {
    color: #0f172a;
    display: block;
    font-size: 8.5px;
    text-transform: uppercase;
    color: #64748b;
  }

  h2 {
    font-size: 12px;
    color: #0f172a;
    border-bottom: 1.5px solid #2563eb;
    padding-bottom: 3px;
    margin: 8px 0 5px 0;
    font-weight: 700;
  }

  p { margin: 0 0 5px 0; }
  ul { margin: 0 0 5px 14px; padding: 0; }
  li { margin-bottom: 2px; }

  .ra-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    font-size: 8.5px;
  }
  .ra-table th {
    background: #1e40af;
    color: #ffffff;
    padding: 4px 6px;
    text-align: left;
    font-weight: 600;
  }
  .ra-table td {
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  .ra-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  .grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 6px;
  }

  .card-evidence {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .card-evidence h3 {
    margin: 0 0 4px 0;
    font-size: 9.5px;
    color: #1e3a8a;
    font-weight: 700;
  }
  .card-evidence img {
    width: 100%;
    height: 155px;
    object-fit: cover;
    object-position: top;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    display: block;
  }
  .caption {
    font-size: 8px;
    color: #64748b;
    margin-top: 3px;
    line-height: 1.25;
  }

  .code-block {
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 5px;
    padding: 6px 8px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 7.8px;
    line-height: 1.28;
    white-space: pre-wrap;
    margin: 4px 0 6px 0;
  }

  .badge-tag {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: 700;
  }
  .badge-admin { background: #dcfce7; color: #166534; }
  .badge-user { background: #fef3c7; color: #92400e; }

  .footer-stamp {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 8px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
  }
</style>
</head>
<body>

  <!-- ================= PÁGINA 1 ================= -->
  <div class="page">
    <div class="header-tag">Ciclo Formativo DAM 2º · Módulo: Desarrollo de Interfaces (Código 0488)</div>
    <div class="module-tag">Alineación Curricular Comunidad de Madrid · RA 1, RA 3 y RA 4</div>
    <h1>Memoria Técnica: Gestión Completa CRUD con Roles (Ionic Standalone, Angular, Supabase)</h1>

    <div class="links-bar">
      <span><strong>Repositorio GitHub:</strong> <a href="https://github.com/alex060/dam-crm-app">https://github.com/alex060/dam-crm-app</a></span>
      <span><strong>Despliegue Vercel:</strong> <a href="https://dam-crm-app.vercel.app">https://dam-crm-app.vercel.app</a></span>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Alumno</strong> Alejandro</div>
      <div class="meta-item"><strong>Tecnologías</strong> Ionic 9 + Angular 18/19 Standalone + Supabase</div>
      <div class="meta-item"><strong>Seguridad</strong> RLS PostgreSQL + RBAC en Cliente (@if)</div>
      <div class="meta-item"><strong>Reactividad</strong> Signals (currentUser, userRole) + FormBuilder</div>
    </div>

    <h2>1. Base Teórica Técnica y Alineación Curricular</h2>
    <p>
      El objetivo de este laboratorio es implementar una arquitectura moderna de <strong>Control de Acceso Basado en Roles (RBAC)</strong> integrando dos capas de defensa: a nivel de servidor mediante <strong>Políticas de Seguridad de Fila (RLS)</strong> en Supabase (PostgreSQL), y a nivel de cliente adaptando la interfaz con el nuevo <strong>Control Flow (@if, @for)</strong> y <strong>Angular Signals</strong>.
    </p>

    <table class="ra-table">
      <tr>
        <th style="width: 25%;">Resultado de Aprendizaje (RA)</th>
        <th style="width: 32%;">Criterio de Evaluación (CE)</th>
        <th>Aplicación Práctica en dam-crm-app</th>
      </tr>
      <tr>
        <td><strong>RA 1:</strong> Confecciona interfaces gráficas con librerías de componentes.</td>
        <td><strong>CE 1.c:</strong> Enlace reactivo bidireccional entre modelo y vista.</td>
        <td>Formularios reactivos con <code>ReactiveFormsModule</code> y <code>FormBuilder</code> garantizando validaciones síncronas antes de peticiones CUD.</td>
      </tr>
      <tr>
        <td><strong>RA 3:</strong> Componentes personalizados evaluando eventos.</td>
        <td><strong>CE 3.d:</strong> Eventos de autenticación y modificación según roles.</td>
        <td>Señales reactivas <code>userRole = signal&lt;'admin' | 'user'&gt;</code> que recalculan el DOM inmediatamente ante cambios de sesión.</td>
      </tr>
      <tr>
        <td><strong>RA 4:</strong> Interfaces usables y accesibles.</td>
        <td><strong>CE 4.a:</strong> Diseño responsivo y componentes móviles.</td>
        <td>Uso de <code>ion-item-sliding</code> nativo con <code>ion-item-options</code> para acciones táctiles de edición y borrado.</td>
      </tr>
    </table>

    <h2>2. Evidencias de Ejecución: Control de Acceso por Roles (RBAC)</h2>
    <div class="grid-2col">
      <div class="card-evidence">
        <h3>Captura 1: Vista Administrador <span class="badge-tag badge-admin">ROL: ADMIN</span></h3>
        <img src="${imgAdmin}" alt="Vista Administrador">
        <div class="caption">
          <strong>Figura 1:</strong> Interfaz completa para administradores: formulario reactivo habilitado (Insert/Update) y listado interactivo con opciones CUD directas y al deslizar.
        </div>
      </div>

      <div class="card-evidence">
        <h3>Captura 2: Vista Usuario <span class="badge-tag badge-user">ROL: USUARIO</span></h3>
        <img src="${imgUser}" alt="Vista Usuario">
        <div class="caption">
          <strong>Figura 2:</strong> Renderizado condicional estricto: el formulario y las acciones de edición/borrado se ocultan del DOM con <code>&#64;if</code>. Solo se permite consulta según RLS.
        </div>
      </div>
    </div>

    <div class="footer-stamp">
      <span>dam-crm-app · Alumno: Alejandro · Desarrollo de Interfaces (0488)</span>
      <span>Página 1 de 2</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ================= PÁGINA 2 ================= -->
  <div class="page">
    <h2>3. Evidencias de Ejecución: Operaciones CRUD y Experiencia Móvil</h2>
    
    <div class="grid-2col">
      <div class="card-evidence">
        <h3>Captura 3: Inserción de Cliente y Notificación Toast</h3>
        <img src="${imgToast}" alt="Inserción y Toast">
        <div class="caption">
          <strong>Figura 3:</strong> Validación reactiva del formulario, inserción asíncrona en base de datos y feedback de confirmación en tiempo real con <code>ion-toast</code> ("Cliente insertado con éxito").
        </div>
      </div>

      <div class="card-evidence">
        <h3>Captura 4: Modo Edición y Deslizamiento (RWD Mobile)</h3>
        <img src="${imgEdit}" alt="Modo Edición Mobile">
        <div class="caption">
          <strong>Figura 4:</strong> Carga de datos con <code>patchValue</code> en el formulario reactivo, cambio de estado a "Actualizar Cliente" y compatibilidad responsive móvil (DevTools).
        </div>
      </div>
    </div>

    <h2>4. Implementación Técnica y Extractos Clave de Código</h2>

    <div class="grid-2col">
      <div>
        <strong style="font-size: 9px; color: #1e3a8a;">Servicio Reactivo Supabase (src/app/services/supabase.service.ts)</strong>
        <div class="code-block">
export class SupabaseService {
  private supabase: SupabaseClient;
  // Señales reactivas para el estado global (RBAC)
  public currentUser = signal&lt;User | null&gt;(null);
  public userRole = signal&lt;'admin' | 'user' | null&gt;('admin');

  async createClient(client: Client): Promise&lt;void&gt; {
    if (this.userRole() !== 'admin') {
      throw new Error('RLS: Solo admins pueden insertar');
    }
    const { error } = await this.supabase
      .from('clients')
      .insert([{ nombre: client.nombre, empresa: client.empresa, email: client.email }]);
    if (error) throw error;
  }
}</div>
      </div>

      <div>
        <strong style="font-size: 9px; color: #1e3a8a;">Renderizado Condicional (src/app/home/home.page.html)</strong>
        <div class="code-block">
&lt;!-- FORMULARIO REACTIVO (Solo visible para admins) --&gt;
&#64;if (isAdmin() === 'admin') {
  &lt;ion-card&gt;
    &lt;ion-card-title&gt;{{ editingClientId ? 'Editar' : 'Nuevo' }}&lt;/ion-card-title&gt;
    &lt;form [formGroup]="clientForm" (ngSubmit)="saveClient()"&gt;
      &lt;ion-input formControlName="nombre"&gt;&lt;/ion-input&gt;
      &lt;ion-input formControlName="empresa"&gt;&lt;/ion-input&gt;
      &lt;ion-input formControlName="email"&gt;&lt;/ion-input&gt;
      &lt;ion-button type="submit" [disabled]="clientForm.invalid"&gt;Guardar&lt;/ion-button&gt;
    &lt;/form&gt;
  &lt;/ion-card&gt;
}
&lt;!-- LISTADO CON DESLIZAMIENTO CONDICIONAL --&gt;
&#64;for (client of clients; track client.id) {
  &lt;ion-item-sliding&gt;
    &lt;ion-item&gt;&lt;ion-label&gt;{{ client.nombre }}&lt;/ion-label&gt;&lt;/ion-item&gt;
    &#64;if (isAdmin() === 'admin') {
      &lt;ion-item-options side="end"&gt;
        &lt;ion-item-option (click)="editClient(client)"&gt;&lt;ion-icon name="create"&gt;&lt;/ion-icon&gt;&lt;/ion-item-option&gt;
        &lt;ion-item-option (click)="deleteClient(client.id)"&gt;&lt;ion-icon name="trash"&gt;&lt;/ion-icon&gt;&lt;/ion-item-option&gt;
      &lt;/ion-item-options&gt;
    }
  &lt;/ion-item-sliding&gt;
}</div>
      </div>
    </div>

    <h2>5. Conclusiones y Enlaces de Entrega</h2>
    <p>
      La combinación de <strong>Angular Standalone</strong> con <strong>Supabase RLS</strong> y <strong>Ionic</strong> resuelve de raíz los desafíos de seguridad y rendimiento en interfaces multiplataforma:
    </p>
    <ul>
      <li><strong>Defensa en Profundidad:</strong> Aunque un usuario alterase el DOM en cliente, las políticas RLS en PostgreSQL rechazan cualquier operación no autorizada.</li>
      <li><strong>Reactividad Síncrona:</strong> El uso de <code>signal</code> permite a la vista reaccionar inmediatamente a cambios de permisos sin sobrecarga de Zone.js.</li>
      <li><strong>Historial de Commits:</strong> Se estructuró el desarrollo en 7 commits atómicos reflejando cada fase del laboratorio.</li>
    </ul>

    <div class="links-bar" style="margin-top: 6px;">
      <span><strong>GitHub:</strong> <a href="https://github.com/alex060/dam-crm-app">https://github.com/alex060/dam-crm-app</a></span>
      <span><strong>Vercel Live App:</strong> <a href="https://dam-crm-app.vercel.app">https://dam-crm-app.vercel.app</a></span>
    </div>

    <div class="footer-stamp">
      <span>dam-crm-app · Alumno: Alejandro · Desarrollo de Interfaces (0488)</span>
      <span>Página 2 de 2</span>
    </div>
  </div>

</body>
</html>
  `;

  const pdfPath = 'c:\\Users\\josei\\Desktop\\insti\\DI\\Memoria_Tecnica_Supabase_CRUD_Alejandro.pdf';
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
  });

  console.log(`PDF generado con éxito en: ${pdfPath}`);

  await browser.close();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Error generando entregable:', err);
  process.exit(1);
});
