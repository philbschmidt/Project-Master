import { readStorageFile, writeStorageFile } from './utils';

export class Project {
    _id: number = 0;
    _path: string = '';
    _workspacePath?: string = undefined;
    _name: string = '';
    _categoryId: number = 0;

    constructor(projectPath: string, name: string, categoryId: number = 0, workspacePath?: string) {
        this._id = this.getNextId();
        this._path = projectPath;
        this._workspacePath = workspacePath;
        this._name = name;
        this._categoryId = categoryId;
    }

    public static getAll(): Project[] {
        return readStorageFile<Project>('projects.json');
    }

    public static getOneById(projectId: number): Project | undefined {
        const projects = Project.getAll();
        return projects.find(project => project._id === projectId);
    }

    public static getAllByCategoryId(catId: number): Project[] {
        return Project.getAll().filter(project => project._categoryId === catId);
    }

    public static updateById(projectId: number, updates: Partial<Pick<Project, '_name' | '_categoryId' | '_path' | '_workspacePath'>>): void {
        const projects = Project.getAll();
        const project = projects.find(p => p._id === projectId);

        if (project) {
            Object.assign(project, updates);
            writeStorageFile('projects.json', projects);
        }
    }

    public static deleteById(projectId: number): void {
        const filteredProjects = Project.getAll().filter(project => project._id !== projectId);
        writeStorageFile('projects.json', filteredProjects);
    }

    save() {
        const existingProjects = Project.getAll().filter(project => project._id !== this._id);
        existingProjects.push(this);
        writeStorageFile('projects.json', existingProjects);
    }

    private getNextId(): number {
        const existingProjects = Project.getAll();

        if (existingProjects.length === 0) {
            return 1;
        }

        const maxId = Math.max(...existingProjects.map(project => project._id));
        return maxId + 1;
    }
}
