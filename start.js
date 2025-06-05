#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск туристичної платформи...\n');

// Функція для запуску команди
const runCommand = (command, args, cwd, name) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: 'pipe',
            shell: true
        });

        child.stdout.on('data', (data) => {
            console.log(`[${name}] ${data.toString().trim()}`);
        });

        child.stderr.on('data', (data) => {
            console.error(`[${name}] ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${name} завершився з кодом ${code}`));
            } else {
                resolve();
            }
        });

        child.on('error', (error) => {
            reject(error);
        });

        return child;
    });
};

// Функція для перевірки існування файлів
const checkFile = (filePath, description) => {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Файл не знайдено: ${description} (${filePath})`);
        return false;
    }
    console.log(`✅ Знайдено: ${description}`);
    return true;
};

// Перевірка структури проекту
console.log('🔍 Перевірка структури проекту...');
const checks = [
    checkFile('backend/package.json', 'Backend package.json'),
    checkFile('backend/.env', 'Backend .env файл'),
    checkFile('frontend/package.json', 'Frontend package.json'),
    checkFile('frontend/.env', 'Frontend .env файл')
];

if (!checks.every(Boolean)) {
    console.error('\n❌ Деякі файли відсутні. Перевірте структуру проекту.');
    process.exit(1);
}

console.log('\n✅ Структура проекту правильна');

// Запуск бекенду та фронтенду
async function startServices() {
    try {
        console.log('\n🔧 Запуск бекенду...');
        const backend = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: 'pipe',
            shell: true
        });

        backend.stdout.on('data', (data) => {
            console.log(`[BACKEND] ${data.toString().trim()}`);
        });

        backend.stderr.on('data', (data) => {
            console.error(`[BACKEND] ${data.toString().trim()}`);
        });

        // Чекаємо трохи, щоб бекенд встиг запуститися
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n⚛️  Запуск фронтенду...');
        const frontend = spawn('npm', ['start'], {
            cwd: path.join(__dirname, 'frontend'),
            stdio: 'pipe',
            shell: true
        });

        frontend.stdout.on('data', (data) => {
            console.log(`[FRONTEND] ${data.toString().trim()}`);
        });

        frontend.stderr.on('data', (data) => {
            console.error(`[FRONTEND] ${data.toString().trim()}`);
        });

        // Обробка завершення процесів
        process.on('SIGINT', () => {
            console.log('\n🛑 Зупинка сервісів...');
            backend.kill();
            frontend.kill();
            process.exit(0);
        });

        console.log('\n🎉 Сервіси запущені!');
        console.log('📍 Backend: http://localhost:5000');
        console.log('📍 Frontend: http://localhost:3000');
        console.log('\nНатисніть Ctrl+C для зупинки');

    } catch (error) {
        console.error('❌ Помилка запуску:', error.message);
        process.exit(1);
    }
}

startServices();