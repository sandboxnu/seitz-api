<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AdminTaskLibrary from "./components/AdminTaskLibrary.vue";
import BatteryEditForm from "./components/BatteryEditForm.vue";
import { useBatteryEditingStore } from "../../stores/admin";
import { Role } from "@seitz/shared";

const router = useRouter();
const authStore = useAuthStore();
const batteryEditingStore = useBatteryEditingStore();

if (!authStore.hasAdminPower(Role.StudyManager)) {
  router.push("/");
}
</script>
<template>
  <div class="flex h-screen items-stretch">
    <AdminTaskLibrary class="flex-none" />
    <div
      v-if="batteryEditingStore.editingBatteryId !== undefined"
      class="flex-1 mx-6 my-8 p-8 rounded-2xl min-w-[600px] bg-white shadow-xl overflow-y-hidden"
    >
      <BatteryEditForm />
    </div>
  </div>
</template>
