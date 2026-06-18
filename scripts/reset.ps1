# Réinitialisation manuelle HealthAI — base de données, MongoDB et stockage.
# Usage : .\scripts\reset.ps1
# Options : -Confirm -FullVolumes -Seed -SkipCloudinary

param(
    [switch]$Confirm,
    [switch]$FullVolumes,
    [switch]$Seed,
    [switch]$SkipCloudinary
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

if (-not $Confirm) {
    Write-Host ""
    Write-Host "ATTENTION — Cette opération va :" -ForegroundColor Yellow
    Write-Host "  - Vider toutes les tables PostgreSQL (schéma healthai)"
    Write-Host "  - Supprimer la base MongoDB healthai_ai (recommandations IA)"
    Write-Host "  - Effacer les exports locaux (data/cleaned/)"
    if (-not $SkipCloudinary) {
        Write-Host "  - Purger les médias Cloudinary (dossier healthai/) si les clés API sont configurées"
    }
    if ($FullVolumes) {
        Write-Host "  - Supprimer les volumes Docker (réinitialisation complète)" -ForegroundColor Red
    }
    Write-Host ""
    $answer = Read-Host "Tapez RESET pour confirmer"
    if ($answer -ne "RESET") {
        Write-Host "Annulé." -ForegroundColor Gray
        exit 0
    }
}

Write-Step "Vérification de Docker Compose"
docker compose version | Out-Null

if ($FullVolumes) {
    Write-Step "Arrêt et suppression des volumes Docker"
    docker compose down -v
    Write-Step "Redémarrage des services"
    docker compose up -d --build
    Write-Host "Attente du démarrage (15 s)…"
    Start-Sleep -Seconds 15
    Write-Step "Création du schéma PostgreSQL"
    docker compose exec -T db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;"
} else {
    Write-Step "Démarrage des services nécessaires (db, mongo, api)"
    docker compose up -d db mongo api
    Write-Host "Attente du démarrage (8 s)…"
    Start-Sleep -Seconds 8
    docker compose exec -T db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;" 2>$null
}

Write-Step "Réinitialisation PostgreSQL"
docker compose exec -T api python -m healthai.scripts.reset --db --confirm

Write-Step "Réinitialisation MongoDB"
docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('healthai_ai').dropDatabase()"

Write-Step "Réinitialisation du stockage (exports + Cloudinary)"
if ($SkipCloudinary) {
    docker compose exec -T api python -m healthai.scripts.reset --storage --confirm --skip-cloudinary
} else {
    docker compose exec -T api python -m healthai.scripts.reset --storage --confirm
}

if (Test-Path "data\cleaned") {
    Write-Step "Nettoyage des exports sur l'hôte (data/cleaned/)"
    Get-ChildItem "data\cleaned" -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

if ($Seed) {
    Write-Step "Réimport des données ETL"
    docker compose exec -T api python -m healthai.etl.run_pipeline
}

Write-Host ""
Write-Host "Réinitialisation terminée." -ForegroundColor Green
Write-Host "Note : les comptes locaux (localStorage / app mobile) ne sont pas effacés." -ForegroundColor Gray
Write-Host "       Videz le cache du navigateur ou réinstallez l'app si besoin." -ForegroundColor Gray
