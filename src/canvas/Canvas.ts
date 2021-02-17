import * as PIXI from "pixi.js";
import Line from './Line';
import Pointer from "./Pointer";
import Polygon from "./Polygon";
import { getClosePolygon } from './../utils/index';
let TextureCache = PIXI.utils.TextureCache
let Sprite = PIXI.Sprite;
let Graphics = PIXI.Graphics;
interface IPointer {
  pointer:Pointer;
  closed:Boolean;
}
interface ILinkArea {
  pointers?:Pointer[];// 相互关联的点
  polygon?:Polygon[];// 相互关联的多边形状
  line:ILine[];// 相互关联点
}
interface ICrossLine {
  lineX:PIXI.Graphics,
  lineY:PIXI.Graphics
}

interface ILine {
  line:Line;
  sPointer: Pointer; // 初始位置的;
  ePointer: Pointer; // 结束位置;
  next:ILine[];// 以结束位置为起点的下一个Line
}

type CanvasMode = "DRAW" | "DRAG";

export default class Canvas {
  app: PIXI.Application;
  door?: PIXI.Sprite;
  container: HTMLElement;
  loading: boolean; // 加载状态;
  dragEvent:Function;
  line = {} as ILine;
  drawingLine:Line;
  endingPointer:Pointer;
  lines = [] as ILine[];
  isDown:Boolean;
  isUp:Boolean;
  _lastX:number;
  _lastY:number;
  onDragPointer:PIXI.Graphics;
  dragLines:ILine[];
  stackPointer: IPointer[]; // 历史栈，用于画图点栈;
  points = [] as Pointer[]; // 在画布上每个点的信息
  dragArea = {} as PIXI.Graphics;
  dragTarget = {} as any;
  crossLine = {} as ICrossLine;
  scale = {} as PIXI.ObservablePoint;
  _mode= "DRAG" as CanvasMode;
  defaultScaleGap = 0.1;
  constructor(
    el: HTMLElement,
    width = 800,
    height = 800,
    backgroundColor = 0xffffff
  ) {
    this.loading = true;
    this.app = new PIXI.Application({
      width: width, // default: 800 宽度
      height: height, // default: 600 高度
      antialias: true, // default: false 反锯齿
      transparent: false, // default: false 透明度
      resolution: 1, // default: 1 分辨率
      backgroundColor: backgroundColor,
    });
    this.isDown = false;
    this.isUp = false;
    this.container = this.app.view;
    this.mode ="DRAG";
    this.drawingLine = null;
    this.stackPointer = [];
    el.replaceWith(this.app.view);
    this.scale = new PIXI.ObservablePoint(this.scaleChange, this, 1, 1);
    this.app.stage.scale = this.scale;
    this.app.stage.interactive = true;
    this.app.view.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.app.view.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.app.view.addEventListener('mouseup',this.onMouseUp.bind(this));
    getClosePolygon();
  }
  getApp() {
    return this.app;
  }
  setup() {
    this.loading = false;
  }
  get view(){
    return this.app.view;
  }

