import type { ASTNode } from 'astronomical'

// ESTree VISITOR_KEYS mapping - defines child properties for each node type
const VISITOR_KEYS: Record<string, string[]> = {
  Program: ['body'],
  ExpressionStatement: ['expression'],
  BlockStatement: ['body'],
  EmptyStatement: [],
  DebuggerStatement: [],
  WithStatement: ['object', 'body'],
  ReturnStatement: ['argument'],
  LabeledStatement: ['label', 'body'],
  BreakStatement: ['label'],
  ContinueStatement: ['label'],
  IfStatement: ['test', 'consequent', 'alternate'],
  SwitchStatement: ['discriminant', 'cases'],
  SwitchCase: ['test', 'consequent'],
  ThrowStatement: ['argument'],
  TryStatement: ['block', 'handler', 'finalizer'],
  CatchClause: ['param', 'body'],
  WhileStatement: ['test', 'body'],
  DoWhileStatement: ['body', 'test'],
  ForStatement: ['init', 'test', 'update', 'body'],
  ForInStatement: ['left', 'right', 'body'],
  ForOfStatement: ['left', 'right', 'body'],
  FunctionDeclaration: ['id', 'params', 'body'],
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['id', 'init'],
  ThisExpression: [],
  ArrayExpression: ['elements'],
  ObjectExpression: ['properties'],
  Property: ['key', 'value'],
  FunctionExpression: ['id', 'params', 'body'],
  UnaryExpression: ['argument'],
  UpdateExpression: ['argument'],
  BinaryExpression: ['left', 'right'],
  AssignmentExpression: ['left', 'right'],
  LogicalExpression: ['left', 'right'],
  MemberExpression: ['object', 'property'],
  ConditionalExpression: ['test', 'consequent', 'alternate'],
  CallExpression: ['callee', 'arguments'],
  NewExpression: ['callee', 'arguments'],
  SequenceExpression: ['expressions'],
  ArrowFunctionExpression: ['params', 'body'],
  YieldExpression: ['argument'],
  TemplateLiteral: ['quasis', 'expressions'],
  TaggedTemplateExpression: ['tag', 'quasi'],
  TemplateElement: [],
  ObjectPattern: ['properties'],
  ArrayPattern: ['elements'],
  RestElement: ['argument'],
  AssignmentPattern: ['left', 'right'],
  ClassBody: ['body'],
  MethodDefinition: ['key', 'value'],
  ClassDeclaration: ['id', 'superClass', 'body'],
  ClassExpression: ['id', 'superClass', 'body'],
  MetaProperty: ['meta', 'property'],
  ImportDeclaration: ['specifiers', 'source'],
  ImportSpecifier: ['imported', 'local'],
  ImportDefaultSpecifier: ['local'],
  ImportNamespaceSpecifier: ['local'],
  ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
  ExportSpecifier: ['exported', 'local'],
  ExportDefaultDeclaration: ['declaration'],
  ExportAllDeclaration: ['source'],
  AwaitExpression: ['argument'],
  Identifier: [],
  Literal: [],
  SpreadElement: ['argument'],
  Super: [],
  PrivateIdentifier: [],
  PropertyDefinition: ['key', 'value'],
  StaticBlock: ['body'],
  ChainExpression: ['expression'],
  ImportExpression: ['source'],
}

export interface TreeNode {
  type: string
  start?: number
  end?: number
  label: string
  children: TreeNode[]
  isMatched: boolean
  isAncestorOfMatch: boolean
  isExpanded: boolean
  astNode: ASTNode
  primitiveValue?: string | number | boolean
}

/**
 * Format a node label with relevant information based on node type
 */
