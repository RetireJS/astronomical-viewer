<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as astronomical from 'astronomical'
import TreeNode from './TreeNode.vue'
import { buildTreeWithAncestors, createMatchedNodesSet } from '../utils/astTreeBuilder'
import type { TreeNode as TreeNodeType } from '../utils/astTreeBuilder'
import type { ASTNode } from 'astronomical'

const { parseSource, query } = astronomical

const DEFAULT_JS_CODE = `function greet(name) {
  return "Hello, " + name;
}

const result = greet("World");
console.log(result);`

const DEFAULT_QUERY = '//FunctionDeclaration[/Identifier/:name == "greet"]//Literal/:value'

// Load from localStorage or use defaults
const jsCode = ref(localStorage.getItem('astronomical-viewer-js') || DEFAULT_JS_CODE)
const queryString = ref(localStorage.getItem('astronomical-viewer-query') || DEFAULT_QUERY)

const errorMessage = ref<string>('')
const ast = ref<ASTNode | null>(null)
const tree = ref<TreeNodeType | TreeNodeType[] | null>(null)
const primitiveResults = ref<Array<string | number | boolean>>([])
const matchCount = ref(0)

// Save to localStorage whenever values change
watch(jsCode, (newValue) => {
  localStorage.setItem('astronomical-viewer-js', newValue)
})

watch(queryString, (newValue) => {
  localStorage.setItem('astronomical-viewer-query', newValue)
})

const execute = () => {
  errorMessage.value = ''
  ast.value = null
  tree.value = null
  primitiveResults.value = []
  matchCount.value = 0

  try {
    // Parse the JavaScript code
    if (!jsCode.value.trim()) {
      errorMessage.value = 'Please enter some JavaScript code'
      return
    }

    ast.value = parseSource(jsCode.value)

    // If there's a query, execute it
    if (queryString.value.trim()) {
      try {
        console.log('Executing query:', queryString.value)
        console.log('AST:', ast.value)

        const results = query(ast.value, queryString.value)

        console.log('Query results:', results)
        console.log('Results length:', results.length)
        console.log(
          'Results types:',
          results.map((r) => (typeof r === 'object' && r !== null ? r.type : typeof r)),
        )

        const { matchedNodes, primitiveResults: prims } = createMatchedNodesSet(results)

        primitiveResults.value = prims
        matchCount.value = matchedNodes.size + prims.length

        // Build the tree with matched nodes
        tree.value = buildTreeWithAncestors(ast.value, matchedNodes, prims)
      } catch (queryError) {
        const err = queryError as Error
        let errorMsg = `Query error: ${err.message || String(queryError)}`

        // Include stack trace for debugging if available
        if (err.stack) {
          const stackLines = err.stack.split('\n').slice(0, 5)
          errorMsg += '\n\n' + stackLines.join('\n')
        }

        errorMessage.value = errorMsg
        // Still show the tree even if query fails
        tree.value = buildTreeWithAncestors(ast.value, new Set(), [])
      }
    } else {
      // No query - just show the tree
      tree.value = buildTreeWithAncestors(ast.value, new Set(), [])
    }
  } catch (error) {
    errorMessage.value = `Parse error: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Execute on mount with default values
execute()

const hasResults = computed(() => tree.value !== null)

const expandToResults = () => {
  if (!tree.value) return

  // Helper function to check if a node has a primitive match
  const hasPrimitiveValue = (node: TreeNodeType): boolean => {
    if (
      node.type === 'Identifier' &&
      node.astNode.type === 'Identifier' &&
      'name' in node.astNode
    ) {
      return primitiveResults.value.includes((node.astNode as { name: string }).name)
    } else if (node.type === 'Literal' && 'value' in node.astNode) {
      const value = (node.astNode as { value: unknown }).value
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return primitiveResults.value.includes(value)
      }
    }
    return false
  }

  // Deep clone the tree with updated expansion states
  const cloneWithExpansion = (node: TreeNodeType): TreeNodeType => {
    const shouldExpand = node.isAncestorOfMatch || node.isMatched || hasPrimitiveValue(node)

    return {
      ...node,
      isExpanded: shouldExpand,
      children: node.children.map((child) => cloneWithExpansion(child)),
    }
  }

  if (Array.isArray(tree.value)) {
    tree.value = tree.value.map((node) => cloneWithExpansion(node))
  } else {
    tree.value = cloneWithExpansion(tree.value)
  }
}
</script>

<template>
  <div class="astronomical-viewer">
    <div class="header">
      <h1>🌌 Astronomical Query Viewer</h1>
      <p class="subtitle">
        Interactive JavaScript AST Explorer using
        <a href="https://www.npmjs.com/package/astronomical">Astronomical</a>
      </p>
    </div>

    <div class="input-section">
      <div class="input-group">
        <label for="js-input">JavaScript Code:</label>
        <textarea
          id="js-input"
          v-model="jsCode"
          placeholder="Enter JavaScript code here..."
          rows="10"
        ></textarea>
      </div>

      <div class="input-group">
        <label for="query-input">Astronomical Query:</label>
        <textarea
          id="query-input"
          v-model="queryString"
          placeholder="e.g., //FunctionDeclaration or //Identifier/:name"
          rows="3"
        ></textarea>
      </div>

      <div class="button-group">
        <button @click="execute" class="execute-btn">Execute Query</button>
        <button @click="expandToResults" class="expand-btn" :disabled="matchCount === 0">
          Expand to Results
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="hasResults" class="results-section">
      <div class="results-header">
        <h2>AST Tree View</h2>
        <span v-if="matchCount > 0" class="match-count">
          {{ matchCount }} match{{ matchCount === 1 ? '' : 'es' }} found
        </span>
        <span v-if="primitiveResults.length > 0" class="primitive-count">
          ({{ primitiveResults.length }} primitive value{{
            primitiveResults.length === 1 ? '' : 's'
          }})
        </span>
      </div>

      <div class="tree-container">
        <template v-if="Array.isArray(tree)">
          <TreeNode
            v-for="(node, index) in tree"
            :key="`${index}-${node.type}-${node.start}`"
            :node="node"
            :primitive-results="primitiveResults"
            :level="0"
          />
        </template>
        <TreeNode v-else-if="tree" :node="tree" :primitive-results="primitiveResults" :level="0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.astronomical-viewer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  font-size: 32px;
  color: #2c3e50;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 16px;
}

.input-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.input-group textarea {
  width: 100%;
  padding: 10px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
}

.input-group input[type='text'] {
  width: 100%;
  padding: 10px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

.input-group textarea:focus,
.input-group input[type='text']:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.button-group {
  display: flex;
  gap: 10px;
}

.execute-btn,
.expand-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.expand-btn {
  background: #2196f3;
}

.execute-btn:hover {
  background: #45a049;
}

.expand-btn:hover:not(:disabled) {
  background: #1976d2;
}

.expand-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.execute-btn:active {
  background: #3d8b40;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.results-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  background: #e9ecef;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.match-count {
  background: #28a745;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.primitive-count {
  background: #17a2b8;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tree-container {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
  background: white;
}

.tree-container::-webkit-scrollbar {
  width: 8px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
