"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureStorageFile = ensureStorageFile;
exports.readStorageFile = readStorageFile;
exports.writeStorageFile = writeStorageFile;
const fs = require("fs");
const path = require("path");
const extension_1 = require("./extension");
function ensureStorageFile(filename) {
    const storagePath = extension_1.extensionContext.globalStorageUri.fsPath.toString();
    const filePath = path.join(storagePath, filename);
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
}
function readStorageFile(filename) {
    ensureStorageFile(filename);
    const storagePath = extension_1.extensionContext?.globalStorageUri?.fsPath;
    if (!storagePath) {
        console.error('Extension context is not initialized.');
        return [];
    }
    const filePath = path.join(storagePath, filename);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        const backupPath = filePath + '.corrupt-' + Date.now();
        try {
            fs.copyFileSync(filePath, backupPath);
        }
        catch { }
        fs.writeFileSync(filePath, '[]');
        console.error(`Failed to parse ${filename}, backup at ${backupPath}:`, error);
        return [];
    }
}
function writeStorageFile(filename, data) {
    const storagePath = extension_1.extensionContext.globalStorageUri.fsPath.toString();
    const filePath = path.join(storagePath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
//# sourceMappingURL=utils.js.map