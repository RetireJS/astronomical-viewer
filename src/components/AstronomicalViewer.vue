<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useQueryStore } from '../stores/query'
import { storeToRefs } from 'pinia'
import CodeInput from './CodeInput.vue'
import QueryInput from './QueryInput.vue'
import ActionButtons from './ActionButtons.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import ResultsHeader from './ResultsHeader.vue'
import TreeContainer from './TreeContainer.vue'

const store = useQueryStore()
const { jsCode, queryString, errorMessage, tree, primitiveResults, matchCount, hasResults } =
  storeToRefs(store)

// Load from localStorage on mount
onMounted(() => {
  store.loadFromLocalStorage()
  store.execute()
})

// Save to localStorage whenever values change
watch([jsCode, queryString], () => {
  store.saveToLocalStorage()
})
</script>

<template>
  <div class="astronomical-viewer">
    <div class="header">
      <h1>🌌 ASTronomical Query Viewer</h1>
      <p class="subtitle">
        Interactive JavaScript AST Explorer using
        <a href="https://www.npmjs.com/package/astronomical">ASTronomical</a>
      </p>
    </div>

    <div class="input-section">
      <CodeInput v-model="jsCode" />
      <QueryInput v-model="queryString" />
      <ActionButtons
        :match-count="matchCount"
        @execute="store.execute"
        @expand="store.expandToResults"
      />
    </div>

    <ErrorDisplay :error-message="errorMessage" />

    <div v-if="hasResults" class="results-section">
      <ResultsHeader :match-count="matchCount" :primitive-results-count="primitiveResults.length" />
      <TreeContainer :tree="tree" :primitive-results="primitiveResults" />
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

.results-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}
</style>
