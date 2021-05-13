<template>
  <div class="shifter-select-root">
    <div
      class="button-container"
      v-for="index in 7"
      :key="index"
      :style="{
        gridColumn: index > 4 ? (index % 4) + 1 : index,
        gridRow: index > 4 ? 3 : 1,
      }"
    >
      <button
        @click="onClick(index)"
        :class="{
          button: true,
          'is-medium': true,
          'is-primary': index != 1,
          'is-info': index == 1,
          'is-outlined': index == 1,
          active: true,
        }"
      >
        {{ index == 1 ? "Load Data" : index-1 }}
      </button>
    </div>
    <div
      class="shift-logo-container"
      v-for="index in 4"
      :key="index"
      :style="{ gridColumn: index, gridRow: 2, position: 'relative' }"
    >
      <div
        class="vertical"
        :style="{
          position: 'relative',
          backgroundColor: 'black',
          height: index == 1 ? '60%' : '100%',
          width: '50px',
          margin: '0 auto',
          borderRadius: '25px',
        }"
      ></div>
      <div
        class="horizontal"
        :style="{
          position: 'absolute',
          backgroundColor: 'black',
          height: '20%',
          width: index == 1 || index == 4 ? '50%' : '100%',
          borderRadius: index == 1 ? '0 ' : index == 4 ? '0 25px 25px 0' : '0',
          left: index == 1 ? '50%' : '0',
          top: '40%',
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["modalOpen"],
  setup(props, { emit }) {
    const onClick = (index) => {
      if (index != 1) {
        emit("modalOpen", index);
      }
    };

    return { onClick };
  },
};
</script>

<style scoped lang="scss">
.shifter-select-root {
  width: 50%;
  height: 100%;
  min-height: 300px;
  display: grid;
  grid-template: 1fr 2fr 1fr / repeat(4, 1fr);
}
.button-container {
  display: grid;
  place-items: center;
}
</style>