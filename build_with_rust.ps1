$env:PATH += ";C:\Users\kaoha\.cargo\bin"
Write-Host "Added Cargo to PATH. Verifying..."
cargo --version
if ($?) {
    Write-Host "Cargo detected. Starting Tauri Build..."
    npm run tauri build
} else {
    Write-Error "Cargo still not found even after PATH update."
}
