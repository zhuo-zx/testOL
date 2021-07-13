<template>
  <div>
    <slot></slot>
    <button @click="showLayer()">
      Vector，矢量图层
    </button>
  </div>
</template>

<script>
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { unByKey } from 'ol/Observable';//移除监听器使用

export default {
  props: ["map"],
  data() {
    return {
      vector: null,
      highlight: null,
      highlightListen: null,
      highlightFeatue: null,
    }
  },
  methods: {
    newVectorLayer(source, style) {
      return new VectorLayer({
        source,
        style: function(feature) {
          style.getText().setText(feature.get('name'));
          return style;
        },
      })
    },
    createLayer() {
      let source = new VectorSource({
        url: '/static/countries.geojson',
        format: new GeoJSON,
      });
      let style = new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.6)',
        }),
        stroke: new Stroke({
          color: '#319FD3',
          width: 1,
        }),
        text: new Text({
          font: '12px Callbri,sans-serif',
        }),
      });
      return this.newVectorLayer(source, style);
    },
    createHighlightLayer() {
      let source = new VectorSource();
      let style = new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
        stroke: new Stroke({
          color: '#f00',
          width: 1,
        }),
        text: new Text({
          font: '12px Calibri,sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#f00',
            width: 3,
          })
        })
      });
      return this.newVectorLayer(source, style);
    },
    showLayer() {
      if(this.vector) {
        this.map.removeLayer(this.vector);
        this.vector = null;
        this.map.removeLayer(this.highlight);
        this.highlight = null;
        return ;
      } else {
        this.vector = this.createLayer();
        this.map.addLayer(this.vector);
        this.highlight = this.createHighlightLayer();
        this.map.addLayer(this.highlight);
      }
      this.listenLayer();
    },
    listenLayer() {
      if(this.highlight) {
        //先清空原先的高亮元素
        if(this.highlightFeatue) {
          this.highlight.getSource().removeFeature(this.highlightFeatue);
          this.highlightFeatue = null;
        }
        //高亮图层监听
        this.highlightListen = this.map.on('pointermove', (evt) => {
          if(evt.dragging) {
            return ;
          }
          let pixel = this.map.getEventPixel(evt.originalEvent);
          this.showHighlightFeature(pixel);
        })  
      } else {
        unByKey(this.highlightListen);
        this.highlightListen = null;
      }
    },
    showHighlightFeature(pixel) {
      this.vector.getFeatures(pixel).then((features) => {
        let feature = features.length ? features[0] : undefined;
        //指向的国家元素改变
        if(feature !== this.highlightFeatue) {
          //如果原高亮元素有样式就删掉
          if(this.highlightFeatue) {
            this.highlight.getSource().removeFeature(this.highlightFeatue);
          }
          //指向海洋的时候，feature为undefined
          //如果是指向国家，则高亮
          if(feature) {
            this.highlight.getSource().addFeature(feature);
          }
        }
        this.highlightFeatue = feature;
      });
    },
  }
}
</script>

<style>

</style>