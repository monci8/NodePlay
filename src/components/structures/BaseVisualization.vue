<script lang="ts" setup>
// Import the `defineEmits` function to handle custom events.
import { defineEmits } from 'vue';

// Import common components for the structure view.
import StructureHeader from "@/components/common/StructureHeader.vue";
import StructureFooter from "@/components/common/StructureFooter.vue";
import OutputDialog from "@/components/common/outputDialog/Dialog.vue";

// Define the events that the component can emit.
const emit = defineEmits<{
  (e: 'update:animationSpeed', val: number): void;
  (e: 'update:dialogVisible', val: boolean): void;
  (e: 'update:centeringEnable', val: boolean): void;
  (e: 'center-canvas'): void;
}>();

// Define the properties the component expects to receive.
defineProps<{
  structureName: string;
  statusInfo: string;
  dialogVisible: boolean;
  animationSpeed: number;
  isAnimating: boolean;
  isInit: boolean;
  handleMethod: (methodName: string, payload?: any) => void;
  output: { lines: { key: string, params?: Record<string, unknown> }[] };
}>();
</script>


<template>
  <main class="structure-main-container">
    <section class="structure-content">
      <StructureHeader
          class="structure-header-bar"
          :structureName="structureName"
          :status-info="statusInfo"
          :isAnimating="isAnimating"
          @center-canvas="emit('center-canvas')"
          @click-random="() => handleMethod('randomStructure')"
          @click-reset="() => handleMethod('resetStructure')"
      />

      <!-- Graph visualization area, size adjusts if the dialog is visible -->
      <div
          id="structureGraph"
          class="structure-graph"
          :class="{ 'graph-small': dialogVisible }"
      ></div>

      <StructureFooter
          class="structure-footer-bar"
          @update-speed="(val) => emit('update:animationSpeed', val)"
          @update-centering="(val) => emit('update:centeringEnable', val)"
      />

      <OutputDialog
          :isOpen="dialogVisible"
          @open="() => emit('update:dialogVisible', true)"
          @close="() => emit('update:dialogVisible', false)"
          :output="output"
      />
    </section>

    <!-- Slot for adding Method Bar -->
    <slot name="method-bar" />
  </main>
</template>

<style scoped>
.structure-header-bar {
  height: 35px;
  flex-shrink: 0;
}

.structure-footer-bar {
  height: 35px;
  flex-shrink: 0;
}
</style>
