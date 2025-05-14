<script setup lang="ts">
import { defineEmits, defineProps, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useMethodBar } from "@/composables/useMethodBar";

import MethodButton from "@/components/common/methodBarButtons/BasicButton.vue";
import MethodButtonWithInput from "@/components/common/methodBarButtons/ButtonWithInput.vue";
import WarningBubble from "@/components/common/WarningBubble.vue";

// Define the events that the component can emit
const emit = defineEmits(["method-call"]);

// Define the properties the component expects to receive
const props = defineProps<{
  isInit: boolean;     // Whether the structure is initialized
  isActive: boolean;   // Whether a node is currently active
  isAnimating: boolean; // Whether an animation is currently in progress
}>();

// Set up internationalization (i18n) for translations
const { t } = useI18n();
const structureType = "lists";  // Set the structure type as "lists"

// Using a composable to manage method bar interactions
const {
  showWarning,             // Shows warning messages
  animationBlockedMethod,  // Checks if the animation blocks the method
  showInput,               // Controls visibility of input fields
  inputValues,             // Stores input field values
  errorMessages,           // Stores error messages for invalid inputs
  showWarningMessage,      // Displays a warning message
  baseButtonClickCheck,    // Validates if the button can be clicked
  onSubmitInput,           // Handles input submission
  resetInputs,             // Resets input fields
} = useMethodBar(props, emit, [
  "insertFirstNode",
  "insertAfterActiveNode",
  "setActiveNodeValue",
  "insertLastNode",
  "insertBeforeActiveNode"
]);

// Initialize the visibility of input fields for specific methods
showInput.value = {
  insertFirstNode: false,
  insertAfterActiveNode: false,
  setActiveNodeValue: false,
  insertLastNode: false,
  insertBeforeActiveNode: false,
};

// Initialize the input values for methods requiring user input
inputValues.value = {
  insertFirstNode: "",
  insertAfterActiveNode: "",
  setActiveNodeValue: "",
  insertLastNode: "",
  insertBeforeActiveNode: "",
};

// Initialize error messages for methods requiring validation
errorMessages.value = {
  insertFirstNode: "",
  insertAfterActiveNode: "",
  setActiveNodeValue: "",
  insertLastNode: "",
  insertBeforeActiveNode: "",
};

// Define methods that can change active node
const activeNodeMethods = [
  "activateNextNode",
  "activatePreviousNode",
  "getActiveNodeValue",
  "setActiveNodeValue",
  "insertAfterActiveNode",
  "deleteAfterActiveNode",
  "insertBeforeActiveNode",
  "deleteBeforeActiveNode",
];

