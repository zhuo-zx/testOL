<template>
  <div>
    <p>Draw交互Interaction</p>
    <p>功能：画线条显示移动轨迹动画</p>
    <button v-if="!layer" @click="open">
      开启功能
    </button>
    <template v-else>
      <button @click="close">
        关闭功能
      </button>
      <button @click="freehand = !freehand; resetDraw();">
        切换{{freehand ? '线段模式' : '手绘模式'}}
      </button>
      <span v-if="!freehand">线段模式：单击确定转折点，双击结束绘画</span>
      <span v-else>手绘模式：单击拖动绘画，松开结束（画的线会有点抖）</span>
      <p>
        <button @click="resetDraw" v-show="interaction">
          重新绘画
        </button>
        <button @click="moveStart" v-show="feature">
          重新播放
        </button>
        <button @click="follow = !follow" v-show="feature">
          {{follow ? '取消聚焦' : '聚焦小车'}}
        </button>  
        <button @click="stopAndContinue" v-show="coors.length !== 0">
          {{timer ? '暂停' : '继续'}}
        </button>
      </p>
    </template>
  </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Draw } from 'ol/interaction';
import { Style, Fill, Stroke, Circle, Icon } from 'ol/style';
import { transform, fromLonLat, toLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import CAR from '../../static/car.png';

export default {
  data() {
    return {
      map: this.$route.params.map,
      layer: null,
      interaction: null,
      source: null,
      feature: null,
      coors: [],//路的转折点
      carPoint: [],//车还要走的点
      index: 0,//当前小车所在的路段
      timer: null,
      follow: true,
      freehand: false,
    }
  },
  methods: {
    close() {
      this.map.removeLayer(this.layer);
      this.layer = null;
      this.map.removeInteraction(this.interaction);
      this.interaction = null;
      this.source = null;
      this.feature = null;
      this.coors = [];
      this.carPoint = [];
      clearInterval(this.timer);
      this.timer = null;
      this.index = 0;
    },
    open() {
      this.source = new VectorSource({ wrapX: false });
      this.layer = new VectorLayer({
        source: this.source,
        style: new Style({
          stroke: new Stroke({
            color: '#0099ff',
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: '#0099ff'
            })
          })
        }),
      });
      this.map.addLayer(this.layer);

      this.addInteraction();
    },
    //重新绘画
    resetDraw() {
      this.coors = [];
      if(this.feature) {
        this.layer.getSource().removeFeature(this.feature);
        this.feature = null;
        clearInterval(this.timer);
        this.timer = null;
      }
      if(this.source) {
        this.layer.getSource().clear();
      }
      if(this.interaction) {
        this.map.removeInteraction(this.interaction);
        this.interaction = null;
      }
      this.addInteraction();
    },
    //增加交互
    addInteraction() {
      this.interaction = new Draw({
        source: this.source,
        type: 'LineString',
        freehand: this.freehand,// true为手绘模式
      });
      this.map.addInteraction(this.interaction);
      this.interaction.on('drawend', e => {
        //防止双击放大地图
        e.stopPropagation();
        let line = e.feature.getGeometry();
        this.coors = line.getCoordinates().map(item => {
          return transform(
            item,
            'EPSG:3857',
            'EPSG:4326',
          );
        });
        this.interaction.setActive(false);
        this.moveStart();
      });
    },
    //开始移动
    moveStart() {
      //如果已经在移动，则删除元素，移除定时器
      if(this.feature) {
        this.layer.getSource().removeFeature(this.feature);
        this.feature = null;
        clearInterval(this.timer);
        this.timer = null;
      }
      this.index = 0;
      //深复制车的位置，不在原数组改变，方便重新播放
      this.carPoint = JSON.parse(JSON.stringify(this.coors));
      this.feature = new Feature({
        geometry: new Point(fromLonLat(this.carPoint[0])),
      })
      this.feature.setStyle(new Style({
        image: new Icon({
          src: CAR,
          anchor: [0.5, 0.5],
          rotation: this.countRotate(),
        })
      }));
      //增加车辆元素
      this.layer.getSource().addFeature(this.feature);
      this.timeStart();
    },
    //计时器开始
    timeStart() {
      this.timer = setInterval(() => {
        if(this.index + 1 >= this.carPoint.length) {
          //最后加1，控制暂停键隐藏
          this.index++;
          clearInterval(this.timer);
          this.timer = null;
          return ;
        }
        //到转折点旋转角度
        if(this.nextPoint() === this.carPoint[this.index + 1]) {
          this.index++;
          this.feature.getStyle().getImage()
            .setRotation(this.countRotate());
        }
        this.feature.getGeometry().setCoordinates(fromLonLat(this.carPoint[this.index]));
        if(this.follow) {
          this.map.getView().setCenter(fromLonLat(this.carPoint[this.index]));
        }
      }, 10);
    },
    //计算两点之间的角度
    countRotate() {
      let i = this.index, j = i + 1;
      if(j === this.carPoint.length) {
        i--;
        j--;
      }
      let p1 = this.map.getPixelFromCoordinate(fromLonLat(this.coors[i]));
      let p2 = this.map.getPixelFromCoordinate(fromLonLat(this.coors[j]));
      let rotation = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      return rotation;
    },
    //计算下一个点的位置
    nextPoint() {
      let index = this.index;
      let p1 = this.map.getPixelFromCoordinate(fromLonLat(this.carPoint[index]));
      let p2 = this.map.getPixelFromCoordinate(fromLonLat(this.carPoint[index + 1]));
      let dx = p2[0] - p1[0];
      let dy = p2[1] - p1[1];
      let distance = Math.sqrt(dx * dx + dy * dy)
      if(distance <= 1) {
        return this.carPoint[index + 1];
      } else {
        let x = p1[0] + dx / distance;
        let y = p1[1] + dy / distance;
        let coor = transform(
          this.map.getCoordinateFromPixel([x, y]),
          'EPSG:3857',
          'EPSG:4326'
        );
        this.carPoint[index] = coor;
        return this.carPoint[index];
      }
    },
    //暂停、继续
    stopAndContinue() {
      if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      } else {
        this.timeStart();
      }
    }
  }
}
</script>

<style>

</style>