"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeDataProvider = void 0;
const vscode = require("vscode");
const category_1 = require("./category");
class TreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.data = [];
        this.data = category_1.Category.getTreeItemsWithProjects();
    }
    refresh() {
        this.data = category_1.Category.getTreeItemsWithProjects();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.data;
        }
        if ('children' in element) {
            return element.children;
        }
        return undefined;
    }
}
exports.TreeDataProvider = TreeDataProvider;
//# sourceMappingURL=treeDataProvider.js.map