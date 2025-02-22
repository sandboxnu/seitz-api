<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Role } from "@seitz/shared";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const collapsePressed = ref(false);

function logOut() {
  authStore.logOut();
  router.push("/login");
}

const isCollapsed = computed(() => {
  return collapsePressed.value && !!authStore.currentUser;
});
</script>

<template>
  <ElMenu
    :class="[
      'border-b-0 flex flex-col h-full shrink-0 bg-neutral-600',
      isCollapsed ? 'w-16' : 'w-44',
    ]"
    :default-active="route.path"
    mode="vertical"
    :router="true"
    :ellipsis="false"
    text-color="white"
    active-text-color="white"
  >
    <ElImage
      v-if="!isCollapsed && authStore.currentUser"
      src="/icons/ep_d-arrow-left.svg"
      class="h-5 w-5 mt-[22px] mr-3.5 self-end cursor-pointer"
      @click="collapsePressed = true"
    />
    <ElImage
      v-else-if="authStore.currentUser"
      src="/icons/ep_d-arrow-right.svg"
      class="h-5 w-5 mt-[22px] self-center cursor-pointer"
      @click="collapsePressed = false"
    />
    <ElMenuItem class="flex items-center gap-3">
      <ElImage src="/icons/home.svg" />
      <template v-if="!isCollapsed">Home</template>
    </ElMenuItem>
    <template v-if="authStore.currentUser">
      <ElMenuItem index="/studies" class="flex items-center gap-3">
        <ElImage src="/icons/ep_notebook.svg" />
        <template v-if="!isCollapsed">My Studies</template>
      </ElMenuItem>
      <ElMenuItem class="flex items-center gap-3">
        <ElImage src="/icons/person.svg" />
        <template v-if="!isCollapsed">Profile</template>
      </ElMenuItem>
      <template
        v-if="authStore.hasAdminPower(Role.StudyManager, Role.UserManager)"
      >
        <ElImage src="/icons/horiz-line.svg" class="mx-6 my-9" />
        <ElMenuItem
          v-if="authStore.hasAdminPower(Role.StudyManager)"
          index="/admin"
          class="flex items-center gap-3"
        >
          <ElImage src="/icons/pencil.svg" />
          <template v-if="!isCollapsed">Task Templates</template>
        </ElMenuItem>
        <ElMenuItem
          v-if="authStore.hasAdminPower(Role.UserManager)"
          index="/admin/users"
          class="flex items-center gap-3"
        >
          <ElImage src="/icons/people.svg" />
          <template v-if="!isCollapsed">Users</template>
        </ElMenuItem>
      </template>
      <div class="grow"></div>
      <ElMenuItem
        index="/logout"
        :onclick="logOut"
        class="flex items-center gap-3"
      >
        <ElImage src="/icons/logout.svg" />
        <template v-if="!isCollapsed">
          Log Out, {{ authStore.currentUser.email }}
        </template>
      </ElMenuItem>
    </template>
    <template v-else>
      <div class="flex-1"></div>
      <ElMenuItem index="/login">Log In</ElMenuItem>
      <ElMenuItem index="/signup">Sign Up</ElMenuItem>
    </template>
    <div class="h-20 text-lg text-white pl-3.5 mt-4">
      <RouterLink v-if="!isCollapsed" to="/" class="flex flex-col items-left">
        <span class="font-light">Northeastern</span>
        <span class="font-bold">Brain Game Center</span>
      </RouterLink>
    </div>
  </ElMenu>
</template>

<style>
.el-menu-item:hover {
  background: #333333 !important;
}
</style>
