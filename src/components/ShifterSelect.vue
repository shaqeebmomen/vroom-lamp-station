<template>
  <div class="root">
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
        :disabled="index == 1"
        :class="{
          button: true,
          'is-medium': true,
          'is-primary': index != 1,
          active: index != 1,
        }"
      >
        {{ index == 1 ? "R" : index }}
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
};
</script>

<style lang="scss">
.root {
  width: 50%;
  height: 100%;
  display: grid;
  grid-template: 1fr 2fr 1fr / repeat(4, 1fr);
}
.button-container {
  display: grid;
  place-items: center;
}
</style>