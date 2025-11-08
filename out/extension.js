"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionContext = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const treeDataProvider_1 = require("./treeDataProvider");
const project_1 = require("./project");
const category_1 = require("./category");
let treeDataProvider;
function activate(context) {
    exports.extensionContext = context;
    treeDataProvider = new treeDataProvider_1.TreeDataProvider();
    vscode.window.registerTreeDataProvider('projectLibraryTreeView', treeDataProvider);
    context.subscriptions.push(vscode.commands.registerCommand('project-library.addProject', (item) => {
        let parentCategoryId = undefined;
        if (item && typeof item === 'object') {
            if ('category' in item && item.category) {
                parentCategoryId = item.category._id;
            }
            else if ('project' in item && item.project) {
                parentCategoryId = item.project._categoryId;
            }
        }
        createProjectEntry(parentCategoryId);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.addCategory', (item) => {
        let parentCategoryId = 0;
        if (item && typeof item === 'object') {
            if ('category' in item && item.category) {
                parentCategoryId = item.category._id;
            }
            else if ('project' in item && item.project) {
                parentCategoryId = item.project._categoryId;
            }
        }
        createCategoryEntry(parentCategoryId);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.addCategoryRoot', () => {
        createCategoryEntry(0);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.collapseAll', () => {
        vscode.commands.executeCommand('workbench.actions.treeView.projectLibraryTreeView.collapseAll');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.editEntry', (item) => {
        if (item.category !== undefined) {
            editCategoryEntry(item.category._id);
        }
        else if (item.project !== undefined) {
            editProjectEntry(item.project._id);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.deleteEntry', (item) => {
        if (item.category !== undefined) {
            category_1.Category.deleteById(item.category._id);
            treeDataProvider.refresh();
        }
        else if (item.project !== undefined) {
            project_1.Project.deleteById(item.project._id);
            treeDataProvider.refresh();
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.openInNewWindow', (item) => {
        if (item.project === undefined) {
            vscode.window.showErrorMessage('No project selected.');
            return;
        }
        let targetUri;
        if (item.project._workspacePath) {
            targetUri = vscode.Uri.file(item.project._workspacePath);
        }
        else if (item.project._path) {
            targetUri = vscode.Uri.file(item.project._path);
        }
        else {
            vscode.window.showErrorMessage('Project path is not defined.');
            return;
        }
        vscode.commands.executeCommand('vscode.openFolder', targetUri, {
            forceNewWindow: true
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('project-library.openInCurrentWindow', (arg) => {
        let project;
        if (arg && typeof arg === 'object' && 'project' in arg && arg.project) {
            project = project_1.Project.getOneById(arg.project._id);
        }
        else if (typeof arg === 'number') {
            project = project_1.Project.getOneById(arg);
        }
        if (!project) {
            vscode.window.showErrorMessage('No project selected.');
            return;
        }
        let targetUri;
        if (project._workspacePath) {
            targetUri = vscode.Uri.file(project._workspacePath);
        }
        else if (project._path) {
            targetUri = vscode.Uri.file(project._path);
        }
        else {
            vscode.window.showErrorMessage('Project path is not defined.');
            return;
        }
        vscode.commands.executeCommand('vscode.openFolder', targetUri);
    }));
}
function deactivate() { }
async function createProjectEntry(defaultCategoryId) {
    let projectPath = undefined;
    let workspacePath = undefined;
    if (vscode.workspace.name && vscode.workspace.workspaceFile) {
        workspacePath = vscode.workspace.workspaceFile.fsPath;
    }
    else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    else {
        vscode.window.showErrorMessage('A folder or workspace must be open to save a project.');
        return;
    }
    const projectNameInput = await vscode.window.showInputBox({
        placeHolder: 'Name',
        prompt: 'Please enter a name for the new project.'
    });
    if (!projectNameInput || projectNameInput.trim() === '') {
        vscode.window.showErrorMessage('A name for the project is required.');
        return;
    }
    let parentCategoryId = 0;
    if (defaultCategoryId && defaultCategoryId > 0) {
        parentCategoryId = defaultCategoryId;
    }
    else {
        const treeStrings = category_1.Category.getTreeStrings();
        const ROOT_LABEL = '$(root-folder) Root';
        const items = [
            { label: ROOT_LABEL, id: 0 },
            ...treeStrings.map(ts => ({ label: ts._string, id: ts._categoryId }))
        ];
        const picked = await vscode.window.showQuickPick(items, {
            title: 'Please select a category or leave empty.'
        });
        parentCategoryId = picked?.id ?? 0;
    }
    const projectEntry = new project_1.Project(projectPath ?? '', projectNameInput.trim(), parentCategoryId, workspacePath);
    projectEntry.save();
    treeDataProvider.refresh();
}
async function editProjectEntry(projectId) {
    const project = project_1.Project.getOneById(projectId);
    if (project === undefined) {
        vscode.window.showErrorMessage('Project not found.');
        return;
    }
    const projectNameInput = await vscode.window.showInputBox({
        placeHolder: 'Name',
        prompt: 'Please enter a new name for the project.',
        value: project._name
    });
    if (projectNameInput === undefined) {
        return;
    }
    if (projectNameInput === '') {
        vscode.window.showErrorMessage('A name for the project is required.');
        return;
    }
    const treeStrings = category_1.Category.getTreeStrings();
    const ROOT_LABEL = '$(root-folder) Root';
    const items = [
        { label: ROOT_LABEL, id: 0 },
        ...treeStrings.map(ts => ({ label: ts._string, id: ts._categoryId }))
    ];
    const picked = await vscode.window.showQuickPick(items, {
        title: 'Please enter a new category name or leave it empty for not categorizing the project.'
    });
    if (picked === undefined) {
        return;
    }
    const parentCategoryId = picked.id;
    project_1.Project.updateById(projectId, {
        _name: projectNameInput,
        _categoryId: parentCategoryId
    });
    treeDataProvider.refresh();
}
async function createCategoryEntry(defaultParentCategoryId) {
    const categoryNameInput = await vscode.window.showInputBox({
        placeHolder: 'Name',
        prompt: 'Please enter a name for the new category.'
    });
    if (categoryNameInput === undefined) {
        return;
    }
    if (categoryNameInput === '') {
        vscode.window.showErrorMessage('A name for the category is required.');
        return;
    }
    const parentCategoryId = defaultParentCategoryId ?? 0;
    const categoryEntry = new category_1.Category(categoryNameInput, parentCategoryId);
    categoryEntry.save();
    treeDataProvider.refresh();
}
async function editCategoryEntry(categoryId) {
    const category = category_1.Category.getOneById(categoryId);
    if (category === undefined) {
        vscode.window.showErrorMessage('Category not found.');
        return;
    }
    const categoryNameInput = await vscode.window.showInputBox({
        placeHolder: 'Name',
        prompt: 'Please enter a new name for the category.',
        value: category._name
    });
    if (categoryNameInput === undefined) {
        return;
    }
    if (categoryNameInput === '') {
        vscode.window.showErrorMessage('A name for the category is required.');
        return;
    }
    const treeStrings = category_1.Category.getTreeStrings();
    const ROOT_LABEL = '$(root-folder) Root';
    const items = [
        { label: ROOT_LABEL, id: 0 },
        ...treeStrings.map(ts => ({ label: ts._string, id: ts._categoryId }))
    ];
    const picked = await vscode.window.showQuickPick(items, {
        title: 'Please enter a new parent category name or leave it empty for no parent category.'
    });
    const parentCategoryId = picked?.id ?? 0;
    if (parentCategoryId === categoryId) {
        vscode.window.showErrorMessage('A category cannot be its own parent.');
        return;
    }
    if (parentCategoryId !== 0 && category_1.Category.isDescendant(categoryId, parentCategoryId)) {
        vscode.window.showErrorMessage('A category cannot be assigned to one of its own descendants.');
        return;
    }
    category_1.Category.updateById(categoryId, {
        _name: categoryNameInput,
        _parentId: parentCategoryId
    });
    treeDataProvider.refresh();
}
//# sourceMappingURL=extension.js.map