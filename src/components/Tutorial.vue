<script setup lang="ts">
// Import necessary functions from Vue and i18n for reactivity and localization
import { ref, watch } from 'vue'
import { i18n } from '@/i18n'

// Initialize a reactive reference for tutorial steps using i18n for translation
const steps = ref<string[]>(i18n.global.tm('tutorial.steps') as string[])

// Watch for changes in the selected language and update the tutorial steps
watch(() => i18n.global.locale.value, () => {
  steps.value = i18n.global.tm('tutorial.steps') as string[]
})

</script>

<template>
  <div class="container">
    <div class="tutorial-layout">
      <div class="text-side">
        <!-- Display the tutorial title using i18n translation -->
        <h2 class="title">{{ $t('tutorial.title') }}</h2>
        <!-- Render the list of tutorial steps -->
        <ol class="steps">
          <li v-for="(step, index) in steps" :key="index">{{ step }}</li>
        </ol>
      </div>
      <div class="image-side">
        <!-- Display a tutorial image -->
        <img src='../assets/tutorial.png' alt="Ukážka aplikácie" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  text-align: center;
  padding: clamp(0.8rem, 2vw, 1.5rem);
  background-color: var(--white-color);
}

.tutorial-layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 1100px;
  margin: clamp(0.5rem, 2vw, 1rem) auto;
  background-color: var(--white-blue-color);
  border-radius: 10px;
  box-shadow: var(--box-shadow-dark);
}

.image-side {
  flex: 1.2;
  min-width: 250px;
  max-width: 100%;
  padding: clamp(1rem, 2vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-side img {
  width: 100%;
  max-width: 100%;
  border-radius: 7px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-side img:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.text-side {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color);
}

.steps {
  list-style-position: inside;
  font-size: 14px;
  line-height: 1.5;
  padding-left: 0;
  color: #333;
}

.steps li {
  margin-bottom: clamp(8px, 1.5vw, 12px);
  padding: clamp(6px, 1vw, 8px);
  background-color: var(--light-blue);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.steps li:hover {
  transform: translateY(-2px);
  background-color: var(--light-blue);
}

.steps li {
  margin-bottom: 12px;
}

@media (max-width: 900px) {
  .tutorial-layout {
    flex-direction: column;
    padding: clamp(1.5rem, 4vw, 2.5rem);
  }

  .image-side, .text-side {
    flex: 1;
    margin: clamp(1rem, 3vw, 1.5rem) 0;
  }
}

@media (max-width: 600px) {
  .title {
    font-size: clamp(16px, 4vw, 24px);
  }

  .steps {
    font-size: clamp(10px, 2.5vw, 16px);
  }

  .steps li {
    padding: clamp(4px, 1vw, 6px);
  }
}
</style>
