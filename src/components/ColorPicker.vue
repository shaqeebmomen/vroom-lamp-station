<template>
  <div class="color-picker-root mt-2">
    <div class="display" :style="{ background: currentCol }"></div>
    <!-- RED -->
    <div class="row level red">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-3 mb-1">R</h1>
        </div>
      </div>
      <div class="level-item">
        <input
          v-model="currentR"
          min="0"
          max="255"
          step="1"
          type="range"
          class="slider"
        />
      </div>
      <div class="level-right">
        <div class="level-item">
          <input
            type="number"
            min="0"
            max="255"
            step="1"
            v-model="currentR"
            class="input readout"
          />
        </div>
      </div>
    </div>
    <!-- GREEN -->
    <div class="row level green">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-3 mb-1">G</h1>
        </div>
      </div>
      <div class="level-item">
        <input
          v-model="currentG"
          min="0"
          max="255"
          step="1"
          type="range"
          class="slider"
        />
      </div>
      <div class="level-right">
        <div class="level-item">
          <input
            type="number"
            min="0"
            max="255"
            step="1"
            v-model="currentG"
            class="input readout"
          />
        </div>
      </div>
    </div>
    <!-- BLUE -->
    <div class="row level blue">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-3 mb-1">B</h1>
        </div>
      </div>
      <div class="level-item">
        <input
          v-model="currentB"
          min="0"
          max="255"
          step="1"
          type="range"
          class="slider"
        />
      </div>
      <div class="level-right">
        <div class="level-item">
          <input
            type="number"
            min="0"
            max="255"
            step="1"
            v-model="currentB"
            class="input readout"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ref, computed, onMounted, watch } from "vue";
import colorHelp from "../helpers/color_help.js";
export default {
  props: ["activeColor"],
  emits: ["colorChange"],
  setup(props, { emit }) {
   
    const currentR = ref(props.activeColor.r);
    const currentG = ref(props.activeColor.g);
    const currentB = ref(props.activeColor.b);

    const currentCol = computed(() => {
      // Emit event
      emit("colorChange", {
        r: parseInt(currentR.value),
        g: parseInt(currentG.value),
        b: parseInt(currentB.value),
      });
      return colorHelp.rgbToStyle(
        currentR.value,
        currentG.value,
        currentB.value
      );
    });

    watch(
      () => props.activeColor,
      (newVal, oldVal) => {
        currentR.value = newVal.r.toString();
        currentG.value = newVal.g.toString();
        currentB.value = newVal.b.toString();
      },
      { deep: true }
    );

    return { currentR, currentG, currentB, currentCol };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/sass/main.scss";
.color-picker-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.row {
  display: flex;
  width: 100%;
}

h1 {
  text-align: center;
}
.readout {
  text-align: center;
  min-width: 2rem;
  max-width: 5rem;
}

.display {
  min-height: 40px;
  height: 30%;
  max-height: 200px;
  width: 100%;
  border-radius: $card-radius;
  border: 1px black solid;
}

// Slider styling
$slider-height: 15px;
.slider {
  width: 80%;
  -webkit-appearance: none;
  height: $slider-height;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
  border-radius: 10px;
}

.slider:hover {
  opacity: 1;
}

// Styling thumb

@mixin slider-thumb() {
  width: $slider-height * 1.5;
  height: $slider-height * 1.5;
  border-radius: 100%;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  @include slider-thumb();
}

.red {
  .slider::-webkit-slider-thumb {
    background: red;
  }
  h1,
  .readout {
    color: red;
  }
}

.green {
  .slider::-webkit-slider-thumb {
    background: green;
  }
  h1,
  .readout {
    color: green;
  }
}

.blue {
  .slider::-webkit-slider-thumb {
    background: blue;
  }
  h1,
  .readout {
    color: blue;
  }
}
</style>