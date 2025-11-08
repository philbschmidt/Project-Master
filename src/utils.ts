import * as fs from 'fs';
import * as path from 'path';
import { extensionContext } from './extension';

export function ensureStorageFile(filename: string): void {
    const storagePath = extensionContext.globalStorageUri.fsPath.toString();
    const filePath = path.join(storagePath, filename);

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
}

export function readStorageFile<T>(filename: string): T[] {
    ensureStorageFile(filename);

    const storagePath = extensionContext?.globalStorageUri?.fsPath;
    if (!storagePath) {
        console.error('Extension context is not initialized.');
        return [];
    }

    const filePath = path.join(storagePath, filename);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as T[];
    } catch (error) {
        const backupPath = filePath + '.corrupt-' + Date.now();

        try {
            fs.copyFileSync(filePath, backupPath);
        } catch { }

        fs.writeFileSync(filePath, '[]');
        console.error(`Failed to parse ${filename}, backup at ${backupPath}:`, error);

        return [];
    }
}

export function writeStorageFile<T>(filename: string, data: T[]): void {
    const storagePath = extensionContext.globalStorageUri.fsPath.toString();
    const filePath = path.join(storagePath, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
