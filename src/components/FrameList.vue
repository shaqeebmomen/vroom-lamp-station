<template>
  <div class="frame-list-root">
    <div class="list-head level">
      <div class="level-left">
        <h1 class="title is-4">Frames</h1>
      </div>
      <div class="level-right">
        <div class="buttons">
          <button
            :disabled="animation.length < 2"
            class="button is-small"
            @click="removeFrame"
          >
            <span class="icon">
              <i class="mdi mdi-minus"></i>
            </span>
          </button>
          <button
            :disabled="animation.length > 10 || animation.length < 2"
            class="button is-small"
            @click="mirror"
          >
            <span class="icon">
              <i class="mdi mdi-mirror"></i>
            </span>
          </button>
          <button
            :disabled="animation.length > 19"
            class="button is-small"
            @click="addFrame"
          >
            <span class="icon">
              <i class="mdi mdi-plus"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
    <ul ref="list" :class="{ error: errorFrames.length > 0 }">
      <frame-item
        v-for="(item, index) in animation"
        :key="index"
        :frame="item"
        :isActiveItem="index == activeIndex"
        :index="index"
        :error="errorFrames.includes(index)"
        @updateFrameIndex="updateFrameIndex"
        @updateFrameTime="updateFrameTime"
        @deleteFrame="deleteFrame"
      />
    </ul>
    <p class="help is-danger" v-if="errorFrames.length > 0">
      {{ `Invalid Timestamps ( ${errorFrames.length} )` }}
    </p>
    <p class="help is-danger" v-if="animation.length > 19">
      Reached 20 Frame Limit!
    </p>
  </div>
</template>

<script>
// TODO transition group
import { nextTick, reactive, ref, watch } from "vue";
import FrameItem from "./FrameItem.vue";
export default {
  components: { FrameItem },

  emits: [
    "addFrame",
    "removeFrame",
    "deleteFrame",
    "updateFrameIndex",
    "updateFrameTime",
    "mirror",
  ],
  props: ["animation", "activeIndex","errorFrames"],
  setup(props, { emit }) {
    const list = ref(null);

    const updateFrameTime = (data) => {
      emit("updateFrameTime", data);
    };

    const scrollToFrame = (index) => {
      list.value.children[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    const updateFrameIndex = (index) => {
      emit("updateFrameIndex", index);
      list.value.children[index].children.namedItem("input").focus();
      scrollToFrame(index);
    };

    const addFrame = () => {
      emit("addFrame");
      nextTick(() => {
        updateFrameIndex(list.value.children.length - 1);
      });
    };

    /**
     * Removes frame from end of list
     */
    const removeFrame = () => {
      emit("removeFrame");
      nextTick(() => {
        updateFrameIndex(props.activeIndex);
      });
    };

    const deleteFrame = (index) => {
      updateFrameIndex(index - 1);
      nextTick(() => {
        emit("deleteFrame", index);
      });
    };

    const mirror = () => {
      emit("mirror");
    };

    return {
      list,
      addFrame,
      removeFrame,
      deleteFrame,
      updateFrameIndex,
      updateFrameTime,
      mirror,
    };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.frame-list-root {
  max-height: 280px;
  height: 100%;
  width: 100%;
}

.list-head {
  @extend .mb-3;
}

ul {
  @extend .py-3;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  box-shadow: inset $card-shadow;
  border-radius: $card-radius;
  &.error {
    border: 1px $danger solid;
  }
}
</style>