#!/bin/bash

echo "Iniciando AppSemillero..."
echo

echo "Instalando dependencias..."
npm run install-all

echo
echo "Iniciando servidor y cliente..."
npm run dev
