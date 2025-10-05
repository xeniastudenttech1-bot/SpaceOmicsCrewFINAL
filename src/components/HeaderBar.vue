<template>
  <header class="sticky">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <router-link to="/" style="display:flex;align-items:center;gap:.6rem;font-weight:800;color:var(--accent1)">

        <span>Space
          Omics</span>
      </router-link>
      <nav style="display:flex;gap:1rem;">
        <router-link to="/" class="pill">Home</router-link>
        <router-link to="/comparador" class="pill">Comparator</router-link>
        <router-link to="/mapeo" class="pill">Data</router-link>
      </nav>
    </div>
  </header>
</template>
<script setup>
</script>