  get stage(){
      return this.app.stage;
  }
  get yMax(){
    return this.app.view.clientHeight;
  }
  get xMax(){
    return this.app.view.clientWidth;
  }
  get mode (){
    return this._mode;
  }
  set mode(param:CanvasMode) {
    console.log('mode change',param);
    if(param === 'DRAG'){
      this.points.forEach(el => {
        el.dragAble = true;
      })
    } else {
      this.points.forEach(el => {
        el.dragAble = false;
      })
    }
    this._mode = param;
  }
  scaleChange(){
    this.app.stage.scale = this.scale;
  }
  zoomIn(gap=0.1){
    this.scale.x = this.scale.x + gap;
    this.scale.y = this.scale.y + gap;
  }
  zoomOut(gap=0.1){
    this.scale.x = this.scale.x - gap;
    this.scale.y = this.scale.y - gap;
  }
  clear(){
    for (let i = this.stage.children.length - 1; i >= 0; i--) {	
        this.stage.removeChild(this.stage.children[i]);
    };
  }
  // 画一个线段
  drawLine(){
    this.isDown = true;
    this.mode = "DRAW";
    this._onDrawStart(20, 20);
    this._onDrawMove(80, 80);
    this._onDrawEnd(80, 80);
    this.isDown = false;
    this.mode = "DRAG";
  }
  onMouseDown(event:MouseEvent){
    this.isDown = true;
    const {x, y} = this._getMousePosition(event);
    switch (this.mode) {
      case "DRAW":
        this._onDrawStart(x, y);
        break;
      case "DRAG":
      default:
        break;
    }
    
  };
  _onDrawStart(x:number, y:number){
    const pointer = this.hitPointerDetect({x , y});

    this._lastX = x;
    this._lastY = y;
    if(pointer){
      pointer.closed = true;
      this.line.sPointer = pointer.pointer;
      const lines = this.lines.filter(el => el.ePointer === pointer.pointer);
      this.line.next = lines;
    } else {
      const sPointer = new Pointer(x ,y ,5);
      sPointer.zIndex = 10;
      //TODO  with dragging
      console.log('onDraw');
      sPointer.onMove = this.dragPointer;
      this.stage.addChild(sPointer);
      this.points.push(sPointer);
      this.stackPointer.push({
        closed:false,
        pointer:sPointer,
      });
      this.line.next = [];
      this.line.sPointer = sPointer;
    }
  }
  dragPointer = (position:IPosition, context:Pointer) => {
    const hitObjGroup = this._findLinkGraphics(context);
    for(const key  in hitObjGroup){
      if(key === 'line'){
        this._moveLine(hitObjGroup[key], context, position);
      }
    }
  }
  _moveLine(lines:ILine[], context:Pointer, position:IPosition){
    const {x, y} = position;
    lines.forEach((el)=>{
      const line = el.line;
      if(el.sPointer ===context){
        line.updatePointers({x1:x, y1:y}, {x2:line._ex, y2:line._ey})
      } else {
        line.updatePointers({x1:line._sx, y1:line._sy}, {x2:x, y2:y});
      }
    })
  }
  _findLinkGraphics(obj:PIXI.Graphics):ILinkArea{
    const line = this.lines.filter((el => el.sPointer === obj || el.ePointer === obj));
    return {
      line:line,
    }
  }
  onMouseMove(event:MouseEvent){
    const {x, y} = this._getMousePosition(event);
    switch (this.mode) {
      case "DRAW":
        this._onDrawMove(x, y);
        break;
      case "DRAG": 
      default:
        break;
    }
   
  }
  _onDrawMove(x:number, y:number){
    if(this.isDown){
      if(!this.drawingLine){
          this.drawingLine = new Line(this._lastX, this._lastY, x,y, 8);
          this.drawingLine.alpha = 0.5;
          this.endingPointer = new Pointer(x,y,5);
          this.endingPointer.alpha = 0.5;
          this.drawingLine.alpha = 0.5;
          this.stage.addChild(this.drawingLine);
          this.stage.addChild(this.endingPointer);
          this.stage.addChild(this.drawingLine.txt);
      } else {
        this.drawingLine.updatePointers({x1:this._lastX, y1:this._lastY}, {x2:x, y2:y});
        this.endingPointer.x = x;
        this.endingPointer.y = y;
       
        const pointer = this.hitPointerDetect({x, y});
        if(pointer){
          this.drawCrossLine(pointer.pointer.x, pointer.pointer.y+5);
        } else {
          this.clearCrossLine();
        }
      }
      this.stage.sortChildren();
    }
  }
  onMouseUp(event:MouseEvent){
    this.clearCrossLine();
    const {x, y} = this._getMousePosition(event);
    switch (this.mode) {
      case "DRAW":
        this._onDrawEnd(x,y);
        break;
      case "DRAG":
          break;  
      default:
        break;
    }  
    this.isDown = false;
    this.isUp = true;
  }
  _onDrawEnd(x:number,y:number){
    if(this.isDown){
      const pointer = this.hitPointerDetect({x, y});
      if(pointer){
        this.endingPointer.clear();
        pointer.closed = true;
        this.line.ePointer = pointer.pointer;
        const lines = this.lines.filter(el => el.sPointer === pointer.pointer);
        this.line.next = lines;
        // 当离散的点都闭合了，默认为闭合的多边形，填充内部图形
        if(this.stackPointer.filter(el => !el.closed).length === 0 && this.stackPointer.length >=3){
          const pointers = this.stackPointer.reduce((accumulator,cur)=>{
            accumulator.push(cur.pointer.x);
            accumulator.push(cur.pointer.y);
          return accumulator;
          },[] as number[]);
          const polygon = this.drawPolygon(pointers);
          this.mode = "DRAG";
        }  
      } else {
        this.endingPointer.alpha =1;
        this.endingPointer.buttonMode = true;
        this.endingPointer.interactive = true;
        this.endingPointer.onMove = this.dragPointer;
        // this.endingPointer.on('pointerdown',this.dragPointer);
        this.points.push(this.endingPointer);
        this.stackPointer.push({
          closed:false,
          pointer:this.endingPointer,
        });
        this.endingPointer.zIndex =2;
        this.line.ePointer = this.endingPointer;
      }
      this.line.line = this.drawingLine;
      this.drawingLine = null as Line;
      this.endingPointer = null;
      this.stage.sortChildren();
      this.lines.push(this.line);
      console.log("lines", this.lines);
      // const testLine = this.lines.map(el=>{
      //   const arr = this.lines.filter(item => { return item.sPointer === el.ePointer})
      //   console.log('arr', arr);
        
      //   el.next = arr;
      //   const next = arr.map(el=>{
      //     return {
      //       sp:{
      //         x:el.sPointer.x,
      //         y:el.sPointer.y
      //       },
      //       ep:{
      //         x:el.ePointer.x,
      //         y:el.ePointer.y
      //       }
      //     }
      //   })
      //   const a = {
      //     sp:{
      //       x:el.sPointer.x,
      //       y:el.sPointer.y
      //     },
      //     ep:{
      //       x:el.ePointer.x,
      //       y:el.ePointer.y
      //     },
      //     next
      //   }
      //   return a;
      // })
      // console.log("testLine", testLine);
      this.line = {} as ILine;
    }
      this.isDown = false;
      this.isUp = true;
  }
  startDraw(){
     this.mode= "DRAW";
     console.log(this.mode);
  }
  hitPointerDetect({x, y}){
    const pointer = this.stackPointer.find(el => {
      const rec = el.pointer.getBounds();
      const _x = x * this.stage.scale.x;
      const _y = y * this.stage.scale.y;
      return this._detectHit(rec, _x , _y)
     
    })
    if(pointer) return pointer;
    return false;
  }
  drawCrossLine(x:number,y:number){
    if(this.crossLine.lineX){
      this.crossLine.lineX.clear();
      this.crossLine.lineY.clear();
      this.crossLine.lineX.lineStyle(1, 0x034efc);
      this.crossLine.lineY.lineStyle(1, 0x034efc);
    } else {
      this.crossLine.lineX = new PIXI.Graphics();
      this.crossLine.lineX.lineStyle(1, 0x034efc);
      this.crossLine.lineY = new PIXI.Graphics();
      this.crossLine.lineY.lineStyle(1, 0x034efc);
      this.stage.addChild(this.crossLine.lineX ,this.crossLine.lineY);
    }
    this.crossLine.lineX.moveTo(0, y-5);
    this.crossLine.lineX.lineTo(this.xMax, y);
    this.crossLine.lineY.moveTo(x, 0);
    this.crossLine.lineY.lineTo(x, this.yMax);
  }
  clearCrossLine(){
    if(this.crossLine.lineX && this.crossLine.lineY){
      this.crossLine.lineX.clear();
      this.crossLine.lineY.clear();
    }
  }
  // _hitAreas({x,y}){
  //   const lines = [] as ILine[];
  //   let hitGraphics =  {} as PIXI.Graphics;
  //   this.lines.forEach(el => {
  //     if(this._detectHit(el.ePointer.getBounds(),x,y)){
  //       hitGraphics = el.ePointer;
  //       lines.push(el);
  //       return;
  //     }
  //     if(this._detectHit(el.sPointer.getBounds(),x,y)){
  //       hitGraphics = el.sPointer;
  //       lines.push(el);
  //       return;
  //     }
  //   });
  //   if(this.lines.length ===0){
  //     return false;
  //   }
  //   const area = this.areas.filter(el => el.pointers.includes( hitGraphics));
  //   return {
  //     lines:lines,
  //     hitOnPointer:hitGraphics,
  //     area,
  //   };
  // }
  _detectHit(rec:PIXI.Rectangle, x:number, y:number ){
    if(x>=rec.x && x<= rec.x + rec.width && y>=rec.y && y<= rec.y + rec.height){
      return true;
    }
    return false;

  }
  drawPolygon(pointers:number[]){
    const polygon = new Polygon(pointers);
    polygon.zIndex =0;
    this.stage.addChild(polygon);
    const size = polygon.size;
    const position = polygon.centerPosition;
    const text = new PIXI.Text(`${Math.round(size)}`,{fontFamily : 'Arial', fontSize: 12, fill : 0x000000, align : 'center'})
    this.stage.addChild(text);
    text.x = position[0] - text.width/2;
    text.y = position[1];
    text.zIndex = 2;
    this.app.stage.sortChildren();
    return polygon;
  }
  _getMousePosition(event:MouseEvent){
    const x = (event.pageX - this.view.offsetLeft)/this.scale.x;
    const y = (event.pageY - this.view.offsetTop)/this.scale.y;
    return {x, y};
  }
}
