<template>
  <div>
    <p>Feature：地图图标：</p>
    <p>功能1：点击地图增加图标</p>
    <p>功能2：图层元素聚合Cluster</p>
    <p>功能3：右键图标可删除元素</p>
    <p>
      功能4：右键图标可移动元素（如果是聚合图层，则是放大）
      （点击移动后，先点击一下元素再拖动，释放后点击保存即可）
    </p>
    <button @click="openFunction" v-if="!layer">
      开启以上功能
    </button>
    <div v-else>
      <button @click="closeFunction">
        关闭所有功能
      </button>
      <p>功能5：点击地图框选元素显示选中的坐标</p>
      <button @click="openDrawFunction" v-if="!drawInteraction">
        开启框选功能
      </button>
      <template v-else>
        <button @click="closeDrawFunction">
          关闭框选功能
        </button>
        <select v-model="drawType" @change="resetDraw">
          <option value="Polygon">自定义</option>
          <option value="Circle">圆形</option>
          <option value="Box">矩形</option>
        </select>
        <button @click="resetDraw">清除框</button>
      </template>
      <div v-if="points.length > 0">
        <p>选中的元素有{{points.length}}个：</p>
        <p style="margin: 0" v-for="(p, key) in points" :key="key">
          {{key + 1}}、（{{p[0]}}, {{p[1]}}）
        </p>
      </div>
    </div>
    <div ref="popup" v-show="showPopup">
      <div class="popup">
        <p class="popup-close" @click="closePopup"> X </p>
        <template v-if="!ifSave">
          <button @click="deleteFeatures">删除</button>
          <button @click="movePoint">
            {{message.length > 1 ? '放大' : '移动'}}
          </button>
        </template>
        <template v-else>
          <button @click="closeFunction(); openFunction();">
            取消
          </button>
          <button @click="save">保存</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster'; // 聚合标注
import Overlay from 'ol/Overlay'; // 覆盖物
import Feature from 'ol/Feature'; // 元素
import { fromLonLat, transform } from 'ol/proj';//坐标转换
import { unByKey } from 'ol/Observable';//移除监听器使用
import { Icon, Style, Text, Fill, Stroke, Circle } from 'ol/style';
import { Point } from 'ol/geom';
import { Draw, Translate, Select } from "ol/interaction";
import { createBox } from 'ol/interaction/Draw';//创建几何绘画
import POINT from '../../static/point.png';
import POINT_MOVE from '../../static/point_move.png';

