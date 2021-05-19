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
    <ul ref="list" :class="{ error: errorFrames.value.length > 0 }">
      <frame-item
        v-for="(item, index) in animation"
        :key="index"
        :frame="item"
        :isActiveItem="index == activeIndex"
        :index="index"
        @updateFrameIndex="updateFrameIndex"
        @updateFrameTime="updateFrameTime"
        @deleteFrame="deleteFrame"
        :error="errorFrames.value.includes(index)"
      />
    </ul>
    <p class="help is-danger" v-if="errorFrames.value.length > 0">
      {{ `Invalid Timestamps ( ${errorFrames.value.length} )` }}
    </p>
    <p class="help is-danger" v-if="animation.length > 19">
      Reached 20 Frame Limit!
    </p>
  </div>
</template>

<script>
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
  props: ["animation", "activeIndex", "wasReset"],
  setup(props, { emit }) {
    const list = ref(null);
    const errorFrames = reactive({ value: [] });

    // Reset errors if animation was reset
    watch(
      () => props.wasReset,
      (newVal, oldVal) => {
        if (newVal) errorFrames.value = [];
      }
    );

    const updateFrameTime = (data) => {
      // If the intent timestamp change is less than the previous frame or greater than the next
      if (
        isNaN(data.timeStamp) ||
        (data.index > 0 &&
          props.animation[data.index - 1].timeStamp > data.timeStamp) ||
        (data.index < props.animation.length - 1 &&
          props.animation[data.index + 1].timeStamp < data.timeStamp)
      ) {
        // Dont emit anything and add this frame to the error list if not already there
        if (!errorFrames.value.includes(data.index)) {
          errorFrames.value.push(data.index);
        }
      } else {
        // Data is good, remove the frame from the error list and emit event accordingly
        errorFrames.value = errorFrames.value.filter((val) => {
          return val != data.index;
        });
        emit("updateFrameTime", data);
      }
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
      errorFrames,
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