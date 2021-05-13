<template>
  <li
    :class="{
      'frame-item-root': true,
      level: true,
      'active-item': isActiveItem,
    }"
  >
    <div
      class="color-box level-left"
      :style="{ background: frame.color }"
    ></div>
    <!-- TODO bind number here to timestamps ni animation object -->
    <input
      type="number"
      class="input level-item mx-2"
      placeholder="time(ms)"
      required
      min="0"
    />
    <button
      class="button delete is-danger level-right"
      @click="onDelete(index)"
    ></button>
  </li>
</template>

<script>
export default {
  emit: ["delete"],
  props: ["frame", "isActiveItem"],
  setup(props, { emit }) {
    const onDelete = (index) => {
      emit("delete", index);
    };
    return { onDelete };
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
}

.active-item {
  border: 1px $grey solid;
  transform: scale(1.05);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
}

.input {
  max-width: 80%;
}
.color-box {
  border: 1px solid black;
  height: 2rem;
  width: 2rem;
  border-radius: 5px;
}
</style>