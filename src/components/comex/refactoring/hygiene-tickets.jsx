# Corregir File Hygiene Guardrails - Base44 Compatible

**Epic:** COMEX-200 - File Hygiene & Unicode Guardrails
**Trigger:** BOM/ZWSP parsing errors causing build failures
**Success Criteria:** 0 invisible characters, ASCII-only keys, UTF-8 clean

---

## COMEX-223: .editorconfig de Referencia (UTF-8, LF, sin BOM)
**Story Points:** 1
**Owner:** DevOps Lead
**Priority:** P0
**Sprint:** Current

### Descripción
Establecer configuración normalizada de archivos para todos los editores del equipo.

### Acción
Agregar en la raíz del proyecto:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2
```

### Definition of Done
- [ ] Archivo `.editorconfig` en raíz del proyecto
- [ ] Todos los editores (VSCode, WebStorm, Vim) respetan configuración
- [ ] Nueva línea final automática en todos los archivos
- [ ] Espacios trailing eliminados automáticamente

### Archivos Creados
- `.editorconfig`

---

## COMEX-224: .gitattributes Anti-CRLF y Binarios
**Story Points:** 1
**Owner:** DevOps Lead
**Priority:** P0
**Sprint:** Current

### Descripción
Configurar Git para normalizar line endings y manejar tipos de archivo correctamente.

### Acción
```gitattributes
* text=auto eol=lf
*.json text working-tree-encoding=UTF-8
*.md   text
*.js   text
*.jsx  text
*.ts   text
*.tsx  text
*.png  binary
*.jpg  binary
*.mov  binary
*.pdf  binary
```

### Definition of Done
- [ ] Git normaliza automáticamente a LF
- [ ] No se reintroduce CRLF desde Windows
- [ ] JSON files explícitamente UTF-8
- [ ] Binarios marcados correctamente

### Archivos Creados
- `.gitattributes`

---

## COMEX-225: ESLint - Prohibir BOM y Non-ASCII en Claves
**Story Points:** 3
**Owner:** Frontend Lead
**Priority:** P0
**Sprint:** Current

### Descripción
Reglas ESLint para detectar y prohibir BOM y caracteres non-ASCII en claves críticas.

### Tareas Técnicas
- [ ] Agregar regla `"unicode-bom": ["error", "never"]`
- [ ] Custom rule para keys: patrón `^[A-Za-z0-9_.-]+$`
- [ ] Aplicar a: routing_contract, namespace, slug, id
- [ ] Excluir labels UI (pueden llevar tildes)

### Definition of Done
- [ ] Cualquier BOM rompe el lint
- [ ] Claves con tildes/ñ/espacios fallan build
- [ ] Labels UI siguen permitiendo acentos
- [ ] Mensaje de error claro con sugerencia

### Archivos Impactados
- `.eslintrc.js` (rules update)
- `eslint-rules/no-non-ascii-keys.js` (custom rule)

### Acceptance Criteria
- Lint error: `"liquidación"` → suggest `"liquidacion"`
- Pass: `"title": "Liquidación Final"` (es label, no key)
- Fail: `{"liquidación": {...}}` (es key)

---

## COMEX-226: Scanner de Unicode Oculto (Pre-commit + CI)
**Story Points:** 2
**Owner:** DevOps Lead
**Priority:** P0
**Sprint:** Current

### Descripción
Script que detecta y falla ante caracteres Unicode invisibles problemáticos.

### Caracteres Detectados
- `U+FEFF` (BOM)
- `U+200B` (ZWSP - Zero Width Space)
- `U+00A0` (NBSP - Non-Breaking Space)
- `U+2060` (WJ - Word Joiner)
- `U+202A-U+202E` (Bidi controls)

### Script de Referencia
```bash
#!/bin/bash
# scripts/scan-invisible-unicode.sh

rg -n --pcre2 -S "[\x{FEFF}\x{200B}\x{00A0}\x{2060}\x{202A}-\x{202E}]" \
  --glob '!node_modules' \
  --glob '!dist' \
  --glob '!.git' \
  --iglob '*.{json,ts,tsx,js,jsx,md}' \
  .

