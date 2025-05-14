<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from "vue";
import { useMethodBar } from "@/composables/useMethodBar";

import MethodButton from "@/components/common/methodBarButtons/BasicButton.vue";
import MethodButtonWithInput from "@/components/common/methodBarButtons/ButtonWithInput.vue";
import InitMethodButton from "@/components/common/methodBarButtons/InitButton.vue";

// Defining events that the component can emit
const emit = defineEmits(["method-call", "method-response"]);

// Defining props that the component expects to receive
const props = defineProps<{
  isInit: boolean;     // Whether the structure is initialized
  isAnimating: boolean; // Whether an animation is in progress
}>();

// Defining the structure type as "queue"
const structureType = "queue";

// Reactive variables to toggle input fields
const showInitInput = ref(false);  // Shows/hides the init input field
const showAddInput = ref(false);   // Shows/hides the add element input field

// Using a composable to manage method bar interactions
const {
  showWarning,              // Shows warning messages
  animationBlockedMethod,   // Checks if animation blocks the method
  baseButtonClickCheck,     // Validates if the button can be clicked
  showWarningMessage,       // Displays a warning message
} = useMethodBar(props, emit, ["addElement"]);

// Handles button click events
const onButtonClick = (methodName: string) => {
  // Validates if the button can be clicked
  if (!baseButtonClickCheck(methodName)) return;

  // Toggles visibility of input fields based on the clicked button
  if (methodName === "addElement") {
    showAddInput.value = !showAddInput.value;
    showInitInput.value = false;
  } else if (methodName === "initStructure") {
    showInitInput.value = !showInitInput.value;
    showAddInput.value = false;
  } else {
    // Emits the method call directly if no input is required
    emit("method-call", methodName);
  }
};

// Handles submission of the add element form
const onSubmitAdd = (payload: { value: string; animationBlocked: boolean }) => {
  // Check if animation is blocking the method
  if (payload.animationBlocked) {
    showWarningMessage("animation", "addElement");
    return;
  }

  // Emits the method call to add an element
  emit("method-call", "addElement", payload.value);
};

// Handles submission of the initialization form
const onSubmitInit = (value: number) => {
  // Emits the init method with the given value
  emit("method-call", "initStructure", value);
  // Hides the init input field after submission
  showInitInput.value = false;
};

// Watches the initialization status and hides input fields if not initialized
watch(() => props.isInit, (newVal) => {
  if (!newVal) {
    showAddInput.value = false;
    showInitInput.value = false;
  }
});
</script>

<template>
  <el-aside class="structure-method-bar-wrapper">
    <div class="method-bar">

      <!-- InitStructure -->
      <InitMethodButton
          id="btn-init"
          label="InitQueue(Q)"
          methodName="initStructure"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('initStructure')"
          :showInput="showInitInput"
          @submit="onSubmitInit"
          :initOptions="[5, 10, 15]"
      />

      <!-- Add(Q, El) -->
      <MethodButtonWithInput
          id="btn-add"
          label="Add(Q, El)"
          methodName="addElement"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('addElement')"
          :showInput="showAddInput"
          @submit="onSubmitAdd"
      />

      <!-- Remove(Q) -->
      <MethodButton
          id="btn-remove"
          label="Remove(Q)"
          methodName="removeElement"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('removeElement')"
      />

      <!-- IsEmpty(Q) -->
      <MethodButton
          id="btn-empty"
          label="IsEmpty(Q)"
          methodName="isEmpty"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('isEmpty')"
      />

      <!-- Front(Q) -->
      <MethodButton
          id="btn-front"
          label="Front(Q)"
          methodName="foremostElement"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('foremostElement')"
      />

      <!-- IsFull(Q) -->
      <MethodButton
          id="btn-full"
          label="IsFull(Q)"
          methodName="isFull"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('isFull')"
      />

    </div>
  </el-aside>
</template>
