import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as astronomical from 'astronomical'
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

const STORAGE_KEYS = {
  JS_CODE: 'astronomical-viewer-js',
  QUERY: 'astronomical-viewer-query',
}

export const useQueryStore = defineStore('query', () => {
  // State
  const jsCode = ref(DEFAULT_JS_CODE)
  const queryString = ref(DEFAULT_QUERY)
  const errorMessage = ref<string>('')
  const ast = ref<ASTNode | null>(null)
  const tree = ref<TreeNodeType | TreeNodeType[] | null>(null)
  const primitiveResults = ref<Array<string | number | boolean>>([])
  const matchCount = ref(0)

  // Computed
  const hasResults = computed(() => tree.value !== null)

  // Actions
  function loadFromLocalStorage() {
    const savedJs = localStorage.getItem(STORAGE_KEYS.JS_CODE)
    const savedQuery = localStorage.getItem(STORAGE_KEYS.QUERY)

    if (savedJs) {
      jsCode.value = savedJs
    }
    if (savedQuery) {
      queryString.value = savedQuery
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.JS_CODE, jsCode.value)
    localStorage.setItem(STORAGE_KEYS.QUERY, queryString.value)
  }

  function execute() {
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

  function expandToResults() {
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

  return {
    // State
    jsCode,
    queryString,
    errorMessage,
    ast,
    tree,
    primitiveResults,
    matchCount,
    // Computed
    hasResults,
    // Actions
    loadFromLocalStorage,
    saveToLocalStorage,
    execute,
    expandToResults,
  }
})
