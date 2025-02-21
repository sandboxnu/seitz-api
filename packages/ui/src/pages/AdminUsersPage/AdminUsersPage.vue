<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import adminAPI from "@/api/admin";
import AppButton from "@/components/ui/AppButton.vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ElButton, ElCard, ElNotification } from "element-plus";
import { Role } from "@seitz/shared";
import RolesDropdown from "./components/RolesDropdown.vue";

const router = useRouter();
const authStore = useAuthStore();
const queryClient = useQueryClient();

const usersToAdd = ref<string[]>([]);
const searchQuery = ref("");
const { data: adminUsers, isLoading: isAdminsLoading } = useQuery(
  ["admins"],
  adminAPI.getAdminUsers
);
const { data: allUsers, isLoading: isUsersLoading } = useQuery(
  ["users"],
  adminAPI.getAllUsers
);
const addAdmin = useMutation(
  // TODO: Change this to use the new ROLE variable here ↓↓↓↓
  (userId: string) => adminAPI.assignAdminRole(userId, Role.SuperAdmin),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      ElNotification({
        title: "Success",
        message: "Admin user added",
        type: "success",
      });
    },
    onError: (error) => {
      console.error(error);
      ElNotification({
        title: "Error",
        message: "Failed to add admin user",
        type: "error",
      });
    },
  }
);
const removeAdmin = useMutation(
  (userId: string) => adminAPI.removeUserAsAdmin(userId),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      ElNotification({
        title: "Success",
        message: "Admin user removed",
        type: "success",
      });
    },
    onError: (error) => {
      console.error(error);
      ElNotification({
        title: "Error",
        message: "Failed to remove admin user",
        type: "error",
      });
    },
  }
);

const addAdminDialogVisible = ref(false);
const removeAdminDialogVisible = ref(false);
const userToRemove = ref<{ email: string; userId: string } | null>(null);

const handleAddAdmin = (userId: string) => {
  if (usersToAdd.value.includes(userId)) {
    usersToAdd.value = usersToAdd.value.filter((id) => id !== userId);
    return;
  }
  usersToAdd.value.push(userId);
  addAdminDialogVisible.value = true;
};

const handleRemoveAdmin = (email: string, userId: string) => {
  userToRemove.value = { email, userId };
  removeAdminDialogVisible.value = true;
};

const confirmAddAdmin = () => {
  if (usersToAdd.value) {
    usersToAdd.value.forEach((userId) => {
      addAdmin.mutate(userId);
    });

    usersToAdd.value = [];
    addAdminDialogVisible.value = false;
  }
};

const confirmRemoveAdmin = () => {
  if (userToRemove.value) {
    removeAdmin.mutate(userToRemove.value.userId);
    userToRemove.value = null;
    removeAdminDialogVisible.value = false;
  }
};

const isUserAdmin = (userId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adminUsers.value.some((admin: any) => admin._id === userId);
};

