$env:PATH += ";C:\Users\kaoha\.cargo\bin"
Write-Host "Added Cargo to PATH. Verifying..."
cargo --version
if ($?) {
    Write-Host "Cargo detected. Starting Tauri Dev Server..."
    npm run tauri dev
}
else {
    Write-Error "Cargo still not found."
}
