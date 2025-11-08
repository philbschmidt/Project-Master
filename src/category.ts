import { Project } from './project';
import { TreeItem } from './treeItem';
import { TreeString } from './treeString';
import { readStorageFile, writeStorageFile } from './utils';

export class Category {
    _id: number;
    _parentId: number;
    _name: string;
    children: Array<Category>;

    constructor(name: string, parentId: number) {
        this._id = this.getNextId();
        this._parentId = parentId;
        this._name = name;
        this.children = [];
    }

    public static getAll(): Category[] {
        return readStorageFile<Category>('categories.json');
    }

    public static getOneById(categoryId: number): Category | undefined {
        const categories = Category.getAll();
        return categories.find(category => category._id === categoryId);
    }

    public static getTreeStrings(): Array<TreeString> {
        const categories = Category.getAll();
        const treeStrings = categories.map(category =>
            new TreeString(Category.createArrowName(category, categories), category._id)
        );

        treeStrings.sort((a, b) => a._string.localeCompare(b._string, undefined, { sensitivity: 'base' }));

        return treeStrings;
    }

    public static getTreeItemsWithProjects() {
        const categoryTree = Category.makeTree(Category.getAll());
        const categoryItems = categoryTree.map(category => Category.createTreeItem(category));
        const uncategorizedProjects = Project.getAllByCategoryId(0)
            .sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }))
            .map(project => new TreeItem(project._name, undefined, project));

        return [...categoryItems, ...uncategorizedProjects];
    }

    public static deleteById(categoryId: number): void {
        const allCategories = Category.getAll();

        allCategories
            .filter(category => category._parentId === categoryId)
            .forEach(category => {
                category._parentId = 0;
            });

        const filteredCategories = allCategories
            .filter(category => category._id !== categoryId);

        writeStorageFile('categories.json', filteredCategories);

        Project.getAll()
            .filter(project => project._categoryId === categoryId)
            .forEach(project => {
                project._categoryId = 0;
                Project.updateById(project._id, { _categoryId: 0 });
            });
    }

    public static updateById(categoryId: number, updates: Partial<Pick<Category, '_name' | '_parentId'>>): void {
        const categories = Category.getAll();
        const category = categories.find(c => c._id === categoryId);

        if (category) {
            Object.assign(category, updates);
            writeStorageFile('categories.json', categories);
        }
    }

    public static isDescendant(categoryId: number, potentialDescendantId: number): boolean {
        const categories = Category.getAll();
        const potentialDescendant = categories.find(cat => cat._id === potentialDescendantId);

        if (!potentialDescendant) {
            return false;
        }

        let current = potentialDescendant;
        const visited = new Set<number>();

        while (current._parentId !== 0) {
            if (current._parentId === categoryId) {
                return true;
            }

            if (visited.has(current._id)) {
                break;
            }
            visited.add(current._id);

            const parent = categories.find(cat => cat._id === current._parentId);
            if (!parent) {
                break;
            }
            current = parent;
        }

        return false;
    }

    save() {
        const existingCategories = Category.getAll()
            .filter(category => category._id !== this._id);
        existingCategories.push(this);
        writeStorageFile('categories.json', existingCategories);
    }

    private static createArrowName(category: Category, categories: Array<Category>, visited: Set<number> = new Set()): string {
        if (visited.has(category._id)) {
            return category._name;
        }

        visited.add(category._id);

        if (category._parentId === 0) {
            return category._name;
        }

        const parent = categories.find(cat => cat._id === category._parentId);

        if (!parent) {
            return category._name;
        }

        return `${Category.createArrowName(parent, categories, visited)} > ${category._name}`;
    }

    private static makeTree(categoryNodes: Category[]): Category[] {
        const nodesMap = new Map(
            categoryNodes.map(node => [node._id, node])
        );

        const rootCategories: Category[] = [];

        categoryNodes.forEach(node => {
            if (node._parentId === 0) {
                rootCategories.push(node);
            } else {
                const parent = nodesMap.get(node._parentId);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(node);
                }
            }
        });

        Category.sortCategoryTree(rootCategories);
        return rootCategories;
    }

    private static sortCategoryTree(categories: Category[]): void {
        categories.sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }));
        categories.forEach(cat => {
            if (cat.children && cat.children.length > 0) {
                Category.sortCategoryTree(cat.children);
            }
        });
    }

    private static createTreeItem(category: Category): TreeItem {
        const categoryChildren = category.children?.map(child =>
            Category.createTreeItem(child)) ?? [];

        const projectChildren = Project.getAllByCategoryId(category._id)
            .sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }))
            .map(project => new TreeItem(project._name, undefined, project));

        const allChildren = [...categoryChildren, ...projectChildren];

        return new TreeItem(category._name, allChildren, undefined, category);
    }

    private getNextId(): number {
        const existingCategories = Category.getAll();

        if (existingCategories.length === 0) {
            return 1;
        }

        const maxId = Math.max(...existingCategories.map(category => category._id));
        return maxId + 1;
    }
}
