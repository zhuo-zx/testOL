<template>
  <div>
    <p>移动到某点的Animate</p>
    <span>目的地：</span>
    <span>经度：</span>
    <input type="number" v-model.number="longitude">
    <span>纬度：</span>
    <input type="number" v-model.number="latitude">
    <p>
      <span>方式：</span>
      <select v-model="type">
        <option value="Pan">Pan平移</option>
        <option value="Elastic">Elastic弹性</option>
        <option value="Bounce">Bounce反弹</option>
        <option value="Spin">Spin旋转</option>
        <option value="Fly">Fly飞行</option>
      </select>
      <button @click="goto">GO</button>
    </p>
  </div>
</template>

<script>
import { fromLonLat } from 'ol/proj';
import { easeIn, easeOut } from 'ol/easing';

export default {
  data() {
    return {
      map: this.$route.params.map,
      longitude: null,
      latitude: null,
      type: 'Pan',
    }
  },
  watch: {
    longitude() {
      if(this.longitude > 180) {
        this.longitude = 180;
      } else if(this.longitude < -180) {
        this.longitude = -180;
      }
    },
    latitude() {
      if(this.latitude > 90) {
        this.latitude = 90;
      } else if(this.latitude < -90) {
        this.latitude = -90;
      }
    }
  },
  methods: {
    goto() {
      switch(this.type) {
        case 'Pan':
          this.pan();
          break;
        case 'Elastic':
          this.elastic();
          break;
        case 'Bounce':
          this.bounce();
          break;
        case 'Spin':
          this.spin();
          break;
        case 'Fly':
          this.fly();
          break;
      }
    },
    pan() {
      this.map.getView().animate({
        center: fromLonLat([this.longitude, this.latitude]),
        duration: 2000,
      });
    },
    elastic() {
      this.map.getView().animate({
        center: fromLonLat([this.longitude, this.latitude]),
        duration: 2000,
        easing: (t) => {
          return (
            Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
          )
        }
      });
    },
    bounce() {
      this.map.getView().animate({
        center: fromLonLat([this.longitude, this.latitude]),
        duration: 2000,
        easing: (t) => {
          let s = 7.5625;
          let p = 2.75;
          let l;
          if (t < 1 / p) {
            l = s * t * t;
          } else {
            if (t < 2 / p) {
              t -= 1.5 / p;
              l = s * t * t + 0.75;
            } else {
              if (t < 2.5 / p) {
                t -= 2.25 / p;
                l = s * t * t + 0.9375;
              } else {
                t -= 2.625 / p;
                l = s * t * t + 0.984375;
              }
            }
          }
          return l;
        }
      });
    },
    spin() {
      let center = this.map.getView().getCenter();
      let to = fromLonLat([this.longitude, this.latitude]);
      this.map.getView().animate(
        {
          center: [
            (center[0] + to[0]) / 2,
            (center[1] + to[1]) / 2
          ],
          rotation: Math.PI,
          easing: easeIn,
        },
        {
          center: to,
          rotation: 2 * Math.PI,
          easing: easeOut,
        }
      );
    },
    fly() {
      let zoom = this.map.getView().getZoom();
      this.map.getView().animate({
        center: fromLonLat([this.longitude, this.latitude]),
        duration: 2000,
      });
      this.map.getView().animate(
        {
          zoom: zoom - 1,
          duration: 1000,
          easing: easeIn
        },
        {
          zoom: zoom,
          duration: 1000,
          easing: easeOut
        }
      )
    }
  }
}
</script>

<style>

</style>