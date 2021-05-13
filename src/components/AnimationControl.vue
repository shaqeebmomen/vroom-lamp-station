<template>
  <div :class="{ modal: true, 'is-active': isActive }">
    <div class="modal-background"></div>
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
            <color-picker class="color-picker" />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot"></footer>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import ColorPicker from "./ColorPicker.vue";
export default {
  components: { ColorPicker },
  props: {
    isActive: {
      default: true,
      type: Boolean,
    },
    animation: {
      default: [
        { color: "white", mark: "0%", active: false },
        { color: "blue", mark: "10%", active: false },
        { color: "green", mark: "60%", active: true },
        { color: "red", mark: "100%", active: false },
      ],
    },
  },
  setup(props) {
    const gradientString = ref("");
    onMounted(() => {
      let temp = "linear-gradient(to right,";
      props.animation.forEach((frame) => {
        temp += frame.color + " " + frame.mark + ",";
      });
      gradientString.value = temp.substring(0, temp.length - 1) + ")";
    });

    return { gradientString };
  },
};
</script>

<style lang="scss">
@import "../assets/sass/main.scss";
.modal-card {
  max-height: 80%;
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
  grid-template: repeat(4, 1fr) / 1fr 1fr;
  min-height: 300px;
}
.color-picker {
  width: 100%;
  grid-column: 1;
  grid-row: 1/5;
}
</style>