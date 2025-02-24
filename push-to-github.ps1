# PowerShell script to push to GitHub
Write-Host "Setting up remote..."
git remote set-url origin https://github.com/jpvigop/urudata.git

Write-Host "Pushing to GitHub..."
git push -u origin master

Write-Host "Done!" 