if [ $? -eq 0 ]; then
  echo "❌ Invisible Unicode characters detected!"
  exit 1
else
  echo "✅ No invisible Unicode characters found"
  exit 0
fi
```

### Definition of Done
- [ ] Script ejecutable detecta todos los caracteres objetivo
- [ ] Commits con caracteres invisibles fallan en pre-commit
- [ ] CI pipeline bloquea PRs con caracteres invisibles
- [ ] Output claro con file:line:character para debugging

### Archivos Creados
- `scripts/scan-invisible-unicode.sh`
- `.github/workflows/unicode-check.yml`

---

## COMEX-232: QA Manual de Humo (5 min) - Bug Específico
**Story Points:** 1
**Owner:** QA Lead + Frontend Senior
**Priority:** P0
**Sprint:** Current

### Descripción
Test manual orientado específicamente al bug observado: dashboard replicándose entre tabs.

### Casos de Prueba
1.  **Abrir** `/comex/si` → Verificar header único "Shipping Instructions"
2.  **Navegar** `/comex/bl-awb` → Verificar header único "BL/AWB Management"
3.  **Navegar** `/comex/liquidacion` → Verificar header único "Liquidación"
4.  **Recarga F5** en cada tab → Confirmar header correcto persiste
5.  **Navegación cruzada** si→bl-awb→liquidacion→si → Confirmar 0 bleeding

### Criterios de Éxito
- [ ] Cada tab tiene header y KPIs distintos
- [ ] No aparece "Dashboard" duplicado en ningún tab
- [ ] Recarga mantiene contexto correcto
- [ ] Navegación rápida no contamina estado

### Definition of Done
- [ ] 3 capturas de pantalla: SI + BL-AWB + Liquidación
- [ ] Evidencia adjunta en PR con timestamps
- [ ] Sign-off de QA Lead
- [ ] 0 replicación de dashboard confirmada

### Entregables
- Screenshots: `qa-evidence-si.png`, `qa-evidence-bl-awb.png`, `qa-evidence-liquidacion.png`
- Video opcional: `qa-cross-navigation.mov`

---

# Implementación en Base44

## Archivos de configuración externos
Los siguientes archivos deben crearse **fuera** de Base44 en el repositorio git:

### .editorconfig (raíz del proyecto)
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2
```

### .gitattributes (raíz del proyecto)
```gitattributes
* text=auto eol=lf
*.json text working-tree-encoding=UTF-8
*.js text
*.jsx text
*.ts text
*.tsx text
*.md text
*.png binary
*.jpg binary
*.mov binary
*.pdf binary
```

### package.json (script adicional)
```json
{
  "scripts": {
    "scan-unicode": "rg -n --pcre2 -S '[\\x{FEFF}\\x{200B}\\x{00A0}\\x{2060}\\x{202A}-\\x{202E}]' --glob '!node_modules' --iglob '*.{json,ts,tsx,js,jsx,md}' ."
  }
}
```

## Check rápido para hoy

1.  **Ejecutar scanner manual** (desde terminal):
    ```bash
    # Si tienes ripgrep instalado
    rg -n --pcre2 -S "[\x{FEFF}\x{200B}\x{00A0}\x{2060}\x{202A}-\x{202E}]" --glob '!node_modules' --iglob '*.{json,ts,tsx,js,jsx,md}' .

    # O con grep (fallback)
    grep -r -n -P "[\x{FEFF}\x{200B}\x{00A0}\x{2060}\x{202A}-\x{202E}]" . --include="*.json" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.md" --exclude-dir=node_modules
    ```

2.  **Smoke test manual COMEX:**
    - Abrir `/COMEX?tab=si`
    - Abrir `/COMEX?tab=bl-awb`
    - Abrir `/COMEX?tab=liquidación`
    - Capturar pantallas y confirmar headers únicos

3.  **PR con evidencia:**
    - Screenshots del smoke test
    - Output del scanner unicode
    - Lista de keys migradas a ASCII

---

**Status:** Ready for manual validation
**Next Action:** Run unicode scanner → Manual smoke test → Submit evidence
**Note:** Configuration files (.editorconfig, .gitattributes) must be added outside Base44 platform