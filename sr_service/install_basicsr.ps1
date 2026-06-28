$ErrorActionPreference = "Stop"
$pip = "d:\Rental Property - Copy\sr_service\venv\Scripts\pip.exe"
$tempDir = "$env:TEMP\basicsr_dl2"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Set-Location $tempDir

# Download directly using curl/Invoke-WebRequest to avoid pip triggering egg_info
Invoke-WebRequest -Uri "https://files.pythonhosted.org/packages/source/b/basicsr/basicsr-1.4.2.tar.gz" -OutFile "basicsr-1.4.2.tar.gz"

tar -xzf basicsr-1.4.2.tar.gz
Set-Location basicsr-1.4.2

# Patch setup.py
$setupPath = "setup.py"
$content = Get-Content $setupPath
$content = $content -replace "version=get_version\(\),", "version='1.4.2',"
Set-Content -Path $setupPath -Value $content

# Install the patched package
& $pip install .

# Now go back and install the rest of requirements
Set-Location "d:\Rental Property - Copy\sr_service"
& $pip install flask==3.0.0 realesrgan==0.3.0 gfpgan==1.3.8 facexlib==0.3.0 opencv-python-headless==4.8.1.78 torch==2.1.0 torchvision==0.16.0 Pillow==10.1.0 mediapipe==0.10.7 numpy==1.26.2 werkzeug==3.0.1
