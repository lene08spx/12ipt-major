@SETLOCAL
@SET DENO_DIR=.
@"%~dp0\lib\deno-1.2.0.exe" run --reload -A "%~dp0\src\main.ts"
@PAUSE
@ENDLOCAL