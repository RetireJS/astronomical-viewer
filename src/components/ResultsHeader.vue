<script setup lang="ts">
defineProps<{
  matchCount: number
  primitiveResultsCount: number
}>()
</script>

<template>
  <div class="results-header">
    <h2>AST Tree View</h2>
    <span v-if="matchCount > 0" class="match-count">
      {{ matchCount }} match{{ matchCount === 1 ? '' : 'es' }} found
    </span>
    <span v-if="primitiveResultsCount > 0" class="primitive-count">
      ({{ primitiveResultsCount }} primitive value{{ primitiveResultsCount === 1 ? '' : 's' }})
    </span>
  </div>
</template>

<style scoped>
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
</style>