const filteredUsers = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return allUsers.value?.filter((user: any) =>
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
// TODO: Should all admins be able to access this page?
if (
  !authStore.currentUser?.role ||
  authStore.currentUser.role === Role.BasicUser
) {
  router.push("/");
}
</script>

<template>
  <div class="mt-8 mx-4">
    <el-dialog
      v-model="removeAdminDialogVisible"
      title="Remove Administrator:"
      width="500"
      class="rounded-xl"
    >
      <p v-if="userToRemove" class="mb-6">
        Are you sure you want to remove {{ userToRemove.email }} as an
        administrator?
      </p>
      <div class="flex">
        <el-button
          class="rounded-lg px-5 py-1 justify-center"
          @click="removeAdminDialogVisible = false"
          >Cancel</el-button
        >
        <AppButton class="ml-auto" type="primary" @click="confirmRemoveAdmin">
          Remove
        </AppButton>
      </div>
    </el-dialog>

    <el-dialog
      v-model="addAdminDialogVisible"
      title="Add Administrator:"
      width="500"
      class="rounded-xl"
    >
      <div>
        <ElInput
          v-model="searchQuery"
          placeholder="Search by email"
          class="w-full rounded-full"
        />
      </div>

      <div class="m-4 mb-8 h-32 overflow-auto">
        <table
          v-if="!isUsersLoading && filteredUsers.length > 0"
          class="w-full table-auto border-collapse"
        >
          <tbody>
            <tr v-for="user in filteredUsers" :key="user._id">
              <td class="py-2 px-4 border-b flex items-center justify-evenly">
                <!-- PLACEHOLDER NAME -->
                <div class="mr-auto font-bold">First Last</div>
                <div>{{ user.email }}</div>
                <div class="ml-auto">
                  <ElButton
                    :text="true"
                    type="primary"
                    :class="{
                      'ml-2 hover:bg-red-100 text-red-600 underline':
                        !usersToAdd.includes(user._id),
                      'ml-2 hover:bg-green-200 bg-green-100 text-green-600 underline':
                        usersToAdd.includes(user._id),
                    }"
                    :disabled="isUserAdmin(user._id)"
                    size="small"
                    style="width: 60px"
                    @click="handleAddAdmin(user._id)"
                    >{{
                      usersToAdd.includes(user._id) ||
                      adminUsers.find((admin: any) => admin._id === user._id)
                        ? "Added"
                        : "Add"
                    }}
                  </ElButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!isUsersLoading && filteredUsers.length === 0">
          No users found.
        </p>
        <p v-else>Loading...</p>
      </div>

      <hr class="border-black w-11/12 mx-auto" />
      <div
        class="ml-5 text-black text-base font-bold text-left py-2 whitespace-nowrap"
      >
        Selected Administrators
      </div>

      <div class="m-4 mb-8 h-32 overflow-auto">
        <!-- PLACEHOLDER TABLE, NEED TO USE A NEW LIST WITH SELECTED ADMINS-->
        <table
          v-if="!isUsersLoading && filteredUsers.length > 0"
          class="w-full table-auto border-collapse"
        >
          <tbody>
            <tr v-for="user in filteredUsers" :key="user._id">
              <td class="py-2 px-4 border-b flex items-center justify-evenly">
                <!-- PLACEHOLDER NAME -->
                <div class="mr-auto font-bold">First Last</div>
                <div class="ml-auto">
                  <RolesDropdown :user="user" />
                </div>
                <!-- REMOVE BUTTON, NEED TO IMPLEMENT @CLICK TO REMOVE FROM usersToAdd -->
                <div class="ml-auto">
                  <ElButton
                    :text="true"
                    type="danger"
                    class="hover:bg-red-100 text-red-600 underline"
                    size="small"
                    >Remove</ElButton
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!isUsersLoading && filteredUsers.length === 0">
          No users found.
        </p>
        <p v-else>Loading...</p>
      </div>
      <div class="flex">
        <el-button
          class="rounded-lg px-5 py-1 justify-center"
          @click="addAdminDialogVisible = false"
          >Cancel</el-button
        >
        <AppButton
          class="ml-auto bg-black text-white"
          type="primary"
          :disabled="usersToAdd.length === 0"
          @click="confirmAddAdmin"
        >
          Add Selected
        </AppButton>
      </div>
    </el-dialog>

    <ElCard class="rounded-xl shadow-md m-10">
      <div class="m-4">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-lg mb-4">Administrators</h2>
          <AppButton type="primary" @click="addAdminDialogVisible = true"
            >Add Administrator</AppButton
          >
        </div>
        <table
          v-if="!isAdminsLoading && adminUsers.length > 0"
          class="w-full table-auto border-collapse"
        >
          <thead>
            <tr>
              <!-- PLACEHOLDER FOR FIRST NAME -->
              <th class="text-black text-center py-2 px-2 border-b-2">
                First Name
              </th>
              <!-- PLACEHOLDER FOR LAST NAME -->
              <th class="text-black text-center py-2 px-2 border-b-2">
                Last Name
              </th>
              <th class="text-black text-left py-2 px-12 border-b-2">Email</th>
              <th class="text-black text-left py-2 px-4 border-b-2">
                Admin Type
              </th>
              <th class="text-black text-right py-2 px-4 border-b-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in adminUsers" :key="user._id">
              <td class="py-2 px-4 border-b text-center">First</td>
              <td class="py-2 px-4 border-b text-center">Last</td>
              <td class="py-2 px-12 border-b">
                {{ user.email }}
              </td>
              <td class="py-2 px-4 border-b text-left">
                <RolesDropdown :user="user" />
              </td>
              <td class="py-2 px-4 border-b text-right">
                <ElButton
                  :text="true"
                  type="danger"
                  class="hover:bg-red-100 text-red-600 underline"
                  @click="handleRemoveAdmin(user.email, user._id)"
                  >Remove</ElButton
                >
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!isAdminsLoading && adminUsers.length === 0">
          No admins available
        </p>
        <p v-else>Loading...</p>
      </div>
    </ElCard>
  </div>
</template>
