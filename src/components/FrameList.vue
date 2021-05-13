<template>
  <div class="frame-list-root">
    <div class="buttons">
      <button class="button is-small active" @click="addFrame">
        <span class="icon">
          <i class="mdi mdi-minus"></i>
        </span>
      </button>
      <button class="button is-small active" @click="removeFrame">
        <span class="icon">
          <i class="mdi mdi-plus"></i>
        </span>
      </button>
    </div>
    <ul>
      <frame-item
        v-for="(item, index) in animation"
        :key="index"
        :frame="item"
        :isActiveItem="index == activeIndex"
      />
    </ul>
  </div>
</template>

<script>
import FrameItem from "./FrameItem.vue";
export default {
  components: { FrameItem },
  emits: ["addFrame", "removeFrame"],
  props: ["animation", "activeIndex"],
  setup(props, { emit }) {
    const addFrame = () => {
      emit("addFrame");
    };

    const removeFrame = () => {
      emit("removeFrame");
    };
    return { addFrame, removeFrame };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.frame-list-root {
  max-height: 280px;
  width: 100%;
}

.buttons {
  display: flex;
  justify-content: flex-end;
}

ul {
  @extend .py-2;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}
</style>