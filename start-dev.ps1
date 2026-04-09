# Script para iniciar el servidor de desarrollo limpiamente
# Detiene todos los procesos de Node existentes y luego inicia npm run dev

Write-Host "🔍 Verificando procesos de Node existentes..." -ForegroundColor Cyan

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️  Encontrados $($nodeProcesses.Count) proceso(s) de Node corriendo" -ForegroundColor Yellow
    Write-Host "🛑 Deteniendo procesos..." -ForegroundColor Yellow
    taskkill /F /IM node.exe 2>&1 | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "✅ Procesos detenidos" -ForegroundColor Green
} else {
    Write-Host "✅ No hay procesos de Node corriendo" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
Write-Host ""

npm run dev
