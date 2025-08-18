@echo off
setlocal EnableExtensions EnableDelayedExpansion
echo === BridgeLineUSA: test_all (Node monorepo) ===

REM ---------- BACKEND ----------
if exist backend\package.json (
  echo [backend] installing deps with npm ci...
  pushd backend
  call npm ci || exit /b 1

  echo [backend] running tests if present...
  call npm run test --if-present -- --watchAll=false || exit /b 1

  popd
) else (
  echo [backend] no backend/package.json - skipping backend
)

REM ---------- FRONTEND ----------
if exist frontend\package.json (
  echo [frontend] installing deps with npm ci...
  pushd frontend
  call npm ci || exit /b 1

  echo [frontend] running tests if present...
  call npm run test --if-present -- --watchAll=false || exit /b 1

  echo [frontend] building for sanity...
  call npm run build || exit /b 1
  popd
) else (
  echo [frontend] no frontend/package.json - skipping frontend
)

echo === test_all completed successfully ===
exit /b 0
