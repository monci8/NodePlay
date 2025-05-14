<script setup lang="ts">
import { toRef } from "vue";
import WarningBubble from "@/components/common/WarningBubble.vue";
import { useWarningBubble } from "@/composables/useWarningBubble";

const props = defineProps<{
  id: string;                       // Unique identifier for the button
  label: string;                    // Text label for the button
  methodName: string;               // The method name associated with the button click
  showWarning: string | null;       // Warning message to display
  animationBlockedMethod: string | null; // Name of the method blocked by ongoing animation
  isAnimating: boolean;             // Indicates whether an animation is currently running
  isInit: boolean;                  // Checks if the structure is initialized
  structureType: "lists" | "stack" | "queue" | "tables"; // The type of data structure
}>();

// Setup warning bubble for input validation and animation checks
const { showWarningBubble, warningMessage, warningTarget } = useWarningBubble(
    toRef(props, "showWarning"),             // Reference to the warning message prop
    toRef(props, "animationBlockedMethod"),   // Reference to the animation blocked method prop
    toRef(props, "isAnimating"),              // Reference to the isAnimating prop
    props.methodName,                        // The method name associated with the warning
    props.id,                                // The ID of the button
    props.structureType,                     // The type of the structure
);

// Emit event when the button is clicked
const emit = defineEmits(["click"]);
</script>


<template>
  <div class="method-container">
    <button :id="props.id" class="method-button" @click="$emit('click', props.methodName)">
      {{ props.label }}
    </button>

    <WarningBubble
        v-if="showWarningBubble"
        :message="warningMessage"
        :targetSelector="warningTarget"
    />
  </div>
</template>
