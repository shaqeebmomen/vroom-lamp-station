<template>
  <li
    :class="{
      'frame-item-root': true,
      level: true,
      'active-item': isActiveItem,
      error: error,
    }"
    @click="updateFrameIndex"
  >
    <div class="color-box level-left" :style="{ background: color }"></div>
    <input
      type="number"
      :disabled="index == 0"
      :class="{
        input: true,
        'level-item': true,
        'mx-2': true,
        'is-danger': error,
        'is-full-width': true,
      }"
      placeholder="time(ms)"
      v-model="timeStamp"
      required
      min="0"
      name="input"
    />
    <div class="level-right">
      <button
        class="button is-rounded is-danger is-small is-outlined close p-4"
        @click.stop="deleteFrame(index)"
        :disabled="deleteEnable"
      >
        <span class="icon">
          <i class="mdi mdi-18px mdi-close"></i>
        </span>
      </button>
    </div>
  </li>
</template>

<script>
import { computed, watch, ref } from "vue";
import colorHelp from "../helpers/color_help.js";

export default {
  emit: ["deleteFrame", "updateFrameIndex", "updateFrameTime"],
  props: ["frame", "index", "isActiveItem", "error", "deleteEnable"],
  setup(props, { emit }) {
    const timeStamp = ref(props.frame.timeStamp);

    watch(
      () => timeStamp.value,
      (newVal, oldVal) => {
        const data = {
          timeStamp: parseInt(newVal),
          index: props.index,
        };
        emit("updateFrameTime", data);
      }
    );
    watch(
      () => props.frame.timeStamp,
      (newVal, oldVal) => {
        timeStamp.value = newVal;
      }
    );

    const color = computed(() => {
      const { r, g, b } = props.frame.color;
      return colorHelp.rgbToStyle(r, g, b);
    });

    const updateFrameIndex = () => {
      emit("updateFrameIndex", props.index);
    };

    const deleteFrame = () => {
      emit("deleteFrame", props.index);
    };
    return { timeStamp, deleteFrame, updateFrameIndex, color };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.frame-item-root {
  @extend .py-2;
  @extend .px-3;

  margin: auto;

  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 90%;
  border-radius: 5px;
  box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.6);
  transition: all 0.2s;
  &.error {
    border: 1px red solid;
  }
}

.active-item {
  border: 1px $grey solid;
  transform: scale(1.05);
  transform-origin: center center;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
}

.input {
  //   min-width: 50px;
  width: 50%;
}
.color-box {
  border: 1px solid black;
  height: 2rem;
  width: 2rem;
  border-radius: 5px;
}
</style>