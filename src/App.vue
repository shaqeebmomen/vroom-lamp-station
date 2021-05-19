<template>
  <transition name="toast">
    <toast :msg="toastMessage" :isError="toastIsError" v-if="showToast" />
  </transition>
  <transition name="modal">
    <animation-control
      v-if="modalActive"
      :isActive="modalActive"
      @modalClose="closeModal"
      :animation="animations[activeAnimIndex]"
      @updateFrameTime="updateFrameTime"
      @addFrame="addFrame"
      @removeFrame="removeFrame"
      @deleteFrame="deleteFrame"
      @colorChange="colorChange"
      @resetAnim="onResetSingle"
      @mirror="onMirror"
    />
  </transition>
  <div class="hero is-small is-primary">
    <div class="hero-body">
      <div class="hero-container">
        <div class="title-container">
          <p class="title">Vroom Lamp Station</p>
        </div>
        <div class="refresh-container">
          <button
            @click="onResetAll"
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
import { nextTick, onMounted, ref, toRaw } from "vue";
import ShifterSelect from "./components/ShifterSelect.vue";
import AnimationControl from "./components/AnimationControl.vue";
import ipcChannels from "./channel_index.js";
import defaultAnims from "./default_anims.js";
import Toast from "./components/Toast.vue";
export default {
  name: "App",
  components: { ShifterSelect, AnimationControl, Toast },
  setup(props) {
    // Animations
    const animations = ref([]);
    // Copy data from default animatinos file into ref

    const resetSingle = (index) => {
      animations.value[index] = [];
      defaultAnims[index].forEach((frame) => {
        animations.value[index].push(JSON.parse(JSON.stringify(frame)));
      });
    };

    const resetAll = () => {
      for (let index = 0; index < defaultAnims.length; index++) {
        resetSingle(index);
      }
    };

    resetAll();

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
      animations.value[activeAnimIndex.value][data.index].color = data.color;
    };

    // Connection
    const isUploading = ref(false);
    const isDownloading = ref(false);

    // Set up listeners for ipc receive on mount
    onMounted(() => {
      // Receive after main process uploads
      window.ipc.receive(
        ipcChannels.getToRenderChannel(ipcChannels.upload),
        async (response) => {
          console.log(response);
          if (response.msg === "fail") {
            toastIsError.value = true;
            toastMessage.value = `No Data Written, Error: ${response.errorMsg}`;
            await displayToast(2000);
          } else {
            toastIsError.value = false;
            toastMessage.value = "Write Success, Lamp Reset and Updated!";
            await displayToast(1000);
          }
          isUploading.value = false;
        }
      );

      // Receive after main process downlods
      window.ipc.receive(
        ipcChannels.getToRenderChannel(ipcChannels.download),
        async (response) => {
          console.log(response);
          if (response.msg === "fail") {
            toastIsError.value = true;
            toastMessage.value = `There was an error: ${response.errorMsg}`;
            await displayToast(2000);
          } else {
            toastIsError.value = false;
            toastMessage.value = "Read Success, UI Updated!";
            await displayToast(1000);
          }
          animations.value = response.data;
          isDownloading.value = false;
        }
      );
    });

    const showToast = ref(false);
    const toastMessage = ref("");
    const toastIsError = ref(false);
    const displayToast = (timeout) => {
      return new Promise((resolve, reject) => {
        showToast.value = true;
        const id = setTimeout(() => {
          showToast.value = false;
          clearTimeout(id);
          resolve();
        }, timeout);
      });
    };

    /**
     * Attempt to handshake with the lamp
     */
    const upload = () => {
      isUploading.value = true;
      const anims = toRaw(animations)._rawValue;
      window.ipc.send(ipcChannels.getToMainChannel(ipcChannels.upload), {
        anims,
      });
    };

    /**
     * Load data from lamp
     */
    const download = () => {
      isDownloading.value = true;
      window.ipc.send(ipcChannels.getToMainChannel(ipcChannels.download));
    };

    // State Reset
    /**
     * Clear out all the data in animations
     */
    const onResetAll = () => {
      resetAll();
    };

    const onResetSingle = () => {
      resetSingle(activeAnimIndex.value);
    };

    const onMirror = () => {
      const size = animations.value[activeAnimIndex.value].length;
      for (let index = size - 2; index >= 0; index--) {
        const { r, g, b } = animations.value[activeAnimIndex.value][
          index
        ].color;
        const time =
          animations.value[activeAnimIndex.value][size - 1].timeStamp +
          (animations.value[activeAnimIndex.value][size - 1].timeStamp -
            animations.value[activeAnimIndex.value][index].timeStamp);

        animations.value[activeAnimIndex.value].push({
          color: { r, g, b },
          timeStamp: time,
        });
      }
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
      showToast,
      toastMessage,
      toastIsError,
      isUploading,
      upload,
      isDownloading,
      download,
      onResetAll,
      onResetSingle,
      onMirror,
    };
  },
};
</script>

<style lang="scss">
@import "./assets/sass/main.scss";
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

// Transition Styling
// Modal
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-leave-active,
.modal-enter-active {
  transition: all 0.25s ease;
}

// Toast

.toast-enter-active {
  animation: wobble 0.5s ease;
}
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}
.toast-leave-active {
  transition: all 0.3s ease;
}

@keyframes wobble {
  0% {
    opacity: 0;
    transform: translateY(-60px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  60% {
    transform: translateX(8px);
  }
  70% {
    transform: translateX(-8px);
  }
  80% {
    transform: translateX(4px);
  }
  90% {
    transform: translateX(-4px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
