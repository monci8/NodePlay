<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from "vue";

// Emit an event to hide the sidebar when a menu item is selected
const emit = defineEmits(["hide-sidebar"]);
const router = useRouter();
const route = useRoute();

// Mapping of route paths to menu index values
const routeToIndex: Record<string, string> = {
  "/singly-linked-list": "1-1",
  "/doubly-linked-list": "1-2",
  "/circular-singly-linked-list": "1-3",
  "/stack": "2",
  "/queue": "3",
  "/binary-search-tree": "4",
};

// Reverse mapping: map menu indices to route paths
const routesMap: Record<string, string> = Object.entries(routeToIndex)
    .reduce((acc, [path, index]) => ({ ...acc, [index]: path }), {} as Record<string, string>);

// Compute the active index based on the current route path
const activeIndex = computed(() => {
  return routeToIndex[route.path] || "";
});

// Handle menu item selection, change the route, and hide the sidebar
const handleMenuSelect = (index: string) => {
  const path = routesMap[index];
  if (path) {
    router.push(path);      // Navigate to the selected path
    emit("hide-sidebar");   // Hide the sidebar after navigation
  }
};
</script>


<template>
  <el-aside class="sidebar-aside">
    <el-menu
        :default-active="activeIndex"
        class="sidebar-menu"
        @select="handleMenuSelect"
    >
      <el-sub-menu index="1">
        <template #title>
          <div class="sidebar-submenu-title">
            <el-icon></el-icon>
            <span class="sidebar-submenu-label">
              {{ $t('structures.lists') }}
            </span>
          </div>
        </template>
        <el-menu-item-group class="sidebar-item-group">
          <el-menu-item index="1-1">
            {{ $t('structures.singly') }}
          </el-menu-item>
          <el-menu-item index="1-2">
            {{ $t('structures.doubly') }}
          </el-menu-item>
          <el-menu-item index="1-3">
            {{ $t('structures.circularSingly') }}
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <el-menu-item index="2">{{ $t('structures.stack') }}</el-menu-item>
      <el-menu-item index="3">{{ $t('structures.queue') }}</el-menu-item>
      <el-menu-item index="4">{{ $t('structures.bvs') }}</el-menu-item>
    </el-menu>
  </el-aside>
</template>
