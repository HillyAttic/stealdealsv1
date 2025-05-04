# PowerShell script to set up Vercel environment variables

Write-Host "Setting up environment variables on Vercel..." -ForegroundColor Green

# Array of environment variables
$envVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

# Read .env.local file
$envContent = Get-Content .env.local

# Loop through and add each environment variable
foreach ($var in $envVars) {
    Write-Host "Adding $var to Vercel..." -ForegroundColor Cyan
    $envLine = $envContent | Where-Object { $_ -match "^$var=" }
    
    if ($envLine) {
        $value = $envLine.Split("=", 2)[1]
        Write-Host "Found value for $var" -ForegroundColor Green
        
        # Run vercel command to add environment variable
        vercel env add $var $value
    } else {
        Write-Host "Warning: $var not found in .env.local" -ForegroundColor Yellow
    }
}

Write-Host "Environment setup complete! Please deploy your project again." -ForegroundColor Green 