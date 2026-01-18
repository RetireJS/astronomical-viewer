<script setup lang="ts">
import TreeNode from './TreeNode.vue'
import type { TreeNode as TreeNodeType } from '../utils/astTreeBuilder'

defineProps<{
  tree: TreeNodeType | TreeNodeType[] | null
  primitiveResults: Array<string | number | boolean>
}>()
</script>

<template>
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
</template>

<style scoped>
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
