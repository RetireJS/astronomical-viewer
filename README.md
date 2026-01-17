# 🌌 ASTronomical Query Viewer

An interactive JavaScript AST (Abstract Syntax Tree) explorer and query tool, similar to [Regexr](https://regexr.com/) but for the [ASTronomical](https://github.com/RetireJS/astronomical) query language.

**🚀 [Try it live](https://retirejs.github.io/astronomical-viewer/)**

## What is this?

ASTronomical Query Viewer helps you visualize and test [ASTronomical](https://github.com/RetireJS/astronomical) queries against JavaScript code. It provides:

- **Interactive AST Tree View** - See the complete Abstract Syntax Tree of your JavaScript code
- **Query Testing** - Write and test ASTronomical queries in real-time
- **Visual Feedback** - Matched nodes are highlighted with their ancestors marked for easy navigation
- **Persistent State** - Your code and queries are saved in localStorage

## Features

- 📝 **Dual Pane Editor** - JavaScript code on one side, ASTronomical queries on the other
- 🌳 **Full AST Visualization** - Explore the entire syntax tree with expand/collapse functionality
- 🎯 **Match Highlighting** - Matched nodes shown in yellow, ancestors in gray
- 💾 **Auto-Save** - Your work persists across browser sessions
- 🔍 **Primitive Results** - Shows both matched AST nodes and primitive values (strings, numbers, booleans)
- ⚡ **Real-time Updates** - Execute queries and see results instantly

## What is ASTronomical?

[ASTronomical](https://github.com/RetireJS/astronomical) is a query language for JavaScript ASTs, similar to XPath for XML. It allows you to search for specific patterns in JavaScript code using queries like:

```
//FunctionDeclaration/:id/:name          # Get all function names
//Identifier[/:name == "exports"]        # Find all "exports" identifiers
//CallExpression[/Identifier/:name == "require"]  # Find all require() calls
```

## Usage

1. **Paste JavaScript code** into the top textarea
2. **Write an ASTronomical query** in the query field (supports multiline)
3. **Click "Execute Query"** to see matches
4. **Explore the AST** - Click nodes to expand/collapse the tree

### Example Queries

Find all function declarations:

```
//FunctionDeclaration
```

Get all function names:

```
//FunctionDeclaration/:id/:name
```

Find all variable declarations with specific names:

Find all variable declarations with specific names:

```
//VariableDeclarator[/:id/:name == "exports"]
```

## Development

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **ASTronomical** - JavaScript AST query engine
- **Meriyah** - Fast ECMAScript parser (used by ASTronomical)

## Known Limitations

- ASTronomical's `/:$object` binding feature may fail for runtime-provided identifiers (like `exports`, `module`, `require` in CommonJS) that aren't explicitly declared in the source code
- The viewer shows the static AST structure and doesn't have access to runtime context

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source. See LICENSE file for details.

## Related Projects

- [ASTronomical](https://github.com/RetireJS/astronomical) - The query engine powering this viewer
- [AST Explorer](https://astexplorer.net/) - General purpose AST visualization tool
- [Regexr](https://regexr.com/) - Similar interactive tool for regular expressions
