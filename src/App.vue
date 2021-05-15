<template>
  <animation-control
    :isActive="modalActive"
    @modalClose="closeModal"
    :animation="animations[activeAnimIndex]"
    @updateFrameTime="updateFrameTime"
    @addFrame="addFrame"
    @removeFrame="removeFrame"
    @deleteFrame="deleteFrame"
    @colorChange="colorChange"
    @resetAnim="resetAnim"
  />
  <div class="hero is-small is-primary">
    <div class="hero-body">
      <div class="hero-container">
        <div class="title-container">
          <p class="title">Vroom Lamp Station</p>
        </div>
        <div class="refresh-container">
          <button
            @click="onReset"
            class="button is-small is-outlined m-4 p-5 is-rounded"
          >
            <span class="icon is-large">
              <i class="mdi mdi-36px mdi-refresh"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="shifter-container">
      <shifter-select
        :isDownloading="isDownloading"
        :isUploading="isUploading"
        @modalOpen="openModal"
        @upload="upload"
        @download="download"
      />
    </div>
  </div>
  <div class="footer">
    <div class="content has-text-centered">
      <p>Shaqeeb Momen 2021</p>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref } from "vue";
import ShifterSelect from "./components/ShifterSelect.vue";
import AnimationControl from "./components/AnimationControl.vue";
import ipcChannels from "./channel_index.js";
export default {
  name: "App",
  components: { ShifterSelect, AnimationControl },
  setup(props) {
    // Animations
    const animations = ref([
      [
        { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 255, g: 0, b: 255 }, timeStamp: 100 },
        { color: { r: 20, g: 127, b: 90 }, timeStamp: 250 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 1200 },
        { color: { r: 0, g: 0, b: 255 }, timeStamp: 1900 },
        { color: { r: 60, g: 200, b: 0 }, timeStamp: 2200 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 3300 },
        { color: { r: 127, g: 0, b: 127 }, timeStamp: 3500 },
        { color: { r: 30, g: 90, b: 0 }, timeStamp: 4000 },
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 5000 },
      ],
      [
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 30, g: 90, b: 0 }, timeStamp: 20 },
        { color: { r: 0, g: 0, b: 0 }, timeStamp: 50 },
        { color: { r: 20, g: 127, b: 90 }, timeStamp: 250 },
        { color: { r: 0, g: 0, b: 255 }, timeStamp: 400 },
        { color: { r: 127, g: 0, b: 127 }, timeStamp: 600 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 1050 },
        { color: { r: 255, g: 0, b: 255 }, timeStamp: 1200 },
        { color: { r: 60, g: 200, b: 0 }, timeStamp: 2000 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 3300 },
      ],
      [
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 100 },
      ],
      [
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 100 },
      ],
      [
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 100 },
      ],
      [
        { color: { r: 255, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 0, g: 255, b: 0 }, timeStamp: 100 },
      ],
    ]);

    const activeAnimIndex = ref(1);

    /**
     * Update the timestamp of a frame
     */
    const updateFrameTime = (data) => {
      animations.value[activeAnimIndex.value][data.index].timeStamp =
        data.timeStamp;
    };

    /**
     * Add a frame onto the end of the active animation at a timestamp 500ms later than the last
     */
    const addFrame = () => {
      animations.value[activeAnimIndex.value].push({
        color: { r: 0, g: 0, b: 0 },
        timeStamp:
          animations.value[activeAnimIndex.value][
            animations.value[activeAnimIndex.value].length - 1
          ].timeStamp + 500,
      });
    };

    /**
     * Remove a frame from end of active animation
     */
    const removeFrame = () => {
      animations.value[activeAnimIndex.value].pop();
    };

    /**
     * Deletes a specific frame
     */
    const deleteFrame = (index) => {
      animations.value[activeAnimIndex.value].splice(index, 1);
    };

    // Modal
    const modalActive = ref(false);
    /**
     * Close Animation controller modal
     */
    const closeModal = () => {
      modalActive.value = false;
    };
    /**
     * Open animation controller modal and update the passed animation
     */
    const openModal = (index) => {
      activeAnimIndex.value = index - 1;
      modalActive.value = true;
    };

    // Color Change
    const colorChange = (data) => {
      animations.value[activeAnimIndex.value][data.index].color = {
        ...data.color,
      };
    };

    // Connection
    const isUploading = ref(false);
    const isDownloading = ref(false);

    /**
     * Attempt to handshake with the lamp
     */
    const upload = () => {
      // TODO promisify
      isUploading.value = true;
      window.ipc.send(ipcChannels.getToMainChannel(ipcChannels.upload), {
        one: "test",
      });
      // window.ipc.receive("fromMain", (data) => console.log("receive", data));
      setTimeout(() => {
        isUploading.value = false;
      }, 1000);
    };

    /**
     * Load data from lamp
     */
    const download = () => {
      isDownloading.value = true;
      setTimeout(() => {
        isDownloading.value = false;
      }, 1000);
    };

    // State Reset
    /**
     * Clear out all the data in animations and disconnects
     */
    const onReset = () => {
      animations.value = [
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
        [
          { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
          { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
        ],
      ];
    };

    const resetAnim = () => {
      animations.value[activeAnimIndex.value] = [
        { color: { r: 0, g: 0, b: 0 }, timeStamp: 0 },
        { color: { r: 255, g: 255, b: 255 }, timeStamp: 1000 },
      ];
    };

    return {
      animations,
      activeAnimIndex,
      updateFrameTime,
      addFrame,
      removeFrame,
      deleteFrame,
      modalActive,
      closeModal,
      openModal,
      colorChange,
      isUploading,
      upload,
      isDownloading,
      download,
      onReset,
      resetAnim,
    };
  },
};
</script>

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
  border: none;
  // * {
  //   box-sizing: border-box;
  //   border: red dashed 1px;
  // }
}
.hero {
  box-shadow: 10px 0px 10px rgb(51, 51, 51);
}
.section {
  flex-grow: 2;
}
.footer {
  height: 5vh;
}
.shifter-container {
  height: 100%;
  display: grid;
  place-items: center;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}

.title-container {
  grid-column: 2;
  display: grid;
  place-items: center;
}

.refresh-container {
  display: flex;
  grid-column: 3;
  justify-content: flex-end;
  button {
    display: flex;
    justify-content: space-between;
  }
}
</style>
