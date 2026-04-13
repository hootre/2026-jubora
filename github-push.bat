@echo off
chcp 65001 > nul
echo ========================================
echo   주보라 사이트 GitHub 업로드
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Git 초기화...
git init
git branch -M main

echo.
echo [2/5] 파일 추가...
git add .

echo.
echo [3/5] 커밋...
git commit -m "주보라 사이트 초기 배포"

echo.
echo [4/5] 원격 저장소 연결...
git remote remove origin 2>nul
git remote add origin https://github.com/hootre/2026-jubora.git

echo.
echo [5/5] GitHub 업로드 중...
git push -u origin main

echo.
echo ========================================
if %errorlevel% == 0 (
    echo   완료! GitHub 업로드 성공!
    echo   https://github.com/hootre/2026-jubora
) else (
    echo   오류가 발생했습니다.
    echo   GitHub 로그인 정보를 확인해주세요.
)
echo ========================================
pause
