<template>
  <div class="frame-list-root">
    <div class="list-head level">
      <div class="level-left">
        <h1 class="title is-4">Frames</h1>
      </div>
      <div class="level-right">
        <div class="buttons">
          <button
            :disabled="animation.length <= 2"
            class="button is-small"
            @click="removeFrame"
          >
            <span class="icon">
              <i class="mdi mdi-minus"></i>
            </span>
          </button>
          <button
            :disabled="animation.length > 10 || animation.length < 2"
            class="button is-small"
            @click="mirror"
          >
            <span class="icon">
              <i class="mdi mdi-mirror"></i>
            </span>
          </button>
          <button
            :disabled="animation.length > 19"
            class="button is-small"
            @click="addFrame"
          >
            <span class="icon">
              <i class="mdi mdi-plus"></i>
            </span>
          </button>
        </div>
      </div>
    </div>

    <transition-group
      appear
      name="list"
      tag="ul"
      :class="{ error: errorFrames.length > 0 }"
      @after-enter="updateListUI"
      @after-leave="updateListUI"
    >
      <frame-item
        v-for="(item, index) in animation"
        :key="item"
        :frame="item"
        :isActiveItem="index == activeIndex"
        :index="index"
        :error="errorFrames.includes(index)"
        :deleteEnable="index == 0 || (index == 1 && animation.length < 3)"
        @updateFrameIndex="updateFrameIndex"
        @updateFrameTime="updateFrameTime"
        @deleteFrame="deleteFrame"
      />
    </transition-group>
    <p class="help is-danger" v-if="errorFrames.length > 0">
      {{ `Invalid Timestamps ( ${errorFrames.length} )` }}
    </p>
    <p class="help is-danger" v-if="animation.length > 19">
      Reached 20 Frame Limit!
    </p>
  </div>
</template>

<script>
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import FrameItem from "./FrameItem.vue";
export default {
  components: { FrameItem },

  emits: [
    "addFrame",
    "removeFrame",
    "deleteFrame",
    "updateFrameIndex",
    "updateFrameTime",
    "mirror",
  ],
  props: ["animation", "activeIndex", "errorFrames"],
  setup(props, { emit }) {
    let list;
    let mounted = false;
    onMounted(() => {
      mounted = true;
      list = document.querySelector("ul");
    });

    const updateFrameTime = (data) => {
      emit("updateFrameTime", data);
    };

    const scrollToFrame = (index) => {
      list.children[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    let nextIndex;
    const updateFrameIndex = (index) => {
      emit("updateFrameIndex", index);
      nextIndex = index;
    };

    const addFrame = () => {
      emit("addFrame");
      nextTick(() => {
        updateFrameIndex(list.children.length - 1);
      });
    };

    /**
     * Removes frame from end of list
     */
    const removeFrame = () => {
      emit("removeFrame");
    };

    const deleteFrame = (index) => {
      updateFrameIndex(index - 1);
      nextTick(() => {
        emit("deleteFrame", index);
      });
    };

    const mirror = () => {
      emit("mirror");
    };

    const updateListUI = () => {
      // console.log(list);
      if (mounted && list.children[nextIndex] !== undefined) {
        nextTick(() => {
          list.children[nextIndex].children.namedItem("input").focus();
          scrollToFrame(nextIndex);
        });
      }
    };

    return {
      list,
      addFrame,
      removeFrame,
      deleteFrame,
      updateFrameIndex,
      updateFrameTime,
      mirror,
      updateListUI,
    };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.frame-list-root {
  max-height: 280px;
  height: 100%;
  width: 100%;
}

.list-head {
  @extend .mb-3;
}

ul {
  @extend .py-3;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  box-shadow: inset $card-shadow;
  border-radius: $card-radius;
  &.error {
    border: 1px $danger solid;
  }
}

// Transition Group
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
.list-enter-to,
.list-leave-from {
  opacity: 1;
  transform: scale(1);
}
.list-enter-active {
  transition: all 0.1s ease;
}

.list-leave-active {
  transition: all 0.1s ease;
  /* Using this to take the element out of the document flow and enable the .move class to apply its transition */
  /* This works because the parent was positioned relative (the ul) */
  // position: absolute;
}

/* used for when items in a transition group move, this is an "active" class that defines a transition */
.list-move {
  transition: all 0.2s ease;
}
</style>