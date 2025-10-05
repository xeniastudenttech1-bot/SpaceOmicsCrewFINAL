<template>
  <header class="sticky">
    <div class="container header__bar">
      <router-link to="/" class="brand">
        <img src="/logoSpace.png" alt="Space Omics logo" class="brand__logo" />
        <span class="brand__name">Space Omics</span>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="pill">Home</router-link>
        <router-link to="/comparador" class="pill">Comparator</router-link>
        <router-link to="/mapeo" class="pill">Data</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(6px);
  background: rgba(5, 7, 22, 0.6);
  border-bottom: 1px solid rgba(198, 185, 255, 0.18);
}

.header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: .6rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  font-weight: 800;
  color: var(--accent1);
  text-decoration: none;
}

.brand__logo {
  width: clamp(28px, 4vw, 40px);
  height: auto;
  display: block;
  filter: drop-shadow(0 0 10px rgba(198,185,255,.35));
}

.brand__name {
  letter-spacing: .02em;
}

.nav {
  display: flex;
  gap: 1rem;
}
</style>
