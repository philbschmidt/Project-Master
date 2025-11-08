import * as vscode from 'vscode';
import { TreeItem } from './treeItem';
import { Category } from './category';

export class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private data: TreeItem[] = [];

    constructor() {
        this.data = Category.getTreeItemsWithProjects();
    }

    refresh(): void {
        this.data = Category.getTreeItemsWithProjects();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return this.data;
        }

        if ('children' in element) {
            return (element as TreeItem).children;
        }

        return undefined;
    }
}
