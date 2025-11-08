"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const project_1 = require("./project");
const treeItem_1 = require("./treeItem");
const treeString_1 = require("./treeString");
const utils_1 = require("./utils");
class Category {
    constructor(name, parentId) {
        this._id = this.getNextId();
        this._parentId = parentId;
        this._name = name;
        this.children = [];
    }
    static getAll() {
        return (0, utils_1.readStorageFile)('categories.json');
    }
    static getOneById(categoryId) {
        const categories = Category.getAll();
        return categories.find(category => category._id === categoryId);
    }
    static getTreeStrings() {
        const categories = Category.getAll();
        const treeStrings = categories.map(category => new treeString_1.TreeString(Category.createArrowName(category, categories), category._id));
        treeStrings.sort((a, b) => a._string.localeCompare(b._string, undefined, { sensitivity: 'base' }));
        return treeStrings;
    }
    static getTreeItemsWithProjects() {
        const categoryTree = Category.makeTree(Category.getAll());
        const categoryItems = categoryTree.map(category => Category.createTreeItem(category));
        const uncategorizedProjects = project_1.Project.getAllByCategoryId(0)
            .sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }))
            .map(project => new treeItem_1.TreeItem(project._name, undefined, project));
        return [...categoryItems, ...uncategorizedProjects];
    }
    static deleteById(categoryId) {
        const allCategories = Category.getAll();
        allCategories
            .filter(category => category._parentId === categoryId)
            .forEach(category => {
            category._parentId = 0;
        });
        const filteredCategories = allCategories
            .filter(category => category._id !== categoryId);
        (0, utils_1.writeStorageFile)('categories.json', filteredCategories);
        project_1.Project.getAll()
            .filter(project => project._categoryId === categoryId)
            .forEach(project => {
            project._categoryId = 0;
            project_1.Project.updateById(project._id, { _categoryId: 0 });
        });
    }
    static updateById(categoryId, updates) {
        const categories = Category.getAll();
        const category = categories.find(c => c._id === categoryId);
        if (category) {
            Object.assign(category, updates);
            (0, utils_1.writeStorageFile)('categories.json', categories);
        }
    }
    static isDescendant(categoryId, potentialDescendantId) {
        const categories = Category.getAll();
        const potentialDescendant = categories.find(cat => cat._id === potentialDescendantId);
        if (!potentialDescendant) {
            return false;
        }
        let current = potentialDescendant;
        const visited = new Set();
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
        (0, utils_1.writeStorageFile)('categories.json', existingCategories);
    }
    static createArrowName(category, categories, visited = new Set()) {
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
    static makeTree(categoryNodes) {
        const nodesMap = new Map(categoryNodes.map(node => [node._id, node]));
        const rootCategories = [];
        categoryNodes.forEach(node => {
            if (node._parentId === 0) {
                rootCategories.push(node);
            }
            else {
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
    static sortCategoryTree(categories) {
        categories.sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }));
        categories.forEach(cat => {
            if (cat.children && cat.children.length > 0) {
                Category.sortCategoryTree(cat.children);
            }
        });
    }
    static createTreeItem(category) {
        const categoryChildren = category.children?.map(child => Category.createTreeItem(child)) ?? [];
        const projectChildren = project_1.Project.getAllByCategoryId(category._id)
            .sort((a, b) => a._name.localeCompare(b._name, undefined, { sensitivity: 'base' }))
            .map(project => new treeItem_1.TreeItem(project._name, undefined, project));
        const allChildren = [...categoryChildren, ...projectChildren];
        return new treeItem_1.TreeItem(category._name, allChildren, undefined, category);
    }
    getNextId() {
        const existingCategories = Category.getAll();
        if (existingCategories.length === 0) {
            return 1;
        }
        const maxId = Math.max(...existingCategories.map(category => category._id));
        return maxId + 1;
    }
}
exports.Category = Category;
//# sourceMappingURL=category.js.map