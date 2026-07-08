@echo off
title COSMOS - local server
cd /d "%~dp0"
start "" http://localhost:4173
node local-server.js
pause
