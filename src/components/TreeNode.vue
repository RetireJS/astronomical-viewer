<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '../utils/astTreeBuilder'
import { usePrimitiveMatching } from '../composables/usePrimitiveMatching'

const props = defineProps<{
  node: TreeNode
  primitiveResults: Array<string | number | boolean>
  level?: number
}>()

const emit = defineEmits<{
  'update:expanded': [node: TreeNode, expanded: boolean]
}>()

const { hasMatchedPrimitiveValue, showPrimitiveMatch } = usePrimitiveMatching(
  props.primitiveResults,
)

const toggleExpand = () => {
  if (props.node.children.length > 0) {
    // Create a new node object with updated expansion state
    const updatedNode = {
      ...props.node,
      isExpanded: !props.node.isExpanded,
    }
    // Emit the change instead of mutating props
    emit('update:expanded', updatedNode, !props.node.isExpanded)
    // For backward compatibility, still mutate the prop
    // This allows the component to work without parent handling the event
    // eslint-disable-next-line vue/no-mutating-props
    props.node.isExpanded = !props.node.isExpanded
  }
}

const indent = computed(() => (props.level || 0) * 20)
</script>

<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{
        matched: node.isMatched,
        'ancestor-of-match': node.isAncestorOfMatch,
        'primitive-matched': hasMatchedPrimitiveValue(node),
        'has-children': node.children.length > 0,
        expanded: node.isExpanded,
      }"
      :style="{ paddingLeft: `${indent}px` }"
      @click="toggleExpand"
    >
      <span class="expand-icon" v-if="node.children.length > 0">
        {{ node.isExpanded ? '▼' : '▶' }}
      </span>
      <span class="node-label">{{ node.label }}</span>
      <span v-if="showPrimitiveMatch(node)" class="primitive-match-badge">
        ✓ matches: {{ showPrimitiveMatch(node) }}
      </span>
    </div>

    <div v-if="node.isExpanded && node.children.length > 0" class="children">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="`${index}-${child.type}-${child.start}`"
        :node="child"
        :primitive-results="primitiveResults"
        :level="(level || 0) + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
}

.node-content {
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  border-left: 2px solid transparent;
  transition: background-color 0.15s ease;
}

.node-content:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.node-content.has-children {
  cursor: pointer;
}

.expand-icon {
  width: 12px;
  font-size: 10px;
  color: #666;
  flex-shrink: 0;
}

.node-label {
  color: #333;
}

/* Matched node styling - combination of bold, background, and border */
.node-content.matched {
  font-weight: bold;
  background-color: #fff3cd;
  border-left-color: #ffc107;
  border-left-width: 3px;
}

.node-content.matched:hover {
  background-color: #ffe69c;
}

.node-content.matched .node-label {
  color: #856404;
}

/* Ancestor of matched node styling - subtle highlight */
.node-content.ancestor-of-match {
  background-color: #f8f9fa;
  border-left-color: #adb5bd;
  border-left-width: 2px;
}

.node-content.ancestor-of-match:hover {
  background-color: #e9ecef;
}

.node-content.ancestor-of-match .node-label {
  color: #495057;
}

/* Primitive value matched styling */
.node-content.primitive-matched {
  background-color: #d1ecf1;
  border-left-color: #17a2b8;
  border-left-width: 3px;
}

.node-content.primitive-matched:hover {
  background-color: #bee5eb;
}

.primitive-match-badge {
  font-size: 11px;
  color: #0c5460;
  background-color: #b8daff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: normal;
}

/* When both matched */
.node-content.matched.primitive-matched {
  background-color: #d4edda;
  border-left-color: #28a745;
}

.node-content.matched.primitive-matched:hover {
  background-color: #c3e6cb;
}

.children {
  margin-left: 0;
}
</style>
