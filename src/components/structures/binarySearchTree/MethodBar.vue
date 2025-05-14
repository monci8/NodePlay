<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import { useMethodBar } from "@/composables/useMethodBar";

import MethodButton from "@/components/common/methodBarButtons/BasicButton.vue";
import MethodButtonWithInput from "@/components/common/methodBarButtons/ButtonWithInput.vue";

// Set the structure type as "tables"
const structureType = "tables";

// Define the events that the component can emit
const emit = defineEmits(["method-call"]);

// Define the properties the component expects to receive
const props = defineProps<{
  isInit: boolean;     // Whether the structure is initialized
  isAnimating: boolean; // Whether an animation is currently in progress
}>();

const {
  showWarning,             // Shows warning messages
  animationBlockedMethod,  // Checks if the animation blocks the method
  showInput,               // Controls visibility of input fields
  inputValues,             // Stores input field values
  errorMessages,           // Stores error messages for invalid inputs
  baseButtonClickCheck,    // Validates if the button can be clicked
  onSubmitInput,           // Handles input submission
} = useMethodBar(props, emit, [
  "insertNode",
  "deleteNode",
  "searchNode"
]);

// Initialize the visibility of input fields for specific methods
showInput.value = {
  insertNode: false,
  deleteNode: false,
  searchNode: false,
};

// Initialize the input values for methods requiring user input
inputValues.value = {
  insertNode: "",
  deleteNode: "",
  searchNode: "",
};

// Initialize error messages for methods requiring validation
errorMessages.value = {
  insertNode: "",
  deleteNode: "",
  searchNode: "",
};

// Handles button click events
const onButtonClick = (methodName: string) => {
  // Validates if the button can be clicked
  if (!baseButtonClickCheck(methodName)) return;

  // Toggle input fields for methods that require user input
  if (methodName in showInput.value) {
    Object.keys(showInput.value).forEach(key => {
      showInput.value[key] = key === methodName ? !showInput.value[key] : false;
    });
    errorMessages.value[methodName] = "";  // Reset error message
  } else {
    // Emits the method call directly if no input is required
    emit("method-call", methodName);
  }
};
</script>

<template>
  <el-aside class="structure-method-bar-wrapper">
    <div class="method-bar">

      <!-- InitTable(T) -->
      <MethodButton
          id="btn-init"
          label="InitTable(T)"
          methodName="initStructure"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('initStructure')"
      />

      <!-- Insert(T, K) -->
      <MethodButtonWithInput
          id="btn-insert"
          label="Insert(T, K)"
          methodName="insertNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('insertNode')"
          :showInput="showInput.insertNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.insertNode"
          :errorMessage="errorMessages.insertNode"
      />

      <!-- Delete(T, K) -->
      <MethodButtonWithInput
          id="btn-delete"
          label="Delete(T, K)"
          methodName="deleteNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('deleteNode')"
          :showInput="showInput.deleteNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.deleteNode"
          :errorMessage="errorMessages.deleteNode"
      />

      <!-- Search(T, K) -->
      <MethodButtonWithInput
          id="btn-search"
          label="Search(T, K)"
          methodName="searchNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('searchNode')"
          :showInput="showInput.searchNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.searchNode"
          :errorMessage="errorMessages.searchNode"
      />

      <!-- PreOrder(T) -->
      <MethodButton
          id="btn-preorder"
          label="PreOrder(T)"
          methodName="preOrderTraversal"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('preOrderTraversal')"
      />

      <!-- InOrder(T) -->
      <MethodButton
          id="btn-inorder"
          label="InOrder(T)"
          methodName="inOrderTraversal"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('inOrderTraversal')"
      />

      <!-- PostOrder(T) -->
      <MethodButton
          id="btn-postorder"
          label="PostOrder(T)"
          methodName="postOrderTraversal"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('postOrderTraversal')"
      />

      <!-- LevelOrder(T) -->
      <MethodButton
          id="btn-levelorder"
          label="LevelOrder(T)"
          methodName="levelOrderTraversal"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('levelOrderTraversal')"
      />

      <!-- Height(T) -->
      <MethodButton
          id="btn-height"
          label="Height(T)"
          methodName="showHeight"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('showHeight')"
      />

    </div>
  </el-aside>
</template>
