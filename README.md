![Project Library Logo](https://github.com/philbschmidt/Project-Master/raw/HEAD/media/images/icon.png)

# *Project Library*

[![Version](https://img.shields.io/visual-studio-marketplace/v/philbschmidt.vscode-project-library?style=for-the-badge&cacheSeconds=21600)](https://marketplace.visualstudio.com/items?itemName=philbschmidt.vscode-project-library) [![Installs](https://img.shields.io/visual-studio-marketplace/i/philbschmidt.vscode-project-library?style=for-the-badge&cacheSeconds=21600)](https://marketplace.visualstudio.com/items?itemName=philbschmidt.vscode-project-library) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/philbschmidt.vscode-project-library?style=for-the-badge&label=Downloads&cacheSeconds=21600)](https://marketplace.visualstudio.com/items?itemName=philbschmidt.vscode-project-library)

**Project Library** is a VS Code extension that helps you save, organize, and quickly switch between your projects using a tree structure with categories.

## Features

- **Save Projects & Workspaces** - Quickly save your current folder or workspace file
- **Hierarchical Organization** - Create nested categories to organize projects logically
- **Fast Switching** - Open projects in current or new window with one click
- **Smart Indicators** - See which project is currently active
- **Workspace Support** - Full support for both single folders and multi-root workspaces
- **Context Menus** - Right-click actions for adding, editing, and deleting entries
- **Tree View** - Clean, collapsible tree interface in the sidebar

## Usage

### Adding Projects

1. Open the folder or workspace you want to save
2. Click the Project Library icon in the sidebar
![sidebar icon](https://github.com/philbschmidt/Project-Master/raw/HEAD/media/images/sidebar-icon-readme.png)
3. Click the **"Add Project"** button in the tree view toolbar
4. Enter a name for your project
5. Optionally select a category (or leave at Root)
![add project readme](https://github.com/philbschmidt/Project-Master/raw/HEAD/media/videos/add-project-readme.mp4)

### Creating Categories

1. Click the **"Add Category"** button in the tree view toolbar
2. Enter a category name
3. Categories can be nested by right-clicking on an existing category and selecting "Add Category"
![add category readme](https://github.com/philbschmidt/Project-Master/raw/HEAD/media/videos/add-category-readme.mp4)

### Opening Projects

- **Single Click**: Opens project in current window (closes current workspace)
- **Right-Click → "Open in New Window"**: Opens project in a new VS Code window

### Managing Entries

Right-click on any project or category to:
- **Edit** - Rename or move to different category
- **Delete** - Remove entry (deleting a category moves projects to Root)
- **Add Project/Category** - Add new entries within the selected category
![managing entries](https://github.com/philbschmidt/Project-Master/raw/HEAD/media/videos/managing-entries-readme.mp4)

## Data Storage

Project Library stores your projects and categories in VS Code's global storage directory:
- **Windows**: `%APPDATA%\Code\User\globalStorage\philbschmidt.vscode-project-library\`
- **macOS**: `~/Library/Application Support/Code/User/globalStorage/philbschmidt.vscode-project-library/`
- **Linux**: `~/.config/Code/User/globalStorage/philbschmidt.vscode-project-library/`

Data is stored in two JSON files:
- `projects.json` - Your saved projects
- `categories.json` - Your category structure

The extension automatically creates backups if data corruption is detected.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on [GitHub](https://github.com/philbschmidt/Project-Master).

## License

This extension is licensed under the [MIT License](LICENSE).

## Support

- **Report Issues**: [GitHub Issues](https://github.com/philbschmidt/Project-Master/issues)
- **Contact**: phillip.jucky@gmail.com
- **Rate & Review**: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=philbschmidt.vscode-project-library)