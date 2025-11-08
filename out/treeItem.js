"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItem = void 0;
const vscode = require("vscode");
class TreeItem extends vscode.TreeItem {
    constructor(label, children, project, category) {
        const collapsibleState = children === undefined
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Expanded;
        super(label, collapsibleState);
        this.children = children;
        this.project = project;
        this.category = category;
        if (this.project) {
            const isCurrentProject = this.isCurrentProject();
            if (this.project._workspacePath) {
                this.iconPath = new vscode.ThemeIcon('folder-library');
                this.label = `${label} (Workspace)`;
            }
            else {
                this.iconPath = new vscode.ThemeIcon('folder');
            }
            if (isCurrentProject) {
                this.iconPath = new vscode.ThemeIcon('folder-active', new vscode.ThemeColor('terminal.ansiGreen'));
            }
            this.contextValue = 'project';
            this.command = {
                command: 'project-master.openInCurrentWindow',
                title: 'Open Project',
                arguments: [this]
            };
            const pathInfo = this.project._workspacePath ?? this.project._path;
            this.tooltip = `${label}\n${pathInfo}${isCurrentProject ? '\n\n🟢 Currently Active' : ''}`;
        }
        else {
            this.iconPath = new vscode.ThemeIcon('collection');
            this.contextValue = 'category';
            this.tooltip = label;
        }
    }
    isCurrentProject() {
        if (!this.project) {
            return false;
        }
        // Check if workspace file matches
        if (this.project._workspacePath && vscode.workspace.workspaceFile) {
            return this.project._workspacePath === vscode.workspace.workspaceFile.fsPath;
        }
        // Check if folder path matches
        if (this.project._path && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return this.project._path === vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return false;
    }
}
exports.TreeItem = TreeItem;
//# sourceMappingURL=treeItem.js.map