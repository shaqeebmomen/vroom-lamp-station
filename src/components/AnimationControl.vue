<template>
  <div :class="{ modal: true, 'is-active': isActive }">
    <div class="modal-background" @click="onClose"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Create Animation</p>
      </header>
      <section class="modal-card-body">
        <div class="color-display-container">
          <div
            class="display"
            :style="{
              background: gradientString,
            }"
          ></div>
          <div class="controls mt-3">
            <color-picker
              class="color-picker"
              :activeColor="animation[activeIndex].color"
              @colorChange="colorChange"
            />
            <frame-list
              :animation="animation"
              :activeIndex="activeIndex"
              class="frame-list mt-2"
              @updateFrameIndex="updateFrameIndex"
              @updateFrameTime="updateFrameTime"
              @addFrame="addFrame"
              @removeFrame="removeFrame"
              @deleteFrame="deleteFrame"
            />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <p class="has-text-warning">
          {{ "Avoid Values Under 10, Except 0" }}
        </p>
        <button
          @click="onReset"
          class="button is-small is-outlined p-3 is-rounded"
        >
          <span class="icon is-medium">
            <i class="mdi mdi-24px mdi-refresh"></i>
          </span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from "vue";
import ColorPicker from "./ColorPicker.vue";
import FrameList from "./FrameList.vue";
import colorHelp from "../helpers/color_help.js";
export default {
  components: { ColorPicker, FrameList },
  props: {
    isActive: {
      default: true,
      type: Boolean,
    },
    animation: {},
  },
  emits: [
    "modalClose",
    "updateFrameTime",
    "addFrame",
    "removeFrame",
    "deleteFrame",
    "colorChange",
    "resetAnim",
  ],
  setup(props, { emit }) {
    const gradientString = computed(() => {
      const maxTime = props.animation[props.animation.length - 1].timeStamp;
      let temp = "linear-gradient(to right,";
      props.animation.forEach((frame) => {
        temp +=
          colorHelp.rgbToStyle(frame.color.r, frame.color.g, frame.color.b) +
          " " +
          Math.floor((frame.timeStamp / maxTime) * 100).toString() +
          "% ,";
      });
      return temp.substring(0, temp.length - 1) + ")";
    });

    // Handling Frame Changes
    const updateFrameTime = (data) => {
      emit("updateFrameTime", data);
    };

    const activeIndex = ref(0); // Active frame chosen to edit
    const updateFrameIndex = (index) => {
      activeIndex.value = index;
    };

    watch(
      () => props.animation,
      (newVal, oldVal) => {
        updateFrameIndex(0);
      }
    );

    const addFrame = () => {
      emit("addFrame");
    };

    const removeFrame = () => {
      if (activeIndex.value == props.animation.length - 1) {
        updateFrameIndex(activeIndex.value - 1);
      }
      emit("removeFrame");
    };

    const deleteFrame = (index) => {
      emit("deleteFrame", index);
    };

    // Modal
    const onClose = () => {
      emit("modalClose", null);
    };

    // Color picker
    const colorChange = (data) => {
      emit("colorChange", { index: activeIndex.value, color: { ...data } });
    };

    // Reset
    const onReset = () => {
      emit("resetAnim");
    };

    return {
      gradientString,
      activeIndex,
      onClose,
      addFrame,
      removeFrame,
      deleteFrame,
      updateFrameIndex,
      updateFrameTime,
      colorChange,
      onReset,
    };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";

.modal-card {
  min-height: 650px;
  height: 80%;
  min-width: 500px;
  width: 60%;
}
.color-display-container {
  height: 100%;
}
.display {
  border: black 1px solid;
  border-radius: $card-radius;
  height: 100px;
  width: 100%;
}
.controls {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
  height: 300px;
}
.color-picker {
  width: 100%;
  grid-column: 1;
}
.frame-list {
  width: 100%;
  grid-column: 3;
}

.modal-card-foot {
  display: flex;
  justify-content: space-between;
}
</style>