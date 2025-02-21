import { defineStore } from "pinia";
import { useStorage, StorageSerializers } from "@vueuse/core";
import authAPI from "@/api/auth";
import { Role } from "@seitz/shared";

export interface IUser {
  _id: string;
  email: string;
  role: Role;
  studies: string[];
}

export const useAuthStore = defineStore("auth", () => {
  const currentUser = useStorage<IUser | null>("currentUser", null, undefined, {
    serializer: StorageSerializers.object,
  });

  function logOut() {
    authAPI.logOut();
    currentUser.value = null;
  }

  // Check if the current user has either super admin or one of the specified roles
  function hasAdminPower(...roles: Role[]) {
    const currentUserRole = currentUser.value?.role;
    return (
      currentUserRole !== undefined &&
      (currentUserRole === Role.SuperAdmin || roles.includes(currentUserRole))
    );
  }

  return { currentUser, logOut, hasAdminPower };
});
