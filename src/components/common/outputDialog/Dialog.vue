<script setup lang="ts">
import OutputDialogButton from './DialogButton.vue';
import OutputDialogArea from './DialogArea.vue';

const props = defineProps<{
  output: { lines: { key: string, params?: Record<string, unknown> }[] };
  isOpen: boolean
}>();

const emit = defineEmits(['open','close']);

const toggleDialog = () => {
  emit(props.isOpen ? 'close' : 'open');
};

defineExpose({ toggleDialog });

</script>

<template>
  <div class="output-dialog">
    <OutputDialogButton :isOpen="props.isOpen" @toggle="toggleDialog" />
    <OutputDialogArea :isOpen="props.isOpen" :output="props.output" />
  </div>
</template>