function formatNodeLabel(node: ASTNode): string {
  let label = node.type

  // Add useful info based on type
  if (node.type === 'Identifier' && 'name' in node) {
    label += `: ${node.name}`
  } else if (node.type === 'Literal' && 'value' in node) {
    const value = node.value
    if (typeof value === 'string') {
      label += `: "${value}"`
    } else {
      label += `: ${value}`
    }
  } else if (
    (node.type === 'BinaryExpression' ||
      node.type === 'UnaryExpression' ||
      node.type === 'AssignmentExpression' ||
      node.type === 'LogicalExpression' ||
      node.type === 'UpdateExpression') &&
    'operator' in node
  ) {
    label += ` (${node.operator})`
  } else if (node.type === 'VariableDeclaration' && 'kind' in node) {
    label += ` (${node.kind})`
  } else if (
    (node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression') &&
    'id' in node &&
    node.id &&
    'name' in node.id
  ) {
    label += `: ${node.id.name}`
  }

  return label
}

/**
 * Recursively build a tree structure from an AST node
 */
export function buildTree(
  node: ASTNode,
  matchedNodes: Set<ASTNode>,
  primitiveResults: Array<string | number | boolean> = [],
): TreeNode {
  const children: TreeNode[] = []

  // Get child property names for this node type
  const childKeys = VISITOR_KEYS[node.type as keyof typeof VISITOR_KEYS] || []

  for (const key of childKeys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = (node as any)[key]

    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && 'type' in item) {
          children.push(buildTree(item, matchedNodes, primitiveResults))
        }
      }
    } else if (child && typeof child === 'object' && 'type' in child) {
      children.push(buildTree(child, matchedNodes, primitiveResults))
    }
  }

  const treeNode: TreeNode = {
    type: node.type,
    start: node.start,
    end: node.end,
    label: formatNodeLabel(node),
    children,
    isMatched: matchedNodes.has(node),
    isAncestorOfMatch: false,
    isExpanded: false,
    astNode: node,
  }

  return treeNode
}

/**
 * Check if a node has a primitive value that matches the query results
 */
function hasPrimitiveMatch(
  node: TreeNode,
  primitiveResults: Array<string | number | boolean>,
): boolean {
  if (node.type === 'Identifier' && 'name' in node.astNode) {
    return primitiveResults.includes((node.astNode as { name: string }).name)
  } else if (node.type === 'Literal' && 'value' in node.astNode) {
    const value = (node.astNode as { value: unknown }).value
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return primitiveResults.includes(value)
    }
  }

  return false
}

/**
 * Mark ancestor nodes of matched nodes
 * Returns true if this node or any descendant is matched
 */
function markAncestors(
  node: TreeNode,
  primitiveResults: Array<string | number | boolean>,
): boolean {
  let hasMatchedDescendant = node.isMatched || hasPrimitiveMatch(node, primitiveResults)

  for (const child of node.children) {
    if (markAncestors(child, primitiveResults)) {
      hasMatchedDescendant = true
    }
  }

  if (hasMatchedDescendant && !node.isMatched && !hasPrimitiveMatch(node, primitiveResults)) {
    node.isAncestorOfMatch = true
  }

  return hasMatchedDescendant
}

/**
 * Build tree and mark ancestors of matched nodes
 * Skips the Program root node to reduce clutter
 */
export function buildTreeWithAncestors(
  node: ASTNode,
  matchedNodes: Set<ASTNode>,
  primitiveResults: Array<string | number | boolean> = [],
): TreeNode | TreeNode[] {
  const tree = buildTree(node, matchedNodes, primitiveResults)
  markAncestors(tree, primitiveResults)

  // If the root node is a Program node, return its children directly
  if (tree.type === 'Program' && tree.children.length > 0) {
    return tree.children
  }

  return tree
}

/**
 * Create a set of matched AST nodes from query results
 */
export function createMatchedNodesSet(results: Array<ASTNode | string | number | boolean>): {
  matchedNodes: Set<ASTNode>
  primitiveResults: Array<string | number | boolean>
} {
  const matchedNodes = new Set<ASTNode>()
  const primitiveResults: Array<string | number | boolean> = []

  for (const result of results) {
    if (typeof result === 'object' && result !== null && 'type' in result) {
      matchedNodes.add(result as ASTNode)
    } else if (
      typeof result === 'string' ||
      typeof result === 'number' ||
      typeof result === 'boolean'
    ) {
      primitiveResults.push(result)
    }
  }

  return { matchedNodes, primitiveResults }
}
