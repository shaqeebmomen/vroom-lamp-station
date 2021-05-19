<template>
  <div class="shifter-select-root">
    <div
      class="action-container"
      v-for="(value, index) in [1, 3, 5, 2, 4, 6]"
      :key="index"
      :style="{
        gridColumn: index + 2 > 4 ? ((index + 2) % 4) + 1 : index + 2,
        gridRow: index + 2 > 4 ? 3 : 1,
      }"
    >
      <div class="button-container">
        <button
          :disabled="isUploading || isDownloading"
          @click="onClick(value)"
          :class="{
            button: true,
            'is-medium': true,
            'is-primary': !(errors[value - 1].length > 0),
            error: errors[value - 1].length > 0,
            'is-danger': errors[value - 1].length > 0,
          }"
        >
          {{ value }}
        </button>
      </div>
    </div>
    <div class="action-container upload">
      <button
        :disabled="isUploading || isDownloading"
        :class="{
          button: true,
          'is-medium': true,
          'is-success': true,
          'is-loading': isUploading,
          'is-outlined': true,
        }"
        @click="upload"
      >
        <p>Upload</p>
        <span class="icon is-large">
          <i class="mdi mdi-36px mdi-upload"></i>
        </span>
      </button>
    </div>
    <div class="action-container download">
      <button
        :disabled="isUploading || isDownloading"
        :class="{
          button: true,
          'is-medium': true,
          'is-info': true,
          'is-outlined': true,
          'is-loading': isDownloading,
        }"
        @click="download"
      >
        <p>Download</p>
        <span class="icon is-large">
          <i class="mdi mdi-36px mdi-download"></i>
        </span>
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
    isUploading: {
      type: Boolean,
    },
    isDownloading: {
      type: Boolean,
    },
    errors: {
      type: Array,
    },
  },
  emits: ["modalOpen", "upload", "download"],
  setup(props, { emit }) {
    const upload = () => {
      emit("upload");
    };

    const onClick = (index) => {
      emit("modalOpen", index);
    };

    const download = () => {
      emit("download");
    };

    return { onClick, upload, download };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.shifter-select-root {
  width: 50%;
  height: 100%;
  min-height: 300px;
  display: grid;
  grid-template: 1fr 2fr 1fr / repeat(4, 1fr);
}
.action-container {
  display: grid;
  place-items: center;
}

.upload {
  grid-row: 3;
  grid-column: 1;
}

.download {
  grid-row: 1;
  grid-column: 1;
}
</style>