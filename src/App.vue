<script setup lang="ts">
import SideBar from "@/components/common/SideBar.vue"
import Header from "@/components/common/Header.vue"
import { ref } from "vue";

const isSidebarVisible = ref(false);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const hideSidebar = () => {
  isSidebarVisible.value = false;
};

</script>

<template>
  <div class="app">
    <Header @toggle-sidebar="toggleSidebar" />
    <div class="content">
      <SideBar
          :class="{ 'mobile-hidden': !isSidebarVisible }"
          @hide-sidebar="hideSidebar"
      />
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  display: flex;
  flex: 1;
  overflow: auto;
  padding-top: 45px;
  background-color: var(--light-blue);
}

main {
  flex: 1;
  overflow: auto;
}

@media (max-width: 1000px) {
  .content {
    flex-direction: column;
    overflow: auto;
  }
}

@media (max-width: 1000px) {
  .mobile-hidden {
    transform: translateX(-100%);
  }
}
</style>
