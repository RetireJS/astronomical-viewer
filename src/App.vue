<script setup lang="ts">
import AstronomicalViewer from './components/AstronomicalViewer.vue'
</script>

<template>
  <div id="app">
    <AstronomicalViewer />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
