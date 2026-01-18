<script setup lang="ts">
defineProps<{
  matchCount: number
}>()

defineEmits<{
  execute: []
  expand: []
}>()
</script>

<template>
  <div class="button-group">
    <button @click="$emit('execute')" class="execute-btn">Execute Query</button>
    <button @click="$emit('expand')" class="expand-btn" :disabled="matchCount === 0">
      Expand to Results
    </button>
  </div>
</template>

<style scoped>
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
</style>
