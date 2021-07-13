<template>
  <div id="content">
    <div id="map" ref="map"></div>
  </div>
</template>
<script>
import 'ol/ol.css';//样式
import Map from 'ol/Map';//地图
import View from 'ol/View';//视图
import Tile from 'ol/layer/Tile';//瓦片
import { fromLonLat, transform } from 'ol/proj';//坐标转换
import { OSM, XYZ } from 'ol/source';//地图源
//百度地图使用
import { TileImage } from 'ol/source';
import TileGrid from 'ol/tilegrid/TileGrid';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
proj4.defs('BD-MC', '+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs');
register(proj4);

export default {
  name: 'BaseMap',
  props: ['sourceType'],
  data() {
    return {
      source: {
        'osm': new OSM(),
        'gaode': new XYZ({
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        }),
        'baidu': new TileImage({
          wrapX: true,//百度地图默认的是false
          projection: 'BD-MC',
          tileGrid: new TileGrid({
            origin: [0, 0],
            resolutions: new Array(19).fill(0).map((item, index) => Math.pow(2, 18 - index)),
          }),
          tileUrlFunction: (tileCoord) => {
            if(!tileCoord) {
              return '';
            }
            var z = tileCoord[0];
            var x = tileCoord[1];
            //由于openlayers6加载地图的方式是从上往下递增，百度是从中心往上递增，所以在原先加载
            //百度地图的基础之上，将tileUrlFunction中的y坐标加1取反。
            var y = -(tileCoord[2] + 1);
            if(x < 0) {
              x = 'M' + (-x);
            }
            if(y < 0) {
              y = 'M' + (-y);
            }
            return 'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&udt=20200519&scaler=1&p=1';
          }
        }),
      }
    }
  },
  methods: {
    initMap() {
      let target = 'map';//页面元素id
      let tileLayer = [
        new Tile({
          source: this.source[this.sourceType]
        })
      ];
      let view = new View({
        //默认是EPSG:3857坐标系，可以通过fromLonLat或者transform转换
        //3857不易于存储，可以正常显示；4326显示不正常，易于存储
        //如果设置projection: "EPSG:4326"，则不需要转换（除百度）
        //百度用的是BD-MC投影格式
        center: transform(
          [110, 21],
          'EPSG:4326',
          this.source === 'baidu' ? 'BD-MC' : 'EPSG:3857'
        ),
        zoom: 3,//缩放级别
        minZoom: 3,//最小缩放级别
      });
      let map = new Map({
        target: target,//绑定dom元素进行渲染
        layers: tileLayer,//配置地图数据源
        view: view,//配置地图显示的options配置（坐标系，中心点，缩放级别等）
      });
      document.querySelector("ul").remove();
      return map;
    },
    refreshMap() {
      document.getElementById('map').innerHTML = "";
      return this.initMap();
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
.active {
  background: #0075ff;
  color: #fff;
  cursor: auto;
}
</style>
