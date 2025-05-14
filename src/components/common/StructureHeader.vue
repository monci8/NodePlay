<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import WarningBubble from "@/components/common/WarningBubble.vue";

const { t } = useI18n();

const props = defineProps<{
  structureName: String;   // Name of the structure being displayed
  statusInfo: String;      // Status message to display
  isAnimating: boolean;    // Flag indicating if an animation is currently running
}>();

const emit = defineEmits<{
  (e: 'center-canvas'): void;  // Event to center the canvas
  (e: 'click-reset'): void;    // Event to reset the structure
  (e: 'click-random'): void;   // Event to generate a random structure
}>();

// State to store warning messages for the footer
const headerWarning = ref<string | null>(null);
const isSmallScreen = ref<boolean>(window.innerWidth < 1500);

const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 1500;
};

onMounted(() => {
  window.addEventListener("resize", updateScreenSize);
});

// Handle click events based on the action type
const handleClick = (action: 'random' | 'reset') => {
  // If animation is in process, show a warning and return
  if (props.isAnimating) {
    headerWarning.value = action;
    setTimeout(() => headerWarning.value = null, 2000);  // Warning for 2 seconds
    return;
  }

  // Emit the corresponding event based on the action
  if (action === 'reset') {
    emit('click-reset');
  } else if (action === 'random') {
    emit('click-random');
  } else {
    emit('center-canvas');
  }
};
</script>


<template>
  <main class="structure-header">
    <div class="structure-header-left">
      <el-tooltip
          v-if="isSmallScreen" effect="light"
          :content="t('header.center')" placement="top">
        <template #default>
          <el-button
              @click="emit('center-canvas')"
              class="center-button">
            <span class="icon"> &#8853; </span>
            <span class="tutorial-text">{{ $t('header.center') }}</span>
          </el-button>
        </template>
      </el-tooltip>
      <el-button v-else
                 @click="emit('center-canvas')"
                 class="center-button">
        <span class="icon"> &#8853; </span>
        <span class="tutorial-text">{{ $t('header.center') }}</span>
      </el-button>


      <el-tooltip
          v-if="isSmallScreen" effect="light"
          :content="t('footer.clear')" placement="top">
        <template #default>
          <el-button id="btn-reset" class="reset-button" @click="handleClick('reset')">
            <span class="icon"> &#10227; </span>
            <span class="tutorial-text">{{ t('footer.clear') }}</span>
          </el-button>
        </template>
      </el-tooltip>
      <el-button v-else id="btn-reset" class="reset-button" @click="handleClick('reset')">
        <span class="icon"> &#10227; </span>
        <span class="tutorial-text">{{ t('footer.clear') }}</span>
      </el-button>
      <WarningBubble
          v-if="headerWarning === 'reset'"
          :message="$t('warnings.animation')"
          targetSelector="#btn-reset"
      />
    </div>

    <div class="structure-header-center">
      <div class="structure-name">{{ structureName }}</div>
      <div class="status-info">{{ statusInfo }}</div>
    </div>

    <div class="structure-header-right">
        <el-tooltip
            v-if="isSmallScreen" effect="light"
            :content="t('footer.random')" placement="top">
          <template #default>
            <el-button id="btn-random" class="random-button" @click="handleClick('random')">
              <span class="icon"> &#127922; </span>
              <span class="tutorial-text">{{ t('footer.random') }}</span>
            </el-button>
          </template>
        </el-tooltip>
        <el-button v-else id="btn-random" class="random-button" @click="handleClick('random')">
          <span class="icon"> &#127922; </span>
          <span class="tutorial-text">{{ t('footer.random') }}</span>
        </el-button>

      <WarningBubble
          v-if="headerWarning === 'random'"
          :message="$t('warnings.animation')"
          targetSelector="#btn-random"
      />
    </div>
  </main>
</template>

