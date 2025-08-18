@echo off
setlocal EnableExtensions EnableDelayedExpansion
echo === BridgeLineUSA: test_all (Node monorepo) ===

REM ---------- BACKEND ----------
if exist backend\package.json (
  echo [backend] installing deps with npm ci...
  pushd backend
  call npm ci || exit /b 1

  REM Detect if a "test" script exists; if yes, run it; else skip.
  for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command ^
    "$p=Get-Content package.json -Raw | ConvertFrom-Json; if($p.scripts -and $p.scripts.PSObject.Properties.Name -contains 'test'){exit 0}else{exit 1}"`) do set HAS_TEST=%%A

  if "!ERRORLEVEL!"=="0" (
    echo [backend] running tests...
    call npm test -- --watchAll=false || exit /b 1
  ) else (
    echo [backend] no test script found - skipping tests
  )
  popd
) else (
  echo [backend] no backend/package.json - skipping backend
)

REM ---------- FRONTEND ----------
if exist frontend\package.json (
  echo [frontend] installing deps with npm ci...
  pushd frontend
  call npm ci || exit /b 1

  REM Detect if a "test" script exists; if yes, run it; else skip.
  for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command ^
    "$p=Get-Content package.json -Raw | ConvertFrom-Json; if($p.scripts -and $p.scripts.PSObject.Properties.Name -contains 'test'){exit 0}else{exit 1}"`) do set HAS_TEST=%%A

  if "!ERRORLEVEL!"=="0" (
    echo [frontend] running tests...
    call npm test -- --watchAll=false || exit /b 1
  ) else (
    echo [frontend] no test script found - skipping tests
  )

  echo [frontend] building for sanity...
  call npm run build || exit /b 1
  popd
) else (
  echo [frontend] no frontend/package.json - skipping frontend
)

echo === test_all completed successfully ===
exit /b 0
