<template>
  <div class="shifter-select-root">
    <div
      class="button-container"
      v-for="index in 6"
      :key="index"
      :style="{
        gridColumn: index + 1 > 4 ? ((index + 1) % 4) + 1 : index + 1,
        gridRow: index + 1 > 4 ? 3 : 1,
      }"
    >
      <button
        @click="onClick(index)"
        :class="{
          button: true,
          'is-medium': true,
          'is-primary': true,
          active: true,
        }"
      >
        {{ index }}
      </button>
    </div>
    <div class="button-container connect">
      <button
        :class="{
          active: true,
          button: true,
          'is-medium': true,
          'is-success': !connected,
          'is-danger': connected,
          'is-loading': connectLoading,
          'is-outlined': !connected,
        }"
        @click="onConnectRequest"
      >
        {{ connected ? "Disconnect" : "Connect" }}
      </button>
    </div>
    <div class="button-container load">
      <button
        :disabled="!connected"
        :class="{
          active: true,
          button: true,
          'is-medium': true,
          'is-info': true,
          'is-outlined': true,
          'is-loading': loading,
        }"
        @click="onLoad"
      >
        Load Data
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
  props: {
    connected: {
      type: Boolean,
    },
    connectLoading: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
  },
  emits: ["modalOpen", "connectionChange", "loadData"],
  setup(props, { emit }) {
    const onConnectRequest = () => {
      // TODO serial IPC
      emit("connectionChange", true);
    };

    const onClick = (index) => {
      emit("modalOpen", index);
    };

    const onLoad = () => {
      emit("loadData");
    };

    return { onClick, onConnectRequest, onLoad };
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

.connect {
  grid-row: 3;
  grid-column: 1;
}

.load {
  grid-row: 1;
  grid-column: 1;
}
</style>