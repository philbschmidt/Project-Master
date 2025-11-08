"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const utils_1 = require("./utils");
class Project {
    constructor(projectPath, name, categoryId = 0, workspacePath) {
        this._id = 0;
        this._path = '';
        this._workspacePath = undefined;
        this._name = '';
        this._categoryId = 0;
        this._id = this.getNextId();
        this._path = projectPath;
        this._workspacePath = workspacePath;
        this._name = name;
        this._categoryId = categoryId;
    }
    static getAll() {
        return (0, utils_1.readStorageFile)('projects.json');
    }
    static getOneById(projectId) {
        const projects = Project.getAll();
        return projects.find(project => project._id === projectId);
    }
    static getAllByCategoryId(catId) {
        return Project.getAll().filter(project => project._categoryId === catId);
    }
    static updateById(projectId, updates) {
        const projects = Project.getAll();
        const project = projects.find(p => p._id === projectId);
        if (project) {
            Object.assign(project, updates);
            (0, utils_1.writeStorageFile)('projects.json', projects);
        }
    }
    static deleteById(projectId) {
        const filteredProjects = Project.getAll().filter(project => project._id !== projectId);
        (0, utils_1.writeStorageFile)('projects.json', filteredProjects);
    }
    save() {
        const existingProjects = Project.getAll().filter(project => project._id !== this._id);
        existingProjects.push(this);
        (0, utils_1.writeStorageFile)('projects.json', existingProjects);
    }
    getNextId() {
        const existingProjects = Project.getAll();
        if (existingProjects.length === 0) {
            return 1;
        }
        const maxId = Math.max(...existingProjects.map(project => project._id));
        return maxId + 1;
    }
}
exports.Project = Project;
//# sourceMappingURL=project.js.map