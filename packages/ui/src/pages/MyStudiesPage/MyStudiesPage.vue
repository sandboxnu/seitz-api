<script setup lang="ts">
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { useQuery, useMutation } from "@tanstack/vue-query";
import studiesAPI from "@/api/studies";

import MyStudiesItem from "./components/MyStudiesItem.vue";
import RecentStudiesItem from "./components/RecentStudiesItem.vue";
import AppButton from "@/components/ui/AppButton.vue";

const router = useRouter();
const authStore = useAuthStore();

if (!authStore.currentUser) {
  router.push("/login");
}

const { data, refetch } = useQuery({
  queryKey: ["studies"],
  queryFn: studiesAPI.getStudies,
});

const { mutate, isLoading } = useMutation({
  mutationFn: () => studiesAPI.createStudy(),
  onSuccess: (createdStudyId) => {
    router.push({ name: "study", params: { id: createdStudyId } });
  },
});

const studies = data;
</script>
<template>
  <div v-loading="isLoading" class="mt-14 mx-auto w-3/4 min-w-[600px]">
    <div class="flex items-center">
      <h1 class="text-3xl font-bold">My Studies</h1>
      <div class="flex-1"></div>
      <AppButton @click="mutate">+ New Study</AppButton>
    </div>

    <div
      class="mt-8 mb-3 flex text-neutral-600 text-lg font-normal leading-tight"
    >
      Recent
    </div>

    <div class="space-y-6">
      <!-- RECENT STUDIES -->
      <div class="overflow-y-auto">
        <div class="flex gap-4">
          <RecentStudiesItem
            v-for="study in studies"
            :id="study._id"
            :key="study._id"
            :name="study.name"
            :description="study.description"
            @deleted="refetch"
          />
        </div>
      </div>
      <!-- STUDY TABLE -->
      <div class="rounded-xl border border-neutral-300 overflow-y-auto">
        <!-- TABLE HEADERS -->
        <div
          class="px-8 py-[18px] bg-neutral-50 rounded-t-xl border-b border-neutral-300 flex justify-between items-start"
        >
          <div class="flex items-center gap-[130px]">
            <div
              class="w-[82px] text-neutral-600 text-lg font-bold leading-tight"
            >
              Name
            </div>
            <div
              class="w-[432px] text-neutral-600 text-lg font-bold leading-tight"
            >
              Description
            </div>
          </div>
          <div class="flex items-center gap-24">
            <div class="text-neutral-600 text-lg font-bold leading-tight">
              Status
            </div>
            <div class="text-neutral-600 text-lg font-bold leading-tight">
              Conditions
            </div>
            <div
              class="w-[110px] text-neutral-600 text-lg font-bold leading-tight"
            >
              Last Modified
            </div>
          </div>
        </div>
        <!-- STUDIES -->
        <div class="self-stretch">
          <MyStudiesItem
            v-for="study in studies"
            :id="study._id"
            :key="study._id"
            :name="study.name"
            :description="study.description"
            @deleted="refetch"
          />
        </div>
      </div>
    </div>
  </div>
</template>
