Add-Type -AssemblyName PresentationCore, WindowsBase
$webpPath = 'c:\Users\samue\Downloads\projects\abhanav-website\public\Untitled design (31).webp'
$pngPath = 'c:\Users\samue\Downloads\projects\abhanav-website\apk\assets\images\icon.png'

if (!(Test-Path -Path 'c:\Users\samue\Downloads\projects\abhanav-website\apk\assets\images')) {
    New-Item -ItemType Directory -Path 'c:\Users\samue\Downloads\projects\abhanav-website\apk\assets\images' -Force
}

$inputStream = [System.IO.File]::OpenRead($webpPath)
try {
    # Specify the WebP decoder explicitly if needed, but often Create() picks it up if the codec is installed.
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($inputStream, [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add($decoder.Frames[0])
    
    $outputStream = [System.IO.File]::OpenWrite($pngPath)
    $encoder.Save($outputStream)
    $outputStream.Close()
} finally {
    $inputStream.Close()
}
