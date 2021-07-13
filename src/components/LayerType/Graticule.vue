<template>
  <div>
    <button @click="showLayer()">
      Graticule，地图上覆盖的网格标尺图层
    </button>
  </div>
</template>

<script>
import Graticule from 'ol/layer/Graticule';
import Stroke from 'ol/style/Stroke';

export default {
  props: ["map"],
  data() {
    return {
      graticule: null,
    }
  },
  methods: {
    createGraticule() {
      return new Graticule({
        strokeStyle: new Stroke({
          color: 'rgba(255, 120, 0, 0.9)',
          width: 2,
          lineDash: [0.5, 4]
        }),
        showLabels: true,
        wrapX: true,
      });
    },
    showLayer() {
      if(this.graticule) {
        this.map.removeLayer(this.graticule);
        this.graticule = null;
        return ;
      } else {
        this.graticule = this.createGraticule();
        this.map.addLayer(this.graticule);
      }
    },
  }
}
</script>

<style>

</style>