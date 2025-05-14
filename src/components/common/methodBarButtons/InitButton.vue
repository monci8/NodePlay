<script setup lang="ts">
import {ref, toRef} from "vue";
import { useI18n } from "vue-i18n";
import WarningBubble from "@/components/common/WarningBubble.vue";
import {useWarningBubble} from "@/composables/useWarningBubble";

// Import translation function from i18n
const { t } = useI18n();

const props = defineProps<{
  id: string;                       // Unique identifier for the button
  label: string;                    // Text label for the button
  methodName: string;               // The method name associated with the button click
  showWarning: string | null;       // Warning message to display
  animationBlockedMethod: string | null; // Name of the method blocked by ongoing animation
  isAnimating?: boolean;            // Indicates whether an animation is currently running
  isInit?: boolean;                 // Checks if the structure is initialized
  structureType: "lists" | "stack" | "queue" | "tables";  // Type of data structure
  showInput?: boolean;              // Determines if input field is shown
  initOptions: number[];            // Array of available initialization options
}>();

// Setup warning bubble for input validation and animation checks
const { showWarningBubble, warningMessage, warningTarget } = useWarningBubble(
    toRef(props, "showWarning"),             // Reference to the warning message prop
    toRef(props, "animationBlockedMethod"),   // Reference to the animation blocked method prop
    toRef(props, "isAnimating"),              // Reference to the isAnimating prop
    props.methodName,                        // The method name associated with the warning
    props.id,                                // The ID of the button
    props.structureType,                     // The type of the structure
    { hasInput: true }
);

const emit = defineEmits(["submit", "click"]);

const inputInitNumber = ref("");  // Current init value entered by the user
const errorMessage = ref("");  // Validation error message

// Function to handle the submission of the initialization number
const submit = () => {
  const trimmed = inputInitNumber.value.trim();  // Remove extra spaces from the input

  // Validate the input number (only digits, can be negative)
  if (!/^-?\d+$/.test(trimmed)) {
    errorMessage.value = t('errors.inputNumber');  // Show error for invalid input
    return;
  }

  const number = parseInt(trimmed, 10);  // Convert the input string to an integer

  // Validate the number range (greater than 0 and less than 100)
  if (number <= 0) {
    errorMessage.value = t('errors.biggerThanZero');  // Show error if the number is less than or equal to 0
    return;
  }
  if (number > 99) {
    errorMessage.value = t('errors.lessThanHundred');  // Show error if the number is greater than 99
    return;
  }

  // Emit the valid number to the parent component
  emit("submit", number);

  // Reset the input field and clear the error message after successful submission
  inputInitNumber.value = "";
  errorMessage.value = "";
};
</script>

<template>
  <div class="method-container" :class="{ 'selected-method': props.showInput }">
    <button :id="props.id" class="method-button" @click="$emit('click', props.methodName)">
      {{ props.label }}
    </button>

    <template v-if="props.showInput">
      <div class="input-container">
        <div v-text="t('methodBar.initSentence')" class="init-text" />

        <div class="button-row">
          <button
              v-for="opt in props.initOptions"
              :key="opt"
              class="small-button"
              @click="$emit('submit', opt)"
          >
            {{ opt }}
          </button>
        </div>

        <div class="input-row">
          <input
              v-model="inputInitNumber"
              class="method-input"
              :placeholder="t('methodBar.count')"
              @keyup.enter="submit"
          />
          <button class="submit-init-button" @click="submit">
            {{ t('methodBar.enter') }}
          </button>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </template>

    <WarningBubble
        v-if="showWarningBubble"
        :message="warningMessage"
        :targetSelector="warningTarget"
    />
  </div>
</template>
