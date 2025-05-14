<script setup lang="ts">
import { watch, nextTick } from "vue";
import { i18n } from "@/i18n";

// Define component props
const props = defineProps<{
  isOpen: boolean;  // Determines if the dialog is open
  output: { lines: { key: string, params?: Record<string, unknown> }[] };  // Output data to display
}>();

// Checks if a given key is translatable using i18n
const isTranslatable = (key: string): boolean => {
  // Returns true if the key is not a number and exists in the i18n translations
  return isNaN(Number(key)) && i18n.global.te(key);
};

// Watch for changes in the number of output lines and scroll to the bottom if changed
watch(() => props.output?.lines?.length, async () => {
  await nextTick();  // Wait for the DOM to update
  const area = document.querySelector('.dialog-area');
  if (area) area.scrollTop = area.scrollHeight;  // Auto-scroll to the latest output
});
</script>


<template>
  <div class="dialog-area" :class="{ open: isOpen }">
    <label class="dialog-label">{{ $t('outputDialog.label') }}</label>
    <div v-for="(log, index) in output.lines" :key="index">
      <span
          :class="{ 'new-message': index === output.lines.length - 1 }"
          v-if="isTranslatable(log.key)">
        {{ $t(log.key, log.params || {}) }}
      </span>
      <span :class="{ 'new-message': index === output.lines.length - 1 }" v-else>
        {{ log.key }}
      </span>
    </div>
  </div>
</template>

