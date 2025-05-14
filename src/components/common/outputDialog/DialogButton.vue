<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>();

defineEmits(['toggle']);
</script>

<template>
  <div class="dialog-button" @click="$emit('toggle')">
    <span>{{ isOpen ? '▼' : '▲' }}</span>
  </div>
</template>
