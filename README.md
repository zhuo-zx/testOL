# test openlayer
- 本代码是学习openlayer所写的代码
- 下载下来，`npm install`、`npm run dev`即可运行
- 含有的功能如下：

### 水印watermark
- 给页面增加水印

## LayerType图层类型
1. Graticule网格标尺图层
2. Heatmap热力图层
3. Vector矢量图层（鼠标悬浮高亮国家范围名字）
4. ImageLayer单张图片的矢量图层
5. VectorTileLayer矢量瓦片图层
6. WebGL渲染的海量点图层

## MapControl地图控件
- 增加/移除地图控件，包括：全屏、比例尺、缩放+-、缩放滑块、鼠标坐标、鹰眼图

## MapInteraction地图交互
- 增加/移除地图交互，包括如下：
  - 默认自带的事件：alt+shift+鼠标拖动旋转、双击放大、鼠标滚轮缩放、shift+鼠标拖动缩放、鼠标拖拽平移
  - 可以添加的事件：shift+鼠标进行缩放和旋转、拖文件到地图增加图层

## PopupOverlay弹窗覆盖物
- 功能：点击地图出现Popup弹窗，显示点击位置的经纬度

## **PointImage地图图标**
- 功能1：点击地图增加图标
- 功能2：图层元素聚合Cluster
- 功能3：右键图标可删除元素
- 功能4：右键图标可移动元素（如果是聚合图层，则是放大） （点击移动后，先点击一下元素再拖动，释放后点击保存即可）
- 功能5：点击地图框选元素显示选中图标的坐标

## **TrailAnimate动画轨迹**
- 功能：画线条显示移动轨迹动画

## MoveAnimate移动动画
- 多种方式移动到目的地，包括：Pan平移、Elastic弹性、Bounce反弹、Spin旋转、Fly飞行