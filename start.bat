@echo off
echo ========================================
echo   EMP Vben Admin - 启动脚本
echo ========================================
echo.

echo [1/2] 检查依赖...
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    call pnpm install
) else (
    echo 依赖已安装
)

echo.
echo [2/2] 启动开发服务器...
echo 项目将在 http://localhost:3000 启动
echo.

call pnpm dev
