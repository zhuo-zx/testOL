<template>
  <div>
    <p>Map的Interactions交互</p>
    <p>功能：增加/移除interaction交互</p>
    <span>默认自带的事件：</span>
    <input type="checkbox" v-model="DR.flag" @change="changeInteractions(DR)">alt+shift+鼠标拖动旋转
    <input type="checkbox" v-model="DCZ.flag" @change="changeInteractions(DCZ)">双击放大
    <input type="checkbox" v-model="MWZ.flag" @change="changeInteractions(MWZ)">鼠标滚轮缩放
    <input type="checkbox" v-model="DZ.flag" @change="changeInteractions(DZ)">shift+鼠标拖动缩放
    <input type="checkbox" v-model="DP.flag" @change="changeInteractions(DP)">鼠标拖拽平移
    <br>

    <span>可以添加的事件：</span>
    <input type="checkbox" v-model="DRAZ.flag" @change="changeInteractions(DRAZ)">shift+鼠标进行缩放和旋转
    <input type="checkbox" v-model="DAD.flag" @change="changeDAD">拖文件到地图增加图层         
  </div>
</template>

<script>
import {
  defaults as defaultInteractions,
  DragRotateAndZoom,
  DragRotate,
  DoubleClickZoom,
  DragAndDrop,
  MouseWheelZoom,
  DragZoom,
  DragPan,
} from 'ol/interaction'; //地图交互
//拖拽文件到地图需要
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Fill, Stroke } from 'ol/style';

export default {
  data() {
    return {
      map: this.$route.params.map,
      DR: {
        flag: true,
        interaction: DragRotate,
      },
      DCZ: {
        flag: true,
        interaction: DoubleClickZoom,
      },
      MWZ: {
        flag: true,
        interaction: MouseWheelZoom,
      },
      DZ: {
        flag: true,
        interaction: DragZoom,
      },
      DP: {
        flag: true,
        interaction: DragPan,
      },
      DRAZ: {
        flag: false,
        interaction: DragRotateAndZoom,
      },
      DAD: {
        flag: false,
        interaction: DragAndDrop,
      },
      DragAndDropLayer: null
    }
  },
  methods: {
    changeInteractions(name) {
      if(!name.flag) {
        //变为false执行
        let interaction = this.map.getInteractions().getArray().find(interaction => {
          return interaction instanceof name.interaction;
        });
        this.map.removeInteraction(interaction);
      } else {
        //变为true执行
        this.map.addInteraction(new name.interaction);
      }
    },
    changeDAD() {
      if(!this.DAD.flag) {
        this.changeInteractions(this.DAD);
        this.map.removeLayer(this.DragAndDropLayer);
      } else {
        let dragAndDropInteraction = new DragAndDrop({
          formatConstructors: [
            GPX, GeoJSON, IGC, KML, TopoJSON
          ]
        });
        dragAndDropInteraction.on('addfeatures', (event) => {
          //如果有图层则先删除
          if(this.DragAndDropLayer) {
            this.map.removeLayer(this.DragAndDropLayer);
            this.DragAndDropLayer = null;
          }
          this.DragAndDropLayer = new VectorLayer({
            renderMode: 'image',//矢量图层渲染为图片
            source: new VectorSource({
              features: event.features,
            }),
            style: this.createStyle()
          });
          this.map.addLayer(this.DragAndDropLayer);
        })
        this.map.addInteraction(dragAndDropInteraction);
      }
    },
    createStyle() {
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
        stroke: new Stroke({
          color: '#f00',
          width: 1,
        }),
      });
    }
  }
}
</script>

<style>

</style>