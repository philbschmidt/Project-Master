import * as vscode from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
import { Project } from './project';
import { Category } from './category';

export let extensionContext: vscode.ExtensionContext;
let treeDataProvider: TreeDataProvider;

export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;
    treeDataProvider = new TreeDataProvider();

    vscode.window.registerTreeDataProvider('projectMasterTreeView', treeDataProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.addProject', (item?: any) => {
            let parentCategoryId: number | undefined = undefined;
            if (item && typeof item === 'object') {
                if ('category' in item && item.category) {
                    parentCategoryId = item.category._id;
                } else if ('project' in item && item.project) {
                    parentCategoryId = item.project._categoryId;
                }
            }
            createProjectEntry(parentCategoryId);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.addCategory', (item?: any) => {
            let parentCategoryId: number = 0;

            if (item && typeof item === 'object') {
                if ('category' in item && item.category) {
                    parentCategoryId = item.category._id;
                } else if ('project' in item && item.project) {
                    parentCategoryId = item.project._categoryId;
                }
            }

            createCategoryEntry(parentCategoryId);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.addCategoryRoot', () => {
            createCategoryEntry(0);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.collapseAll', () => {
            vscode.commands.executeCommand('workbench.actions.treeView.projectMasterTreeView.collapseAll');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.editEntry', (item) => {
            if (item.category !== undefined) {
                editCategoryEntry(item.category._id);
            } else if (item.project !== undefined) {
                editProjectEntry(item.project._id);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.deleteEntry', (item) => {
            if (item.category !== undefined) {
                Category.deleteById(item.category._id);
                treeDataProvider.refresh();
            } else if (item.project !== undefined) {
                Project.deleteById(item.project._id);
                treeDataProvider.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.openInNewWindow', (item) => {
            if (item.project === undefined) {
                vscode.window.showErrorMessage('No project selected.');
                return;
            }

            let targetUri: vscode.Uri;
            if (item.project._workspacePath) {
                targetUri = vscode.Uri.file(item.project._workspacePath);
            } else if (item.project._path) {
                targetUri = vscode.Uri.file(item.project._path);
            } else {
                vscode.window.showErrorMessage('Project path is not defined.');
                return;
            }

            vscode.commands.executeCommand('vscode.openFolder', targetUri, {
                forceNewWindow: true
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('project-master.openInCurrentWindow', (arg) => {
            let project: Project | undefined;
            if (arg && typeof arg === 'object' && 'project' in arg && arg.project) {
                project = Project.getOneById(arg.project._id);
            } else if (typeof arg === 'number') {
                project = Project.getOneById(arg);
            }

            if (!project) {
                vscode.window.showErrorMessage('No project selected.');
                return;
            }

            let targetUri: vscode.Uri;
            if (project._workspacePath) {
                targetUri = vscode.Uri.file(project._workspacePath);
            } else if (project._path) {
                targetUri = vscode.Uri.file(project._path);
            } else {
                vscode.window.showErrorMessage('Project path is not defined.');
                return;
            }

            vscode.commands.executeCommand('vscode.openFolder', targetUri);
        })
    );
}

export function deactivate() { }

async function createProjectEntry(defaultCategoryId?: number) {
    let projectPath: string | undefined = undefined;
    let workspacePath: string | undefined = undefined;

    if (vscode.workspace.name && vscode.workspace.workspaceFile) {
        workspacePath = vscode.workspace.workspaceFile.fsPath;
    } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
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
    } else {
        const treeStrings = Category.getTreeStrings();
        const ROOT_LABEL = '$(root-folder) Root';
        const items: Array<vscode.QuickPickItem & { id: number }> = [
            { label: ROOT_LABEL, id: 0 },
            ...treeStrings.map(ts => ({ label: ts._string, id: ts._categoryId }))
        ];
        const picked = await vscode.window.showQuickPick(items, {
            title: 'Please select a category or leave empty.'
        });
        parentCategoryId = picked?.id ?? 0;
    }

    const projectEntry = new Project(projectPath ?? '', projectNameInput.trim(), parentCategoryId, workspacePath);
    projectEntry.save();
    treeDataProvider.refresh();
}

async function editProjectEntry(projectId: number) {
    const project = Project.getOneById(projectId);

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

    const treeStrings = Category.getTreeStrings();
    const ROOT_LABEL = '$(root-folder) Root';
    const items: Array<vscode.QuickPickItem & { id: number }> = [
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

    Project.updateById(projectId, {
        _name: projectNameInput,
        _categoryId: parentCategoryId
    });
    treeDataProvider.refresh();
}

async function createCategoryEntry(defaultParentCategoryId?: number) {
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
    const categoryEntry = new Category(categoryNameInput, parentCategoryId);
    categoryEntry.save();
    treeDataProvider.refresh();
}

async function editCategoryEntry(categoryId: number) {
    const category = Category.getOneById(categoryId);

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

    const treeStrings = Category.getTreeStrings();
    const ROOT_LABEL = '$(root-folder) Root';
    const items: Array<vscode.QuickPickItem & { id: number }> = [
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

    if (parentCategoryId !== 0 && Category.isDescendant(categoryId, parentCategoryId)) {
        vscode.window.showErrorMessage('A category cannot be assigned to one of its own descendants.');
        return;
    }

    Category.updateById(categoryId, {
        _name: categoryNameInput,
        _parentId: parentCategoryId
    });
    treeDataProvider.refresh();
}
