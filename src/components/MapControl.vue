<template>
  <div>
    <p>Map的Controls控件：</p>
    <p>功能：增加/移除control控件</p>
    <input
      type="checkbox" 
      v-model="fullScreen.flag" 
      @change="changeControl(fullScreen)"
    >全屏
    <input 
      type="checkbox" 
      v-model="scaleLine.flag" 
      @change="changeControl(scaleLine)"
    >比例尺
    <input 
      type="checkbox" 
      v-model="zoom.flag" 
      @change="changeControl(zoom)"
    >缩放+-
    <input 
      type="checkbox" 
      v-model="zoomSlider.flag" 
      @change="changeControl(zoomSlider)"
    >缩放滑块
    <input 
      type="checkbox" 
      :value="mousePosition" 
      @change="changeMousePosition"
    >鼠标坐标
    <input 
      type="checkbox" 
      :value="overviewMap" 
      @change="changeOverviewMap"
    >鹰眼图
    <p v-show="mousePosition">
      坐标：
      （<span id="position" ref="position" class="position"></span>）
    </p>
  </div>
</template>

<script>
import {
  defaults as defaultControls,
  FullScreen,
  ScaleLine,
  Zoom,
  ZoomSlider,
  MousePosition,
  OverviewMap,
} from 'ol/control';//控制器
//鹰眼图需要
import Tile from 'ol/layer/Tile';//瓦片
import OSM from 'ol/source/OSM';//地图源

export default {
  data() {
    return {
      map: this.$route.params.map,
      fullScreen: {
        flag: false,
        control: FullScreen,
      },
      scaleLine: {
        flag: false,
        control: ScaleLine,
      },
      zoom: {
        flag: true,
        control: Zoom,
      },
      zoomSlider: {
        flag: false,
        control: ZoomSlider,
      },
      mousePosition: null,
      overviewMap: null,
    }
  },
  methods: {
    changeControl(con) {
      let control = this.map.getControls().getArray().find(item => {
        return item instanceof con.control;
      });
      if(!con.flag) {
        //变为false则移除控件
        this.map.removeControl(control);
      } else {
        this.map.addControl(new con.control());
      }
    },
    changeMousePosition() {
      if(this.mousePosition) {
        this.map.removeControl(this.mousePosition);
        this.mousePosition = null;
      } else {
        this.mousePosition = new MousePosition({
          projection: "EPSG:4326",
          target: "position",
          //坐标信息显示样式类名，默认是'ol-mouse-position'
          className: "position",
        });
        this.map.addControl(this.mousePosition);
      }
    },
    changeOverviewMap() {
      if(this.overviewMap) {
        this.map.removeControl(this.overviewMap);
        this.overviewMap = null;
      } else {
        this.overviewMap = new OverviewMap({
          tipLabel: "鹰眼图",
          layers: [
            new Tile({
              source: new OSM({
                'url': 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
              }),
            }),
          ],
        });
        this.map.addControl(this.overviewMap);
      }
    },
  }
}
</script>

<style>
.position {
  display: inline;
}
</style>