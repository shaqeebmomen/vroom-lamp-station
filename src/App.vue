<template>
  <animation-control :isActive="modalActive" @modalClose="closeModal" />
  <div class="hero is-primary">
    <div class="hero-body has-text-centered">
      <p class="title">Vroom Lamp Station</p>
    </div>
  </div>
  <div class="section">
    <div class="shifter-container">
      <shifter-select @modalOpen="openModal" />
    </div>
  </div>
  <div class="footer">
    <div class="content has-text-centered">
      <p>Shaqeeb Momen 2021</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import ShifterSelect from "./components/ShifterSelect.vue";
import AnimationControl from "./components/AnimationControl.vue";
export default {
  name: "App",
  components: { ShifterSelect, AnimationControl },
  setup(props) {
    const modalActive = ref(true);
    onMounted(() => {
      console.log("Mounted");
      window.api.send("toMain", "test");
    });

    const closeModal = () => {
      modalActive.value = false;
    };

    const openModal = (index) => {
      modalActive.value = true;
    };

    return { modalActive, closeModal, openModal };
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
</style>
