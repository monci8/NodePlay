<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="home-container">
    <h1 class="welcome-heading">{{ t('home.welcome') }}</h1>
    <p class="welcome-text">{{ t('home.description') }}</p>

    <div class="structure-links">
      <el-button
          class="structure-button"
          @click="navigateTo('/singly-linked-list')">
        {{ t('structures.singlyList') }}
      </el-button>

      <el-button
          class="structure-button"
          @click="navigateTo('/doubly-linked-list')">
        {{ t('structures.doublyList') }}
      </el-button>

      <el-button
          class="structure-button"
          @click="navigateTo('/circular-singly-linked-list')">
        {{ t('structures.circularSinglyList') }}
      </el-button>

      <el-button
          class="structure-button"
          @click="navigateTo('/stack')">
        {{ t('structures.stack') }}
      </el-button>

      <el-button
          class="structure-button"
          @click="navigateTo('/queue')">
        {{ t('structures.queue') }}
      </el-button>

      <el-button
          class="structure-button"
          @click="navigateTo('/binary-search-tree')">
        {{ t('structures.bvs') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: clamp(1.5rem, 3vw, 2rem);
  background-color: var(--background-color);
}

.welcome-heading {
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  margin-bottom: clamp(0.8rem, 1.5vw, 1rem);
  color: var(--text-color);
}

.welcome-text {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin-bottom: clamp(4rem, 6vw, 6rem);
  color: var(--text-color);

}

.structure-links {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.8rem, 2vw, 1rem);
  justify-content: center;
}


.structure-button {
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  height: clamp(40px, 7vw, 50px);
  padding: clamp(0.4rem, 1vw, 0.5rem) clamp(1.5rem, 3vw, 2rem);
  border-radius: clamp(8px, 2vw, 10px);
  color: var(--white-color);
  background-color: var(--primary-color);
  border: 2px solid var(--primary-color);
  box-shadow: var(--box-shadow-dark);
  transition: all 0.3s ease;
}

.structure-button:hover {
  background-color: var(--darker-blue);
  color: var(--white-color);
  border-color: var(--darker-blue);
  transform: translateY(clamp(-2px, -0.4vw, -3px));
}

.structure-button:active {
  background-color: var(--dark-blue);
  transform: translateY(0);
}

.structure-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--light-blue);
}
</style>
