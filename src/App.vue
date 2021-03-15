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
html {
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  margin: 0;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
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
  height: 100%;
  width: 100%;
}
</style>
