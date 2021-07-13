<template>
  <div>
    <p>Layer图层类型：</p>
    <Graticule :map="map"></Graticule>
    <HeatMap :map="map">
      <span>浏览器渲染</span>
    </HeatMap>
    <Vector :map="map">
      <span>浏览器渲染</span>
    </Vector>
    <ImageLayer>
      <span>服务器渲染</span>
    </ImageLayer>
    <span>
      服务器渲染
      VectorTile Layer，矢量瓦片图层，f12查看Network，地图是由一张张图片构成
    </span><br>
    <WebGL :map="map"></WebGL>
  </div>
</template>

<script>
import Graticule from './Graticule';
import HeatMap from './HeatMap';
import Vector from './Vector';
import ImageLayer from './ImageLayer';
import WebGL from './WebGL';

export default {
  data() {
    return {
      map: this.$route.params.map,
    }
  },
  components: {
    Graticule,
    HeatMap,
    Vector,
    ImageLayer,
    WebGL,
  }
}
</script>

<style>
</style>