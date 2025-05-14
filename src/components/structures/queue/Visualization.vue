<script setup lang="ts">
import MethodBar from "@/components/structures/queue/MethodBar.vue";
import { useVisualization } from "@/composables/useVisualization";
import QueueClass from "@/utils/queue";
import BaseVisualization from "@/components/structures/BaseVisualization.vue";
import setupStructure from "@/composables/setupStructure";

// Defining method handlers for managing the queue operations
const methodHandlers = (structure: any, isInit: any, dialogVisible: any, output: any) => ({
  initStructure: (val?: string | number) => {
    if (typeof val === "number") {
      structure.value.initStructure(val);
      isInit.value = structure.value.isInitialized();  // Update the initialization status
    }
  },
  addElement: async (val?: string | number) => {
    if (typeof val === "string") {
      await structure.value.addElement(val);
    }
  },
  removeElement: () => {
    structure.value.removeElement();
  },
  isEmpty: () => {
    structure.value.isEmpty();
  },
  foremostElement: () => {
    structure.value.foremostElement();
  },
  isFull: () => {
    structure.value.isFull();
  },
  resetStructure: () => {
    structure.value.resetStructure();
    isInit.value = structure.value.isInitialized();  // Update the initialization state
    dialogVisible.value = false;  // Hide any open dialogs
    output.lines = [];  // Clear the output log
  },
  randomStructure: () => {
    structure.value.randomStructure()
    isInit.value = structure.value.isInitialized();  // Update the initialization state
  }
});

const {
  structure,
  dialogVisible,
  output,
  animationSpeed,
  isInit,
  isAnimating,
  statusInfo,
  centerCanvas,
  updateCenteringEnable,
  handleMethod,
} = useVisualization({
  methodHandlers
});

// Initializes the structure
setupStructure(structure, QueueClass, output, dialogVisible, isAnimating, statusInfo);
</script>

<template>
  <BaseVisualization
      :structureName="$t('structures.queue')"
      :status-info="statusInfo"
      :dialogVisible="dialogVisible"
      :animationSpeed="animationSpeed"
      :isAnimating="isAnimating"
      :isInit="isInit"
      :handleMethod="handleMethod"
      :output="output"
      @update:animationSpeed="(val) => animationSpeed = val"
      @update:centeringEnable="updateCenteringEnable"
      @update:dialogVisible="(val) => dialogVisible = val"
      @center-canvas="centerCanvas"
  >
    <template #method-bar>
      <MethodBar
          class="structure-method-bar"
          :isInit="isInit"
          :isAnimating="isAnimating"
          @method-call="handleMethod"
      />
    </template>
  </BaseVisualization>
</template>