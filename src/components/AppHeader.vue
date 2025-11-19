<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="header-title">风暴潮推演展示平台</h1>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  background: #667eea;
  color: white;
  height: 44px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 44px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .header-title {
    font-size: 1.1rem;
  }
}
</style>