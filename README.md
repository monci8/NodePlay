# Bachelor Degree Work

This project was created as part of my bachelor's degree at university BUT FIT. It is a web application focused on data structure visualization.

## Project Structure
```
NodePlay/                     # Root directory of the project
├── src/                      # Source files of the application
│   ├── assets/               # Style files and images
│   ├── components/           # Vue components for the user interface
│   ├── composables/          # Shared helper functions for Vue components
│   ├── locales/              # Translation files (SK, CS, EN)
│   ├── router/               # Vue Router configuration
│   ├── utils/                # Implementation of data structures and algorithms
│   ├── i18n.ts               # Initialization of the Vue I18n translation system
│   ├── main.ts               # Main entry point of the Vue application
│   ├── shims-vue.d.ts        # Type declaration for .vue files with TypeScript
│   └── index.html            # Main HTML file for the Vue application
├── package.json              # List of dependencies and scripts to run the project
├── README.md                 # Manual for running the application
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.js            # Vite development tool configuration
```

## Technologies Used

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Cytoscape.js](https://js.cytoscape.org/)

## 🚀 Project Setup

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## License
This project is licensed under the MIT License.
