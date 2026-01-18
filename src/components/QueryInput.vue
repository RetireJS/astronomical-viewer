<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="input-group">
    <label for="query-input">ASTronomical Query:</label>
    <textarea
      id="query-input"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      placeholder="e.g., //FunctionDeclaration or //Identifier/:name"
      rows="3"
    ></textarea>
  </div>
</template>

<style scoped>
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

.input-group textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}
</style>
