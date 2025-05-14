<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getCenteringSetting, setCenteringSetting,
  getAnimationSpeed, setAnimationSpeed } from "@/composables/localStorageSettings";

const { t } = useI18n();

// Get the current animation speed from local storage and calculate the display speed
const speed = ref<number>(getAnimationSpeed());
const displaySpeed = ref<number>(800 - speed.value);

// Define events that the component can emit
const emit = defineEmits(['update-speed', 'update-centering']);

// Get the current centering setting from local storage
const centeringEnable = ref(getCenteringSetting());

// Update speed when the user changes the value
const updateSpeed = (val: number) => {
  speed.value = 800 - val;  // Convert the value for display
};

// Format the tooltip based on the current speed value
const formatTooltip = (value: number) => {
  if (value <= 0) return t("footer.speed.slowest");       // Slowest speed
  if (value > 0 && value < 400) return t("footer.speed.slower");   // Slower speed
  if (value === 400) return t("footer.speed.medium");         // Medium speed
  if (value > 400 && value < 800) return t("footer.speed.faster");  // Faster speed
  if (value >= 800) return t("footer.speed.fastest");    // Fastest speed
  return t("footer.speed.unknown");                   // Unknown speed
};

// Watch for changes in the speed and update the local storage and emit event
watch(speed, (newSpeed) => {
  setAnimationSpeed(newSpeed);  // Save new speed to local storage
  emit('update-speed', newSpeed);  // Notify parent about speed change
});

// Watch for changes in centering setting and update local storage and emit event
watch(centeringEnable, (val) => {
  setCenteringSetting(val);  // Save centering setting to local storage
  emit('update-centering', val);  // Notify parent about centering change
});
</script>

<template>
  <main class="structure-footer">
    <div class="footer-left">
       <div class="footer-switch-label">{{ $t('footer.automaticCenter') }}</div>
        <el-switch
            v-model="centeringEnable"
            :active-text="$t('footer.automaticCenter')"
            :inactive-text="$t('footer.manualCenter')"
            :active-value="true"
            :inactive-value="false"
            class="center-switch"
        />
    </div>

    <div class="footer-right">
      <div class="footer-slider-label">{{ $t('slider.title') }}</div>
      <el-slider
          v-model="displaySpeed"
          :min="0"
          :max="800"
          :step="100"
          class="footer-slider"
          @change="updateSpeed"
          :show-tooltip="true"
          :format-tooltip="formatTooltip"
          :tooltip-class="'slider-tooltip'"
      ></el-slider>
    </div>
  </main>
</template>
