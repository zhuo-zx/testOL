<!--
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2021-01-22 08:48:23
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-03-31 10:45:17
-->
<template>
  <div>
    <slot></slot>
    <button @click="showLayer()">
      HeatMap，热力图层
    </button>
    <span>redius</span>
    <input
      type="range"
      min="1"
      max="50"
      step="1"
      v-model="radius"
      @input="changeRadius"
      :disabled="heatmap === null"
    >
    <span>blur</span>
    <input
      type="range"
      min="1"
      max="50"
      step="1"
      v-model="blur"
      @input="changeBlur"
      :disabled="heatmap === null"
    >
  </div>
</template>

<script>
import HeatMap from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import KML from 'ol/format/KML';

export default {
  props: ["map"],
  data() {
    return {
      heatmap: null,
      radius: 10,
      blur: 10,
    }
  },
  methods: {
    createHeatMap() {
      return new HeatMap({
        source: new VectorSource({
          url: '/static/2012_Earthquakes_Mag5.kml',
          format: new KML({
            extractStyles: false
          })
        }),
        blur: parseInt(this.blur, 10),
        radius: parseInt(this.radius, 10),
        weight: function(feature) {
          var name = feature.get('name');
          var magnitude = parseFloat(name.substr(2));
          return magnitude - 5;
        },
      });
    },
    showLayer() {
      if(this.heatmap) {
        this.map.removeLayer(this.heatmap);
        this.heatmap = null;
        return ;
      } else {
        this.heatmap = this.createHeatMap();
        this.map.addLayer(this.heatmap);
      }
    },
    changeRadius() {
      if(this.heatmap) {
        this.heatmap.setRadius(parseInt(this.radius, 10));
      }
    },
    changeBlur() {
      if(this.heatmap) {
        this.heatmap.setBlur(parseInt(this.blur, 10));
      }
    },
  }
}
</script>

<style>

</style>