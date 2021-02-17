import * as PIXI from "pixi.js";
let TextureCache = PIXI.utils.TextureCache
let Sprite = PIXI.Sprite;
let Graphics = PIXI.Graphics;
interface IPointer {
  pointer:PIXI.Graphics;
  closed:Boolean;
}
interface ILine {
  line:Line;
  sPointer: PIXI.Graphics; // 初始位置的;
  ePointer: PIXI.Graphics; // 结束位置;
}
interface IArea {
  pointers:PIXI.Graphics[];
  polygon:Polygon;
}
interface ICrossLine {
  lineX:PIXI.Graphics,
  lineY:PIXI.Graphics
}

type CanvasModel = "DRAW" | "DRAG";
import Line from './Line';
import Pointer from "./Pointer";
import Polygon from "./Polygon";
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
  areas = [] as IArea[];
  _lastX:number;
  _lastY:number;
  onDragPointer:PIXI.Graphics;
  mode = "DRAW" as CanvasModel;
  dragPointer:PIXI.Graphics;
  dragLines:ILine[];
  stackPointer: IPointer[]; // 历史栈，用于画图点栈;
  points = [] as PIXI.Graphics[]; // 在画布上每个点的信息
  dragArea = {} as PIXI.Graphics;
  dragTarget = {} as any;
  crossLine = {} as ICrossLine;
  scale = {} as PIXI.ObservablePoint;
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
    console.log(this.xMax);
    this.scale = new PIXI.ObservablePoint(this.scaleChange, this, 1, 1);
    this.app.stage.scale = this.scale;
    this.app.view.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.app.view.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.app.view.addEventListener('mouseup',this.onMouseUp.bind(this));
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
  drawLine(xStart = 0, yStart = 0, xEnd: number, yEnd: number, width = 10) {
    const dragLine = new Line(xStart, yStart, xEnd, yEnd,width);
    this.stage.addChild(dragLine);
  }
  clear(){
    for (let i = this.stage.children.length - 1; i >= 0; i--) {	
        this.stage.removeChild(this.stage.children[i]);
    };
  }
  onMouseDown(event:MouseEvent){
    this.isDown = true;
    const {x, y} = this._getMousePosition(event);
    switch (this.mode) {
      case "DRAW":
        this._onDrawStart(x, y);
        break;
      case "DRAG":
        this._onDragStart(x,y);
      default:
        break;
    }
    
  };
  _onDragStart(x:number, y:number){
    this._lastX = x;
    this._lastY = y;
    // const pointer = this.hitPointerDetect({x, y});
    const hit =this._hitAreas({x, y});
    if(hit){
      this.dragTarget = hit;
    }
  }
  
  _onDrawStart(x:number, y:number){
    const pointer = this.hitPointerDetect({x, y });
    this._lastX = x;
    this._lastY = y;
    if(pointer){
      pointer.closed = true;
      this.line.sPointer = pointer.pointer;
    } else {
      const sPointer = new Pointer(x ,y ,5);
      sPointer.zIndex = 10;
      sPointer.interactive = true;
      sPointer.buttonMode = true;
      //TODO  with dragging
      sPointer.on('pointerdown',(event)=>{
        console.log('onClick', event);
      })
      this.stage.addChild(sPointer);
      this.points.push(sPointer);
      this.stackPointer.push({
        closed:false,
        pointer:sPointer,
      });
      this.line.sPointer = sPointer;
    }
  }
  onMouseMove(event:MouseEvent){
    const {x, y} = this._getMousePosition(event);
    switch (this.mode) {
      case "DRAW":
        this._onDrawMove(x, y);
        break;
      case "DRAG":
        this._onDragMove(event);  
      default:
        break;
    }
   
  }
  _onDragMove(event:MouseEvent){
    const x = event.pageX - this.view.offsetLeft;
    const y = event.pageY - this.view.offsetTop;
    if(this.isDown){
      if(this.dragTarget.hitOnPointer){
        this.dragTarget.hitOnPointer.x = x;
        this.dragTarget.hitOnPointer.y = y;
      }
      if(this.dragTarget.lines){
        this.dragTarget.lines.forEach(el => {
          if(el.sPointer === this.dragTarget.hitOnPointer){
            el.line.updatePointers({  
                x1:x,
                y1:y
            }, {
              x2:el.ePointer.x,
              y2:el.ePointer.y
            });
          } else {
            el.line.updatePointers({  
              x1:el.sPointer.x,
              y1:el.sPointer.y
            }, {
              x2:x,
              y2:y
            });
          }
        })
      }
      if(this.dragTarget.area){
        const area = this.dragTarget.area as IArea[];
        area.forEach(el => {
          const pointers = el.pointers.reduce((accumulator,cur)=>{
            accumulator.push(cur.x);
            accumulator.push(cur.y);
          return accumulator;
          },[] as number[]);
          el.polygon.updatePolygon(pointers);
          this.stage.sortChildren();
        })

      }
      
      // 更新area 
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
          console.log('drawCrossLine');
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
        const pointers = this.stackPointer.map(el => el.pointer);
        const area = {} as IArea;
        area.pointers = pointers;
        if(this.stackPointer.filter(el => !el.closed).length === 0){
          const pointers = this.stackPointer.reduce((accumulator,cur)=>{
            accumulator.push(cur.pointer.x);
            accumulator.push(cur.pointer.y);
          return accumulator;
          },[] as number[]);
          const polygon = this.drawPolygon(pointers);
          area.polygon = polygon;
          this.areas.push(area);
          this.mode = "DRAG";
        }  
      } else {
        this.endingPointer.alpha =1;
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
      this.line = {} as ILine;
    }
      this.isDown = false;
      this.isUp = true;
  }
  startDraw(){
     this.mode= "DRAW";
   
  }
  hitPointerDetect({x, y}){
    console.log(this.stackPointer, {x,y});
    const pointer = this.stackPointer.find(el => {
      const rec = el.pointer.getBounds();
      return this._detectHit(rec, x, y)
     
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
  _hitAreas({x,y}){
    const lines = [] as ILine[];
    let hitGraphics =  {} as PIXI.Graphics;
    this.lines.forEach(el => {
      if(this._detectHit(el.ePointer.getBounds(),x,y)){
        hitGraphics = el.ePointer;
        lines.push(el);
        return;
      }
      if(this._detectHit(el.sPointer.getBounds(),x,y)){
        hitGraphics = el.sPointer;
        lines.push(el);
        return;
      }
    });
    if(this.lines.length ===0){
      return false;
    }
    const area = this.areas.filter(el => el.pointers.includes( hitGraphics));
    return {
      lines:lines,
      hitOnPointer:hitGraphics,
      area,
    };
  }
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
    console.log("getting size", polygon.size);
    const size = polygon.size;
    const position = polygon.centerPosition;
    console.log("center position", polygon.centerPosition);
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
