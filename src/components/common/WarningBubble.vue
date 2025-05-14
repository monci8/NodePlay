<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  message: string;         // Warning message to display
  targetSelector: string;  // CSS selector for the element to attach the warning
  duration?: number;       // Optional duration for the warning visibility
}>();

// Reactive variable to control the visibility of the warning bubble
const visible = ref(true);
// Reactive variable to store the computed style for positioning the bubble
const computedStyle = ref({});

// Lifecycle hook to position the warning bubble when the component is mounted
onMounted(() => {
  // Get the DOM element using the target selector
  const el = document.querySelector(props.targetSelector);
  if (el) {
    const rect = el.getBoundingClientRect();

    // Calculate the style for positioning the bubble near the element
    computedStyle.value = {
      position: "fixed",
      top: `${rect.top}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: "translate(-100%, -15%)",
    };
  }
});
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
          v-if="visible"
          class="bubble"
          :style="computedStyle"
      >
        ⚠️ {{ message }}
      </div>
    </transition>
  </teleport>
</template>
