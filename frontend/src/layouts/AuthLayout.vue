<template>
  <div class="auth-layout">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import Toast from "@/components/Toast.vue";
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 16px;
}
</style>
