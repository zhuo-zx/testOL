<template>
  <div>
    <Map ref="map" :sourceType="sourceType"></Map>
    <button
      @click="toPage('Home')"
      :class="{active: $route.name === 'Home'}"
    >首页</button>
    <button
      @click="toPage('LayerType')"
      :class="{active: $route.name === 'LayerType'}"
    >LayerType</button>
    <button
      @click="toPage('MapControl')"
      :class="{active: $route.name === 'MapControl'}"
    >MapControl</button>
    <button
      @click="toPage('MapInteraction')"
      :class="{active: $route.name === 'MapInteraction'}"
    >MapInteraction</button>
    <button
      @click="toPage('PopupOverlay')"
      :class="{active: $route.name === 'PopupOverlay'}"
    >PopupOverlay</button>
    <button
      @click="toPage('PointImage')"
      :class="{active: $route.name === 'PointImage'}"
    >
      <img src="../../static/mark.svg">
      PointImage
    </button>
    <button
      @click="toPage('TrailAnimate')"
      :class="{active: $route.name === 'TrailAnimate'}"
    >
      <img src="../../static/mark.svg">
      TrailAnimate
    </button>
    <button
      @click="toPage('MoveAnimate')"
      :class="{active: $route.name === 'MoveAnimate'}"
    >MoveAnimate</button>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
    
    <div class="source" v-show="$route.name === 'Home'">
      <button
        @click="sourceType = 'osm'"
        :class="{active: sourceType === 'osm'}"
      >OSM</button>
      <button
        @click="sourceType = 'gaode'"
        :class="{active: sourceType === 'gaode'}"
      >高德地图</button>
      <button
        @click="sourceType = 'baidu'"
        :class="{active: sourceType === 'baidu'}"
      >百度地图</button>
    </div>
  </div>
</template>

<script>
import Map from '@/components/BaseMap';
import Watermark from '@/components/Watermark';

export default {
  name: 'Home',
  data() {
    return {
      map: null,
      watermark: null,
      sourceType: 'osm',
    }
  },
  watch: {
    sourceType(val) {
      this.$nextTick(() => {
        this.map = this.$refs.map.refreshMap();
      });
    }
  },
  methods: {
    toPage(name) {
      if(this.$route.name === name) {
        return ;
      }
      this.map = this.$refs.map.refreshMap();
      this.$router.push({
        name,
        params: {
          map: this.map
        }
      });
      this.watermark.setOptions({content: name});
    },
  },
  components: {
    Map
  },
  mounted() {
    this.map = this.$refs.map.initMap();
    this.watermark = new Watermark({content: 'Home'});
    this.watermark.render();
  }
}
</script>

<style>
button {
  height: 20px;
  line-height: 20px;
  background: #fff;
  border: 1px solid #000;
  border-radius: 10px;
  cursor: pointer;
  outline: none;
  margin: 0 5px;
  padding: 0 10px;
  box-shadow: 2px 2px 2px #ccc;
}
button:hover {
  background: #0075ff;
  color: #fff;
}
.active {
  background: #0075ff;
  color: #fff;
  cursor: auto;
}
input[type="range"] {
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
img {
  width: 12px;
  height: 12px;
}
.source {
  position: absolute;
  top: 10px;
  left: calc(50% - 150px);
  height: 30px;
  width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
