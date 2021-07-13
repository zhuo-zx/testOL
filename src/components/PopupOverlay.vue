<template>
  <div>
    <p>overlayer覆盖物：</p>
    <p>功能：点击地图出现Popup弹窗</p>
    <button @click="closeFunction" v-if="overlay">
      关闭功能
    </button>
    <button @click="openFunction" v-else>
      开启功能
    </button>
    <div ref="popup" v-show="showPopup">
      <div class="popup">
        <p class="popup-close" ref="close"> X </p>
        <div class="popup-content" ref="content"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Overlay from 'ol/Overlay';
import { transform, fromLonLat, toLonLat } from 'ol/proj'; //坐标转换
import { unByKey } from 'ol/Observable';//移除监听器使用

export default {
  data() {
    return {
      map: this.$route.params.map,
      overlay: null,
      overlayListen: null,
      showPopup: false,
    }
  },
  methods: {
    closeFunction() {
      this.map.removeOverlay(this.overlay);
      unByKey(this.overlayListen);
      this.overlay = null;
    },
    openFunction() {
      this.createOverlay();
      //map添加点击事件
      this.overlayListen = this.map.on("singleclick", (evt) => {
        // let coordinate = transform(
        //   evt.coordinate,
        //   "EPSG:3857",
        //   "EPSG:4326"
        // )
        // let x = coordinate[0];
        // let flag = (x + 180) % 360;
        // if(flag > 0) {
        //   flag -= 180;
        // } else {
        //   flag += 180;
        // }
        // coordinate[0] = flag;
        // 等价于
        let coordinate = toLonLat(evt.coordinate);
        this.$refs.content.innerHTML = `
          <p style="margin: 3px;">坐标：</p>
          <p style="margin: 3px;">X：${coordinate[0]}</p>
          <p style="margin: 3px;">Y：${coordinate[1]}</p>`;
        this.overlay.setPosition(evt.coordinate);
        this.showPopup = true;
        this.$refs.close.addEventListener("click", this.closeListen);
      });
    },
    //创建一个弹窗Overlay对象
    createOverlay() {
      this.overlay = new Overlay({
        element: this.$refs.popup,
        offset: [-110, -130],
      });
      this.map.addOverlay(this.overlay);
    },
    //关闭弹窗响应
    closeListen() {
      this.overlay.setPosition(undefined);
      this.$refs.close.blur();
      this.showPopup = false;
      return false;
    },
  }
}
</script>

<style>
.popup {
  position: relative;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #000;
  width: 200px;
  height: 100px;
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
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
}
.popup-content {
  margin-top: 20px;
}
</style>