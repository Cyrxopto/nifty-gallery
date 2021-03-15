<template>
  <div id="app">
    <Gallery />
  </div>
</template>

<script>
import Gallery from './components/Gallery.vue'

export default {
  name: 'App',
  components: {
    Gallery
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  border: none;
  background-image: linear-gradient(#eee, #aaa);
}

#app {
  margin: 0;
  padding: 0;
  border: none;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
}
</style>
