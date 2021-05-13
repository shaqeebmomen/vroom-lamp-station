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
            <color-picker class="color-picker" />
            <frame-list
              :animation="animation"
              :activeIndex="activeIndex"
              class="frame-list mt-2"
            />
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
import FrameList from "./FrameList.vue";
// TODO convert marks from % to timestamps
export default {
  components: { ColorPicker, FrameList },
  props: {
    isActive: {
      default: true,
      type: Boolean,
    },
    animation: {
      default: [
        { color: "white", mark: "0%" },
        { color: "blue", mark: "10%" },
        { color: "teal", mark: "20%" },
        { color: "lime", mark: "24%" },
        { color: "magenta", mark: "30%" },
        { color: "lime", mark: "35%" },
        { color: "pink", mark: "48%" },
        { color: "blue", mark: "62%" },
        { color: "green", mark: "80%" },
        { color: "red", mark: "100%" },
      ],
    },
  },
  emits: ["modalClose"],
  setup(props, { emit }) {
    const gradientString = ref(""); // String for gradient styling
    const activeIndex = ref(0); // Active frame chosen to edit

    // Lifecycle Methods
    onMounted(() => {
      let temp = "linear-gradient(to right,";
      props.animation.forEach((frame) => {
        temp += frame.color + " " + frame.mark + ",";
      });
      gradientString.value = temp.substring(0, temp.length - 1) + ")";
    });

    const onClose = () => {
      emit("modalClose", null);
    };

    return { gradientString, activeIndex, onClose };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";

.modal-card {
  height: 600px;
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
</style>