<script setup lang="ts">
defineProps<{
  errorMessage: string
}>()
</script>

<template>
  <div v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
</template>

<style scoped>
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
</style>
