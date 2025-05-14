<script setup lang="ts">
import MethodBar from "@/components/structures/doublyLinkedList/MethodBar.vue";
import { useVisualization } from "@/composables/useVisualization";
import DoublyLinkedListClass from "@/utils/doublyLinkedList";
import BaseVisualization from "@/components/structures/BaseVisualization.vue";
import { ref } from "vue";
import setupStructure from "@/composables/setupStructure";

// Reactive variable to track whether a node is active
const isActive = ref(false);

// Defining method handlers for managing the doubly linked list operations
const methodHandlers = (structure: any, isInit: any, dialogVisible: any, output: any) => ({
  initStructure: () => {
    structure.value.initStructure();
    isInit.value = structure.value.isInitialized(); // Update the initialization status
  },
  insertFirstNode: async (val?: string) => await structure.value.insertFirstNode(val ?? ""),
  getFirstNodeValue: async () => await structure.value.getFirstNodeValue(),
  getActiveNodeValue: async () => await structure.value.getActiveNodeValue(),
  deleteFirstNode: async () => {
    await structure.value.deleteFirstNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  activateFirstNode: async () => {
    await structure.value.activateFirstNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  activateNextNode: async () => {
    await structure.value.activateNextNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  setActiveNodeValue: async (val?: string) => await structure.value.setActiveNodeValue(val ?? ""),
  insertAfterActiveNode: async (val?: string) => await structure.value.insertAfterActiveNode(val ?? ""),
  deleteAfterActiveNode: async () => {
    await structure.value.deleteAfterActiveNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  insertLastNode: async (val?: string) => await structure.value.insertLastNode(val ?? ""),
  deleteLastNode: async () => {
    await structure.value.deleteLastNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  getLastNodeValue: async () => await structure.value.getLastNodeValue(),
  activateLastNode: async () => {
    await structure.value.activateLastNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  activatePreviousNode: async () => {
    await structure.value.activatePreviousNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  insertBeforeActiveNode: async (val?: string) => await structure.value.insertBeforeActiveNode(val ?? ""),
  deleteBeforeActiveNode: async () => {
    await structure.value.deleteBeforeActiveNode();
    isActive.value = structure.value.isActive(); // Update the active state
  },
  isListActive: async () => await structure.value.isListActive(),
  resetStructure: () => {
    structure.value.resetStructure();
    isInit.value = structure.value.isInitialized(); // Update initialization status
    dialogVisible.value = false;  // Hide any active dialog
    output.lines = [];  // Clear the output log
  },
  randomStructure: () => {
    structure.value.randomStructure();
    isInit.value = structure.value.isInitialized(); // Update initialization status
    isActive.value = structure.value.isActive(); // Update the active state
  }
});

// Using a composable to manage visualization interactions
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
setupStructure(structure, DoublyLinkedListClass, output, dialogVisible, isAnimating, statusInfo);
</script>

<template>
  <BaseVisualization
      :structureName="$t('structures.doublyList')"
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
          :isActive="isActive"
          :isAnimating="isAnimating"
          @method-call="handleMethod"
      />
    </template>
  </BaseVisualization>
</template>

