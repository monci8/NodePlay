<script setup lang="ts">
import SinglyLinkedListMethodBar from "@/components/structures/singlyLinkedList/MethodBar.vue";

// Defining properties (props) that the component expects to receive
const props = defineProps<{
  isInit: boolean;     // Whether the list is initialized
  isActive: boolean;   // Whether the list is currently active
  isAnimating: boolean; // Whether an animation is currently running
}>();

// Defining the events that the component can emit
const emit = defineEmits<{
  (e: 'method-call', methodName: string, value?: string): void;
}>();
</script>

<template>
  <SinglyLinkedListMethodBar
      :isInit="props.isInit"
      :isActive="props.isActive"
      :isAnimating="props.isAnimating"
      @method-call="(methodName, value) => emit('method-call', methodName, value)"
  />
</template>
