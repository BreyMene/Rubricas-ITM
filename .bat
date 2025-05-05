@echo off
echo Iniciando MongoDB...
docker compose up -d db

echo Iniciando Web...
@REM start cmd /k "cd Web && npm run build && node .output\server\index.mjs"
start cmd /k "cd Web && npm run dev"

echo Iniciando Backend...
start cmd /k "cd Backend && npm run dev"

echo Todo corriendo en terminales separadas.