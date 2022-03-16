<template>
  <div>
    <button @click="counter--">−</button>
    <span>{{counter}}</span>
    <button @click="counter++">+</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        counter: 0,
      };
    },
  };
</script>
