<template>
  <div class="toast-wrapper">
    <div :class="{ toast: true, error: isError }">{{ msg }}</div>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: "Something Went Wrong!",
    },
    isError: {
      type: Boolean,
      default: true,
    },
  },
  setup() {},
};
</script>

<style lang="scss">
@import "../assets/sass/main.scss";

.toast-wrapper {
  position: fixed;
  width: 100%;
  top: 20px;
  display: grid;
  place-items: center;
}
.toast {
  padding: 20px;
  color: $white;
  border-radius: 10px;
  box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  margin: 0 auto;

  &.error {
    background: $danger;
  }

  background: $success;
}
</style>