// Handles button click events
const onButtonClick = (methodName: string) => {
  // Validates if the button can be clicked
  if (!baseButtonClickCheck(methodName)) return;

  // Show a warning if the structure is initialized but active node does not exist
  if (props.isInit && !props.isActive && activeNodeMethods.includes(methodName)) {
    showWarningMessage(`${methodName}-notActive`);
    return;
  }

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

// Watch for changes in the active state and reset inputs if no node is active
watch(() => props.isActive, (newVal) => {
  if (!newVal) resetInputs();
});
</script>

<template>
  <el-aside class="structure-method-bar-wrapper">
    <div class="method-bar">
      <!-- InitList(L) -->
      <MethodButton
          id="btn-init"
          label="InitList(L)"
          methodName="initStructure"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('initStructure')"
      />

      <!-- InsertFirst(L, El) -->
      <MethodButtonWithInput
          id="btn-insert-first"
          label="InsertFirst(L, El)"
          methodName="insertFirstNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('insertFirstNode')"
          :showInput="showInput.insertFirstNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.insertFirstNode"
          :errorMessage="errorMessages.insertFirstNode"
      />

      <!-- DeleteFirst(L) -->
      <MethodButton
          id="btn-delete-first"
          label="DeleteFirst(L)"
          methodName="deleteFirstNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('deleteFirstNode')"
      />

      <!-- InsertLast(L, El) -->
      <MethodButtonWithInput
          id="btn-insert-last"
          label="InsertLast(L, El)"
          methodName="insertLastNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('insertLastNode')"
          :showInput="showInput.insertLastNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.insertLastNode"
          :errorMessage="errorMessages.insertLastNode"
      />

      <!-- DeleteLast(L) -->
      <MethodButton
          id="btn-delete-last"
          label="DeleteLast(L)"
          methodName="deleteLastNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('deleteLastNode')"
      />

      <!-- GetFirst(L) -->
      <MethodButton
          id="btn-get-first"
          label="GetFirst(L)"
          methodName="getFirstNodeValue"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('getFirstNodeValue')"
      />

      <!-- GetLast(L) -->
      <MethodButton
          id="btn-get-last"
          label="GetLast(L)"
          methodName="getLastNodeValue"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('getLastNodeValue')"
      />

      <span class="active-label">{{ $t('structures.activeList') }}</span>

      <!-- First(L) -->
      <MethodButton
          id="btn-first"
          label="First(L)"
          methodName="activateFirstNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('activateFirstNode')"
      />

      <!-- Next(L) -->
      <MethodButton
          id="btn-next"
          label="Next(L)"
          methodName="activateNextNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('activateNextNode')"
      />
      <WarningBubble
          v-if="showWarning === 'activateNextNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-next"
      />

      <!-- Last(L) -->
      <MethodButton
          id="btn-last"
          label="Last(L)"
          methodName="activateLastNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('activateLastNode')"
      />

      <!-- Previous(L) -->
      <MethodButton
          id="btn-previous"
          label="Previous(L)"
          methodName="activatePreviousNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('activatePreviousNode')"
      />
      <WarningBubble
          v-if="showWarning === 'activatePreviousNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-previous"
      />

      <!-- GetValue(L) -->
      <MethodButton
          id="btn-get-value"
          label="GetValue(L)"
          methodName="getActiveNodeValue"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('getActiveNodeValue')"
      />
      <WarningBubble
          v-if="showWarning === 'getActiveNodeValue-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-get-value"
      />

      <!-- SetValue(L, El) -->
      <MethodButtonWithInput
          id="btn-set-value"
          label="SetValue(L, El)"
          methodName="setActiveNodeValue"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('setActiveNodeValue')"
          :showInput="showInput.setActiveNodeValue"
          @submit="onSubmitInput"

          :inputValue="inputValues.setActiveNodeValue"
          :errorMessage="errorMessages.setActiveNodeValue"
      />

      <WarningBubble
          v-if="showWarning === 'setActiveNodeValue-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-set-value"
      />

      <!-- InsertAfter(L, El) -->
      <MethodButtonWithInput
          id="btn-insert-after"
          label="InsertAfter(L, El)"
          methodName="insertAfterActiveNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('insertAfterActiveNode')"
          :showInput="showInput.insertAfterActiveNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.insertAfterActiveNode"
          :errorMessage="errorMessages.insertAfterActiveNode"
      />
      <WarningBubble
          v-if="showWarning === 'insertAfterActiveNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-insert-after"
      />

      <!-- DeleteAfter(L) -->
      <MethodButton
          id="btn-delete-after"
          label="DeleteAfter(L)"
          methodName="deleteAfterActiveNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('deleteAfterActiveNode')"
      />
      <WarningBubble
          v-if="showWarning === 'deleteAfterActiveNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-delete-after"
      />

      <!-- InsertBefore(L, El) -->
      <MethodButtonWithInput
          id="btn-insert-before"
          label="InsertBefore(L, El)"
          methodName="insertBeforeActiveNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('insertBeforeActiveNode')"
          :showInput="showInput.insertBeforeActiveNode"
          @submit="onSubmitInput"

          :inputValue="inputValues.insertBeforeActiveNode"
          :errorMessage="errorMessages.insertBeforeActiveNode"
      />
      <WarningBubble
          v-if="showWarning === 'insertBeforeActiveNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-insert-before"
      />

      <!-- DeleteBefore(L) -->
      <MethodButton
          id="btn-delete-before"
          label="DeleteBefore(L)"
          methodName="deleteBeforeActiveNode"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('deleteBeforeActiveNode')"
      />
      <WarningBubble
          v-if="showWarning === 'deleteBeforeActiveNode-notActive'"
          :message="t('warnings.lists.doublyNotActive')"
          targetSelector="#btn-delete-before"
      />

      <!-- IsActive(L) -->
      <MethodButton
          id="btn-is-active"
          label="IsActive(L)"
          methodName="isListActive"
          :isInit="props.isInit"
          :isAnimating="props.isAnimating"
          :showWarning="showWarning"
          :animationBlockedMethod="animationBlockedMethod"
          :structureType="structureType"
          @click="onButtonClick('isListActive')"
      />
      
    </div>
  </el-aside>
</template>
