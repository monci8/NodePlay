<script setup lang="ts">
import MethodBar from "@/components/structures/binarySearchTree/MethodBar.vue";
import { useVisualization } from "@/composables/useVisualization";
import BinarySearchTree from "@/utils/binarySearchTree";
import BaseVisualization from "@/components/structures/BaseVisualization.vue";
import setupStructure from "@/composables/setupStructure";

// Defining method handlers for managing the binary search tree operations
const methodHandlers = (structure: any, isInit: any, dialogVisible: any, output: any) => ({
  initStructure: () => {
    structure.value.initStructure();
    isInit.value = structure.value.isInitialized(); // Update the initialization status
  },
  insertNode: (k?: number | string) => structure.value.insertNode(k ?? ""),
  deleteNode: (k?: number | string) => structure.value.deleteNode(k ?? ""),
  searchNode: (k?: number | string) => structure.value.searchNode(k ?? ""),
  preOrderTraversal: () => structure.value.preOrderTraversal(),
  inOrderTraversal: () => structure.value.inOrderTraversal(),
  postOrderTraversal: () => structure.value.postOrderTraversal(),
  levelOrderTraversal: () => structure.value.levelOrderTraversal(),
  showHeight: () => structure.value.showHeight(),
  resetStructure: () => {
    structure.value.resetStructure();
    isInit.value = structure.value.isInitialized(); // Update initialization status
    dialogVisible.value = false;  // Hide any active dialog
    output.lines = [];  // Clear the output log
  },
  randomStructure: () => {
    structure.value.randomStructure();
    isInit.value = structure.value.isInitialized(); // Update initialization status
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
setupStructure(structure, BinarySearchTree, output, dialogVisible, isAnimating, statusInfo);
</script>

<template>
  <BaseVisualization
      :structureName="$t('structures.bvs')"
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