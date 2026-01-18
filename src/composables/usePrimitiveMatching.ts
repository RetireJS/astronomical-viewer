import type { TreeNode } from '../utils/astTreeBuilder'

export function usePrimitiveMatching(primitiveResults: Array<string | number | boolean>) {
  const hasMatchedPrimitiveValue = (node: TreeNode): boolean => {
    // Check if this node's value matches any primitive results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const astNode = node.astNode as any

    if (node.type === 'Identifier' && astNode.name) {
      return primitiveResults.includes(astNode.name)
    } else if (node.type === 'Literal' && astNode.value !== undefined) {
      return primitiveResults.includes(astNode.value)
    }

    return false
  }

  const showPrimitiveMatch = (node: TreeNode): string | number | boolean | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const astNode = node.astNode as any

    if (node.type === 'Identifier' && astNode.name && primitiveResults.includes(astNode.name)) {
      return astNode.name
    } else if (
      node.type === 'Literal' &&
      astNode.value !== undefined &&
      primitiveResults.includes(astNode.value)
    ) {
      return astNode.value
    }

    return null
  }

  return {
    hasMatchedPrimitiveValue,
    showPrimitiveMatch,
  }
}
