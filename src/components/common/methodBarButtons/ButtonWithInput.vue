<script setup lang="ts">
import { ref, toRef, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import WarningBubble from "@/components/common/WarningBubble.vue";
import { useWarningBubble } from "@/composables/useWarningBubble";

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
  structureType: "lists" | "stack" | "queue" | "tables"; // Type of data structure
  showInput?: boolean;              // Determines if input field is shown
  inputValue?: string;              // Filled input value
  errorMessage?: string;            // Error message to display
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

const inputValue = ref(props.inputValue || "");   // Current value entered by the user
const errorMessage = ref(props.errorMessage || ""); // Validation error message

// Validate input based on structure type and rules
const validateInput = (input: string): string | null => {
  const trimmed = input.trim();

  // Check for empty input
  if (trimmed.length === 0) {
    return t('errors.emptyInput');  // Returns error message for empty input
  }

  // Specific validation based on the data structure type
  switch (props.structureType) {
    case "stack":
    case "queue":
      if (trimmed.length > 3) {
        return t('errors.max3Chars');  // Maximum 3 characters allowed
      }
      break;

    case "tables":
      if (!/^[+-]?\d+$/.test(trimmed)) {
        return t('errors.onlyDigits');  // Only digits allowed
      }

      let normalizedValue = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
      const digitCount = normalizedValue.startsWith('-')
          ? normalizedValue.slice(1).length
          : normalizedValue.length;

      if (digitCount > 3) {
        return t('errors.max3Digits');  // Maximum 3 digits allowed
      }
      break;

    case "lists":
      if (trimmed.length > 4) {
        return t('errors.max4Chars');  // Maximum 4 characters allowed
      }
      break;
  }

  return null;
};

// Normalize input to remove unnecessary characters or leading zeros
const normalizeInput = (input: string): string => {
  let trimmed = input.trim();

  if (props.structureType === "tables") {
    let normalizedValue = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
    const isNegative = normalizedValue.startsWith('-');
    let numberPart = isNegative ? normalizedValue.slice(1) : normalizedValue;
    numberPart = numberPart.replace(/^0+(?!$)/, ''); // Remove leading zeros
    normalizedValue = isNegative ? `-${numberPart}` : numberPart;
    return normalizedValue;
  }

  return trimmed;
};

// Handle submission of input data
const submit = () => {
  // Check if animation is in progress and structure is initialized
  if (props.isAnimating && props.isInit) {
    emit("submit", { methodName: props.methodName, value: inputValue.value.trim(), animationBlocked: true });
    return;
  }

  // Validate the input value
  const validationError = validateInput(inputValue.value.trim());

  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  // Normalize and clear the input after submission
  let normalizedValue = normalizeInput(inputValue.value.trim());
  inputValue.value = "";
  errorMessage.value = "";
  emit("submit", { methodName: props.methodName, value: normalizedValue, animationBlocked: false });

  // Optionally set a random number as new input value
  inputValue.value = generateRandomNumber();
};

// Generate a random number as a string (0-99)
const generateRandomNumber = () => {
  return Math.floor(Math.random() * 100).toString();
};

// Handle click event and generate a new random number
const handleClick = () => {
  inputValue.value = generateRandomNumber();
  emit("click", props.methodName);
};

// Clear the current input value
const clear = () => {
  inputValue.value = "";
};

</script>


<template>
  <div class="method-container" :class="{ 'selected-method': props.showInput }">
    <button
        :id="props.id"
        class="method-button"
        @click="handleClick"
        >
      {{ props.label }}
    </button>

      <div class="input-container" v-if="props.showInput">
        <div class="input-row">
          <input
              v-model="inputValue"
              class="method-input"
              placeholder="Element"
              @keyup.enter="submit"
          />

          <button class="clear-button" @click="clear">
            {{ t('methodBar.clear') }}
          </button>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button :id="`${props.id}-submit`" class="submit-button" @click="submit">
          {{ t('methodBar.enter') }}
        </button>
      </div>

    <WarningBubble
        v-if="showWarningBubble"
        :message="warningMessage"
        :targetSelector="warningTarget"
    />
  </div>
</template>
