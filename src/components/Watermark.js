export default class Watermark {
  constructor({
    fontSize = 18,
    width = 300,
    height = 300,
    opacity = 30,
    content = ""
  }) {
    this.fontSize = fontSize;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
    this.content = content;
    this.divId = 'watermark';
  }

  draw() {
    //存在则先移除，防止重复渲染
    if(document.getElementById(this.divId) !== null) {
      document.body.removeChild(document.getElementById(this.divId));
    }

    const canvas = document.createElement('canvas');
    //设置画布大小
    canvas.width = this.width;
    canvas.height = this.height;

    const cans = canvas.getContext('2d');
    cans.rotate(-20 * Math.PI / 180);//水印旋转角度
    cans.font = `${this.fontSize}px Vedana`;//字体
    cans.fillStyle =  `rgba(102, 102, 102, ${this.opacity / 100})`;//颜色
    cans.textAlign = 'center';
    cans.textBaseline = 'middle';
    this.content.split(",").forEach((item, index) => {
      cans.fillText(item, canvas.width / 2, canvas.height / 2 + (index * this.fontSize + 10)); // 水印在画布的位置x，y轴
    });

    const div = document.createElement('div');
    div.id = this.divId;
    div.style.pointerEvents = 'none';
    div.style.top = '50px';
    div.style.left = '0px';
    div.style.position = 'fixed';
    div.style.zIndex = '100000';
    div.style.width = document.documentElement.clientWidth + 'px';
    div.style.height = document.documentElement.clientHeight + 'px';
    div.style.background = `url(${canvas.toDataURL('image/png')}) left top repeat`;
    document.body.appendChild(div);
  }

  setOptions({
    fontSize = 18,
    width = 300,
    height = 300,
    opacity = 60,
    content = ""
  }) {
    this.fontSize = fontSize;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
    this.content = content;
    this.draw();
  }

  //渲染水印
  render() {
    this.draw();
    window.onresize = () => {
      this.draw();
    }
  }

  //移除水印
  removeWatermark() {
    if(document.getElementById(this.divId) !== null) {
      document.body.removeChild(document.getElementById(this.divId));
    }
  }
}
