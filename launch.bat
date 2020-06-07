@SETLOCAL
@SET DENO_DIR=.
@"%~dp0\lib\deno.exe" run --allow-run --allow-net --allow-read=. --allow-write=. "%~dp0\src\main.ts"
@PAUSE
@ENDLOCAL