<template>
  <div>
    <button @click="showLayer()">
      WebGL 渲染的海量点图层
    </button>
  </div>
</template>

<script>
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';

export default {
  props: ["map"],
  data() {
    return {
      webGL: null,
      style: {
        symbol: {
          symbolType: 'triangle',
          size: 18,
          color: [
            'interpolate',
            ['linear'],
            ['get', 'population'],
            20000,
            '#5aca5b',
            300000,
            '#ff6a19'
          ],
          rotateWithView: true,
        },
      }
    }
  },
  methods: {
    createWebGL() {
      return new WebGLPointsLayer({
        source: new VectorSource({
          url: '/static/world-cities.geojson',
          format: new GeoJSON(),
        }),
        style: this.style,
        disableHitDetection: true,
      });
    },
    showLayer() {
      if(this.webGL) {
        this.map.removeLayer(this.webGL);
        this.webGL = null;
        return ;
      } else {
        this.webGL = this.createWebGL();
        this.map.addLayer(this.webGL);
      }
    }
  }
}
</script>

<style>

</style>