export default {
  data() {
    return {
      map: this.$route.params.map,
      positions: [], //点位
      addListen: null, //地图点击监听
      layer: null, //图层
      mapDeleteListen: null, //地图右键监听
      overlay: null, //地图右键弹窗
      showPopup: false,
      ifSave: false,
      message: [],//存储删除或者修改的信息
      drawLayer: null,
      drawInteraction: null,
      drawSource: null,
      points: [],
      moveLayer: null,
      select: null,
      translate: null,
      drawType: 'Polygon',
    }
  },
  methods: {
    animateMap({ center, zoom }) {
      let nowZoom = this.map.getView().getZoom();
      let duration = Math.abs(zoom - nowZoom) * 300 || 600;
      this.map.getView().animate({
        zoom,
        center,
        duration,
      });
    },
    openFunction() {
      this.positions = JSON.parse(localStorage.getItem("position")) || [];
      //将坐标形成元素feature
      let iconFeatureArr = this.positions.map(point => {
        let feature = new Feature({
          geometry: new Point(fromLonLat(point)),
        });
        return feature;
      });
      //聚合数据
      let clusterSource = new Cluster({
        distance: 20,// 距离，单位px
        source: new VectorSource({
          features: iconFeatureArr,
        }),
      });
      this.layer = new VectorLayer({
        source: clusterSource,
        style: this.clusterStyle.call(this),
      });
      this.map.addLayer(this.layer);
      this.addMapClickListen();
      this.createOverlay();
      this.addMapDeleteListen();
    },
    //聚合图层样式
    clusterStyle() {
      return (feature) => {
        let total = feature.get("features").length;
        return new Style({
          image: new Icon({
            src: POINT,
            anchor: [0.5, 1],
          }),
          text: new Text({
            text: total.toString(),
            font: "20px Calibri,sans-serif",
            fill: new Fill({
              color: '#fff',
            }),
            offsetY: -20
          })
        });
      }
    },
    closeFunction() {
      this.resetMap();
      this.resetData();
      this.animateMap({
        zoom: 3, 
        center: fromLonLat([110, 21])
      });
    },
    //重置地图
    resetMap() {
      //先移除地图的监听
      unByKey(this.addListen);
      unByKey(this.mapDeleteListen);
      //再删除图层、覆盖物、交互
      this.map.removeLayer(this.layer);
      this.map.removeLayer(this.moveLayer);
      this.map.removeOverlay(this.overlay);
      this.map.removeLayer(this.drawLayer);
      //最后移除框选的交互和图层
      this.map.removeInteraction(this.select);
      this.map.removeInteraction(this.translate);
      this.map.removeInteraction(this.drawInteraction);
    },
    //重置data
    resetData() {
      this.positions = []; 
      this.addListen = null; 
      this.layer = null; 
      this.mapDeleteListen = null; 
      this.overlay = null; 
      this.showPopup = false;
      this.ifSave = false;
      this.message = [];
      this.drawInteraction = null;
      this.drawLayer = null;
      this.points = [];
      this.moveLayer = null;
      this.select = null;
      this.translate = null;
    },
    //地图增加点击监听
    addMapClickListen() {
      this.addListen = this.map.on("singleclick", evt => {
        let coordinate = transform(
          evt.coordinate,
          "EPSG:3857",
          "EPSG:4326"
        );
        //重复点击返回
        if(this.positions.find(item => 
          JSON.stringify(item) === JSON.stringify(coordinate)
        )) {
          return false;
        }
        //如果删除的overlay显示则关闭并返回
        if(this.showPopup) {
          this.closePopup();
          return false;
        }
        this.positions.push(coordinate);
        localStorage.setItem("position", JSON.stringify(this.positions));
        let feature = new Feature({
          geometry: new Point(fromLonLat(coordinate))
        });
        feature.setStyle(new Style({
          image: new Icon({
            src: POINT,
            anchor: [0.5, 1],
          }),
          text: new Text({
            text: "1",
            font: "20px Calibri,sans-serif",
            fill: new Fill({
              color: '#fff',
            }),
            offsetY: -20
          })
        }))
        //第一个getSource是获取vectorLayer的数据源
        //第二个是获取clusterSource的数据源
        this.layer.getSource().getSource().addFeature(feature);
      });
    },
    //创建覆盖物
    createOverlay() {
      this.overlay = new Overlay({
        element: this.$refs.popup,
        offset: [-85, -55],
      });
      this.map.addOverlay(this.overlay);
    },
    //地图增加右键监听
    addMapDeleteListen() {
      this.mapDeleteListen = this.map.on("contextmenu", evt => {
        evt.preventDefault();
        const pixel = this.map.getEventPixel(evt.originalEvent);
        const features = this.map.forEachFeatureAtPixel(
          pixel,
          //如果点击的是聚合元素，则返回所有元素
          feature => feature.getProperties().features
        );
        //如果不是点击图层则feature为undefined
        if(!features) {
          return false;
        }
        this.overlay.setPosition(evt.coordinate);
        this.showPopup = true;
        this.message = [];
        features.forEach(item => {
          let point = transform(
            item.getGeometry().getCoordinates(),
            "EPSG:3857",
            "EPSG:4326",
          );
          this.message.push({
            feature: item,
            point,
          })
        })
      });
    },
    //关闭弹窗
    closePopup() {
      this.overlay.setPosition(undefined);
      this.showPopup = false;
      return false;
    },
    //删除点元素
    deleteFeatures() {
      this.message.forEach(mes => {
        const { feature, point } = mes;
        this.layer.getSource().getSource().removeFeature(feature);
        this.overlay.setPosition(undefined);
        this.showPopup = false;
        this.positions = this.positions.filter(item => {
          return JSON.stringify(item) !== JSON.stringify(point);
        });  
      });
      localStorage.setItem("position", JSON.stringify(this.positions));
    },
    //放大图层或者移动点位
    movePoint() {
      this.overlay.setPosition(undefined);
      this.showPopup = false;
      //如果是聚合图层则简单计算他们的中心点，放大图层，再次选择
      if(this.message.length > 1) {
        let lon = 0, lat = 0;
        let len = this.message.length;
        this.message.forEach(item => {
          lon += item.point[0];
          lat += item.point[1];
        });
        let point = [lon / len, lat / len];
        this.animateMap({
          zoom: this.map.getView().getZoom() + 2,
          center: fromLonLat(point)
        });
        return ;
      }
      //如果不是聚合图层，则可以移动
      let point = this.message[0].point;

      //先清空图层并解除所有事件绑定
      this.resetMap();
      //增加图层和交互
      this.addMoveLayer(point);
      this.addMoveInteractions(point);
    },
    //增加移动使用的图层
    addMoveLayer(point) {
      this.moveLayer = new VectorLayer({
        source: new VectorSource({
          features: [
            new Feature({
              geometry: new Point(fromLonLat(point)),
            })
          ]
        }),
        style: new Style({
          image: new Icon({
            src: POINT,
            anchor: [0.5, 1]
          })
        })
      });
      this.map.addLayer(this.moveLayer);
    },
    //增加移动点的交互
    addMoveInteractions(point) {
      //单击元素后变成红色图片
      this.select = new Select({
        style: new Style({
          image: new Icon({
            src: POINT_MOVE,
            anchor: [0.5, 1]
          })
        })
      });
      //图层可移动
      this.translate = new Translate({
        features: this.select.getFeatures()
      });
      this.map.addInteraction(this.select);
      this.map.addInteraction(this.translate);

      let zoom = this.map.getView().getZoom();
      this.animateMap({
        zoom: zoom > 10 ? zoom : 10,
        center: fromLonLat(point)
      });

      //创建覆盖物并显示保存按钮
      this.createOverlay();
      this.ifSave = true;
      this.translate.on("translatestart", () => {
        this.overlay.setPosition(undefined);
        this.showPopup = false;
      });
      this.translate.on("translateend", e => {
        this.overlay.setPosition(e.coordinate);
        this.showPopup = true;
        //将停下来的元素的经纬度存放到message[1]中
        this.message[1] = transform(
          e.features.array_[0].getGeometry().flatCoordinates,
          'EPSG:3857',
          'EPSG:4326'
        );
      });
    },
    //保存移动信息,
    save() {
      this.positions = JSON.parse(localStorage.getItem('position'));
      //替换之前的地址
      this.positions = this.positions.map(item => {
        if(this.message[0].point.join('') === item.join('')) {
          return this.message[1];
        }
        return item;
      });
      localStorage.setItem('position', JSON.stringify(this.positions));
      //重新渲染图层
      this.closeFunction();
      this.openFunction();
    },
    //开启框选功能
    openDrawFunction() {
      //先移除地图的监听和交互
      unByKey(this.addListen);
      unByKey(this.mapDeleteListen);
      this.map.removeInteraction(this.drawInteraction);
      this.initDraw();
    },
    //关闭框选功能
    closeDrawFunction() {
      this.map.removeInteraction(this.drawInteraction);
      this.map.removeLayer(this.drawLayer);
      this.drawInteraction = null;
      this.points = [];
      this.addMapClickListen();
      this.addMapDeleteListen();
    },
    //清除框并重新初始化
    resetDraw() {
      if(this.drawSource) {
        this.drawLayer.getSource().clear();
      }
      this.points = [];
      if(this.drawInteraction) {
        this.map.removeInteraction(this.drawInteraction);
        this.drawInteraction = null;
      }
      this.addDrawInteraction();
    },
    //初始化绘制图层
    initDraw() {
      this.drawSource = new VectorSource({ wrapX: false });
      this.drawLayer = new VectorLayer({
        source: this.drawSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)'
          }),
          stroke: new Stroke({
            color: '#0099ff',
            width: 2,
          }),
        })
      });
      this.map.addLayer(this.drawLayer);
      this.addDrawInteraction();
    },
    //增加绘制图层交互
    addDrawInteraction() {
      let type = this.drawType;
      let geometryFunction = null;
      //如果是矩形需要设置回调函数
      if(type === 'Box') {
        type = 'Circle';
        geometryFunction = createBox();
      }
      this.drawInteraction = new Draw({
        source: this.drawSource,
        type,
        geometryFunction,// 几何信息变更时的回调函数
      })
      this.map.addInteraction(this.drawInteraction);
      this.drawInteraction.on('drawstart', () => {
        this.points = [];
      });
      this.drawInteraction.on('drawend', evt => {
        let polygon = evt.feature.getGeometry();
        //先缩小范围，getExtent方法是获取多边形拓展后的矩形的四个角
        //getFeaturesInExtent获取在该矩形区域内的元素
        let features = this.layer.getSource().getSource().getFeaturesInExtent(polygon.getExtent());
        features.forEach(item => {
          let point = transform(
            item.getGeometry().getCoordinates(),
            "EPSG:3857",
            "EPSG:4326",
          );
          if(this.pointInsideDraw(point, polygon)) {
            this.points.push(point);
          }
        });  
        this.drawInteraction.setActive(false);
      });
    },
    //判断点是否在框内
    pointInsideDraw(point, polygon) {
      if(this.drawType === 'Circle') {
        //判断是否在圆内
        let radius = polygon.getRadius();
        let center = transform(
          polygon.getCenter(),
          "EPSG:3857",
          "EPSG:4326",
        );
        if(radius === 0) {
          return false;
        }
        let dx = center[0] - point[0];
        let dy = center[1] - point[1];
        return dx * dx + dy * dy <= radius * radius;  
      } else {
        //判断是否在多边形或者矩形内
        let polygonPoints = polygon.getCoordinates();
        let x = point[0];
        let y = point[1];
        let inside = false;
        let points = polygonPoints[0].map(item => {
          return transform(
            item,
            "EPSG:3857",
            "EPSG:4326",
          );
        });
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const xi = points[i][0], yi = points[i][1];
          const xj = points[j][0], yj = points[j][1];

          const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect){
            inside = !inside;
          }
        }
        return inside;
      }
    },
  }
}
</script>

<style scoped>
.popup {
  position: relative;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #000;
  width: 150px;
  height: 24px;
  padding: 10px;
}
.popup::before {
  content: "";
  position: absolute;
  top: 100%;
  left: calc(50% - 10px);
  width: 0;
  height: 0;
  border-top: 10px solid #000;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}
.popup::after {
  content: "";
  position: absolute;
  top: calc(100% - 1px);
  left: calc(50% - 10px);
  width: 0;
  height: 0;
  border-top: 10px solid #fff;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}
.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: block;
  margin: 0;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
}
.popup-content {
  margin-top: 20px;
}
select {
  outline: none;
  height: 20px;
  border: 1px solid #000;
  border-radius: 10px;
  cursor: pointer;
  margin: 0 5px;
  padding: 0 10px;
  box-shadow: 2px 2px 2px #ccc;
}
</style>