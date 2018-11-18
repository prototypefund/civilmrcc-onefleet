<template>
   <div id="mapArea">
      Map
   </div>
</template>

<script>
export default {
  name: 'MapArea',
  props: {
  },
  mounted:function(){
    this.$map.init('mapArea');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#mapArea{
    width: 70vw;
    height:calc(100vh - 60px);
}
</style>
