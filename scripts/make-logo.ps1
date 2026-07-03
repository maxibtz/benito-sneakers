# Procesa D:\BENITO\LOGO DEF.jpeg y genera los assets del logo:
#  - public/brand/logo-card.png  (recortado, con su fondo navy — para tarjetas/login)
#  - public/brand/logo-mark.png  (fondo transparente — para header/footer)
#  - src/app/icon.png            (la "B" — favicon)
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$srcPath = 'D:\BENITO\LOGO DEF.jpeg'
$brandDir = Join-Path $root 'public\brand'
New-Item -ItemType Directory -Force $brandDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$bg = $src.GetPixel(10, 10)

# --- 1. Detectar el recuadro del contenido (en una copia chica, por velocidad) ---
$small = New-Object System.Drawing.Bitmap($src, 256, 256)
$minX = 256; $minY = 256; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt 256; $y++) {
  for ($x = 0; $x -lt 256; $x++) {
    $p = $small.GetPixel($x, $y)
    $d = [math]::Abs($p.R - $bg.R) + [math]::Abs($p.G - $bg.G) + [math]::Abs($p.B - $bg.B)
    if ($d -gt 60) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$small.Dispose()
$scale = $src.Width / 256.0
$pad = 50
$cx = [int][math]::Max(0, $minX * $scale - $pad)
$cy = [int][math]::Max(0, $minY * $scale - $pad)
$cw = [int][math]::Min($src.Width - $cx, ($maxX - $minX) * $scale + 2 * $pad)
$ch = [int][math]::Min($src.Height - $cy, ($maxY - $minY) * $scale + 2 * $pad)
Write-Output "bbox: x=$cx y=$cy w=$cw h=$ch (bg=$($bg.R),$($bg.G),$($bg.B))"

$rect = New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)
$word = $src.Clone($rect, $src.PixelFormat)

# --- 2. logo-card.png: recortado con fondo, ancho max 1200 ---
$cardW = [math]::Min(1200, $word.Width)
$cardH = [int]($word.Height * $cardW / $word.Width)
$card = New-Object System.Drawing.Bitmap($cardW, $cardH)
$g = [System.Drawing.Graphics]::FromImage($card)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($word, 0, 0, $cardW, $cardH)
$g.Dispose()
$card.Save((Join-Path $brandDir 'logo-card.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$card.Dispose()

# --- 3. logo-mark.png: transparente (chroma key del navy), alto 200 ---
$h = 200
$w = [int]($word.Width * $h / $word.Height)
$rs = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($rs)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($word, 0, 0, $w, $h)
$g.Dispose()
$keyed = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $p = $rs.GetPixel($x, $y)
    $d = [math]::Abs($p.R - $bg.R) + [math]::Abs($p.G - $bg.G) + [math]::Abs($p.B - $bg.B)
    if ($d -lt 45) { $a = 0 }
    elseif ($d -lt 120) { $a = [int](255 * ($d - 45) / 75.0) }
    else { $a = 255 }
    $keyed.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $p.R, $p.G, $p.B))
  }
}
$rs.Dispose()
$keyed.Save((Join-Path $brandDir 'logo-mark.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$keyed.Dispose()

# --- 4. icon.png: la "B" (primer 12% del ancho del contenido, primera linea) ---
# La primera linea ("Benito") ocupa la mitad superior del bbox; la B el inicio.
$bH = [int]($ch * 0.42)
$bW = $bH  # cuadrado
$bX = $cx + [int]($cw * 0.155)
$bY = $cy + [int]($ch * 0.02)
$bRect = New-Object System.Drawing.Rectangle($bX, $bY, $bW, $bH)
$bCrop = $src.Clone($bRect, $src.PixelFormat)
$icon = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($bCrop, 0, 0, 256, 256)
$g.Dispose()
$icon.Save((Join-Path $root 'src\app\icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$icon.Dispose()
$bCrop.Dispose()

$word.Dispose()
$src.Dispose()
Write-Output 'Listo: logo-card.png, logo-mark.png, icon.png'
