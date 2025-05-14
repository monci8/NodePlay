<script setup lang="ts">
import { i18n } from "@/i18n"

type AvailableLocales = 'sk'|'en'|'cs' ;

const emit = defineEmits(["toggle-sidebar"]);

function switchLanguage(lang: AvailableLocales) {
  i18n.global.locale.value = lang
}
</script>

<template>
  <el-container class="app-header">
    <div class="header-left">
      <!-- Hamburger menu pre sidebar -->
      <button class="hamburger" @click="emit('toggle-sidebar')">
        &#9776;
      </button>

      <!-- Tutorial button -->
      <el-button class="tutorial-button">
        <router-link to="/tutorial">
          <span class="icon"> &#10068; </span>
          <span class="tutorial-text">{{ $t('header.tutorial') }}</span>
        </router-link>
      </el-button>
    </div>

    <div class="header-center">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.svg" alt="NodePlay Logo" />
        NodePlay
      </router-link>
    </div>

    <div class="header-right">
      <span class="lang-label">{{ $t('header.lang') }}</span>
        <div class="lang-buttons">
        <el-button
            v-for="locale in ['cs', 'en', 'sk']"
            :key="locale"
            class="lang-button"
            @click="switchLanguage(locale as AvailableLocales)"
            :class="{ active: i18n.global.locale.value === locale }"
        >
          {{ locale.toUpperCase() }}
        </el-button>
      </div>
    </div>
  </el-container>
</template>