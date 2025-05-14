<script setup lang="ts">
import MethodBar from "@/components/structures/stack/MethodBar.vue";
import { useVisualization } from "@/composables/useVisualization";
import StackClass from "@/utils/stack";
import BaseVisualization from "@/components/structures/BaseVisualization.vue";
import setupStructure from "@/composables/setupStructure";

// Defining method handlers for managing the stack operations
const methodHandlers = (structure: any, isInit: any, dialogVisible: any, output: any) => ({
  initStructure: (val?: string | number) => {
    if (typeof val === "number") {
      structure.value.initStructure(val);
      isInit.value = structure.value.isInitialized();  // Update the initialization status
    }
  },
  addElement: (val?: string | number) => {
    if (typeof val === "string") {
      structure.value.addElement(val);
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
} = useVisualization({methodHandlers});

// Initializes the structure
setupStructure(structure, StackClass, output, dialogVisible, isAnimating, statusInfo);
</script>

<template>
  <BaseVisualization
      :structureName="$t('structures.stack')"
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
