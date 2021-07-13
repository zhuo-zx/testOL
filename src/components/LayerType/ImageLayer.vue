<template>
  <div>
    <div id="singleImage" ref="singleImage"></div>
    <slot></slot>
    <button @click="showImage()">
      Image Layer 单张图片的矢量图层
    </button>
    <span>===============================&gt;</span>
  </div>
</template>

<script>
import Map from 'ol/Map';//地图
import View from 'ol/View';//视图
import { Projection } from 'ol/proj';//坐标
import { ImageStatic } from 'ol/source';
import { Image } from 'ol/layer';
import { getCenter } from 'ol/extent';//获取矩形中心

export default {
  data() {
    return {
      singleImage: null,
    }
  },
  methods: {
    showImage() {
      if(!this.singleImage) {
        //图片尺寸
        let extent = [0, 0, 1024, 968];
        let url = '/static/empty.png';
        let projection = new Projection({
          code: 'EPSG:3857',
          extent,
        });
        let imageLayer = new Image({
          source: new ImageStatic({
            url,
            projection,
            imageExtent: extent
          })
        });
        this.singleImage = new Map({
          target: 'singleImage',
          layers: [
            imageLayer
          ],
          view: new View({
            projection,
            center: getCenter(extent),
            zoom: 0,
          })
        })  
      } else {
        document.getElementById('singleImage').innerHTML = '';
        this.singleImage = null;
      }      
    },
  }
}
</script>

<style>
#singleImage {
  position: absolute;
  top: 450px;
  right: 30px;
  border: 1px solid #000;
  width: 200px;
  height: 200px;
}
</style>