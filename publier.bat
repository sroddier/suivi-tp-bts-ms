@echo off
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  set "MSG=Mise a jour du site"
) else (
  set "MSG=%*"
)

git add -A
git diff --cached --quiet
if %ERRORLEVEL%==0 (
  echo Rien a publier : aucun fichier modifie.
  pause
  exit /b 0
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo Echec du commit.
  pause
  exit /b 1
)

git push
if errorlevel 1 (
  echo Echec du push. Verifiez la connexion GitHub ^(gh auth login^).
  pause
  exit /b 1
)

echo.
echo Publie. Le site en ligne se met a jour en environ 1 minute.
echo Pensez a rafraichir avec Ctrl+F5.
echo.
pause
