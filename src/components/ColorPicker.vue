<template>
  <div class="root">
    <div class="display" :style="{ background: currentCol }"></div>
    <div class="row level red">
      <h1 class="title is-3 level-left mb-1">R</h1>
      <input
        v-model="currentR"
        min="0"
        max="255"
        step="1"
        type="range"
        class="ml-4 slider level-item"
      />
      <div class="readout level-left ml-2">
        {{ currentR }}
      </div>
    </div>
    <div class="row level green">
      <h1 class="title is-3 level-left mb-1">G</h1>
      <input
        v-model="currentG"
        min="0"
        max="255"
        step="1"
        type="range"
        class="ml-4 slider level-item"
      />
      <div class="readout level-left ml-2">
        {{ currentG }}
      </div>
    </div>
    <div class="row level blue">
      <h1 class="title is-3 level-left mb-1">B</h1>
      <input
        v-model="currentB"
        min="0"
        max="255"
        step="1"
        type="range"
        class="ml-4 slider level-item"
      />
      <div class="readout level-left ml-2">
        {{ currentB }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
export default {
  props: {},
  setup() {
    const currentR = ref("0");
    const currentG = ref("0");
    const currentB = ref("0");
    const currentCol = computed(() => {
      return (
        "rgba(" +
        currentR.value +
        "," +
        currentG.value +
        "," +
        currentB.value +
        ",1)"
      );
    });

    return { currentR, currentG, currentB, currentCol };
  },
};
</script>

<style lang="scss">
@import "../assets/sass/main.scss";
.root {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
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
}

.display {
  min-height: 40px;
  width: 100%;
}

// Slider styling
$slider-height: 15px;
.slider {
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