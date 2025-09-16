import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Settings, CheckCircle2 } from 'lucide-react';

export default function EditorConfigGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">COMEX File Hygiene Setup Guide</h1>
        <p className="text-gray-600">Configuración para prevenir BOM/ZWSP y caracteres invisibles</p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota:</strong> Estos archivos deben crearse en la raíz del repositorio Git, 
          fuera de la plataforma Base44.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        
        {/* .editorconfig */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              .editorconfig
              <Badge variant="secondary">Raíz del proyecto</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Normaliza configuración de editores (UTF-8, LF, espacios).
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2`}
            </pre>
          </CardContent>
        </Card>

        {/* .gitattributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              .gitattributes
              <Badge variant="secondary">Raíz del proyecto</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Fuerza line endings LF y marca archivos binarios correctamente.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`* text=auto eol=lf
*.json text working-tree-encoding=UTF-8
*.js text
*.jsx text
*.ts text
*.tsx text
*.md text
*.yml text
*.yaml text
*.css text
*.html text
*.png binary
*.jpg binary
*.jpeg binary
*.mov binary
*.pdf binary`}
            </pre>
          </CardContent>
        </Card>

        {/* Scanner Script */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Scanner Unicode (Manual)
              <Badge variant="outline">Terminal</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Detecta caracteres invisibles (BOM, ZWSP, NBSP, etc.).
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Con ripgrep (recomendado):</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`rg -n --pcre2 -S "[\\x{FEFF}\\x{200B}\\x{00A0}\\x{2060}\\x{202A}-\\x{202E}]" \\
  --glob '!node_modules' \\
  --iglob '*.{json,ts,tsx,js,jsx,md}' .`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Con grep (fallback):</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`grep -r -n -P "[\\x{FEFF}\\x{200B}\\x{00A0}\\x{2060}\\x{202A}-\\x{202E}]" . \\
  --include="*.json" --include="*.js" --include="*.jsx" \\
  --include="*.ts" --include="*.tsx" --include="*.md" \\
  --exclude-dir=node_modules`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smoke Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Smoke Test COMEX
              <Badge variant="destructive">Crítico</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Verificar que no hay duplicación de dashboard entre tabs.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span className="text-sm">Abrir <code>/COMEX?tab=si</code> → Verificar header "Shipping Instructions"</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span className="text-sm">Navegar a <code>/COMEX?tab=bl-awb</code> → Header "BL/AWB Management"</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span className="text-sm">Navegar a <code>/COMEX?tab=liquidación</code> → Header "Liquidación"</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span className="text-sm">Recarga F5 en cada tab → Headers se mantienen correctos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                <span className="text-sm">Navegación cruzada → Sin bleeding de estado</span>
              </div>
            </div>

            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Criterio de éxito:</strong> Cada tab debe mostrar header y KPIs únicos. 
                NO debe aparecer "Dashboard" duplicado en ningún tab.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Caracteres a detectar */}
        <Card>
          <CardHeader>
            <CardTitle>Caracteres Unicode Invisibles Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Caracteres Problemáticos:</h4>
                <ul className="space-y-1">
                  <li><code>U+FEFF</code> - BOM (Byte Order Mark)</li>
                  <li><code>U+200B</code> - ZWSP (Zero Width Space)</li>
                  <li><code>U+00A0</code> - NBSP (Non-Breaking Space)</li>
                  <li><code>U+2060</code> - WJ (Word Joiner)</li>
                  <li><code>U+202A-E</code> - Controles bidireccionales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Impacto:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Errores de parsing JSON</li>
                  <li>• Build failures inexplicables</li>
                  <li>• Problemas de codificación</li>
                  <li>• Inconsistencias entre entornos</li>
                  <li>• Problemas de copy/paste</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Próximos pasos:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Crear archivos de configuración en la raíz del repositorio</li>
            <li>Ejecutar scanner unicode para detectar problemas actuales</li>
            <li>Realizar smoke test manual de COMEX</li>
            <li>Documentar hallazgos y evidencia en PR</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}