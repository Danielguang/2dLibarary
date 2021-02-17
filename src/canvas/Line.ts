import { Container } from "pixi.js";
import * as PIXI from "pixi.js";
let Graphics = PIXI.Graphics;


interface Position {
    x:number,
    y
    :number
}
const LINE_INDEX = 0;
const POINT_INDEX = 1;
const TEXT_INDEX  = 2;
const LINE_BACKGROUND=0xe5e8ea;
export default class Line extends PIXI.Graphics {
    pointer: PIXI.Graphics;
    _angle:number; // 当前的角度弧度
    _sx:number;
    _sy:number;
    _ex:number;
    _ey:number;
    text:PIXI.Text;
    constructor(xStart = 0, yStart = 0, xEnd: number, yEnd: number, width = 10){
        super();
  
        this.lineStyle(width,LINE_BACKGROUND,1);
        this.moveTo(xStart, yStart);
        this.lineTo(xEnd, yEnd);
        this._sx = xStart;
        this._sy = yStart;
        this._ex = xEnd;
        this._ey = yEnd;
        this.zIndex = LINE_INDEX;
        this.computeLength();  
    }
    get txt(){
        return this.text;
    }
    // 返回线段长度
    computeLength():number{
        const c = Math.sqrt(Math.pow((this._sx - this._ex),2) + Math.pow((this._ey - this._sy),2));
        if(!this.text){
            this.text = new PIXI.Text(`${Math.round(c)}`,{fontFamily : 'Arial', fontSize: 12, fill : 0x000000, align : 'center'});
        }
        this.text.text = `${Math.round(c)}`;
        this._angle = Math.asin(Math.abs(this._sy - this._ey)/c);
        const x = Math.max(this._sx, this._ex);
        const y = Math.max(this._sy, this._ey);
        this.text.x = x - c/2 * Math.cos(this._angle) - this.text.width/2;
        this.text.y = y - c/2 * Math.sin(this._angle) - this.text.height/2;
        this.text.zIndex = TEXT_INDEX;
        return c
    }
    // _line(xStart = 0, yStart = 0, xEnd: number, yEnd: number, width = 10, pointer = true, background=0xe5e8ea){
    //     let line = new Graphics();
    //     line.moveTo(xStart, yStart);
    //     line.lineStyle(width,background);
    //     line.lineTo(xEnd, yEnd);
    //     line.moveTo(xStart, yStart);
    //     line.lineStyle(width,background);
    //     line.lineTo(xEnd, yEnd);
    //     this.lineContainer.addChildAt(line, LINE_INDEX);
    //     if(pointer){
    //         let sPointer = new Pointer(xStart, yStart,width /2,this.onDragStartPointer.bind(this));
    //         this.lineContainer.addChildAt(sPointer.pointer, POINT_INDEX);
    //         let ePointer = new Pointer(xEnd, yEnd,width /2, this.onDragEndPointer.bind(this));
    //         this.lineContainer.addChildAt(ePointer.pointer,POINT_INDEX );
    //     }

    //     return line;
    // }
    // onDragEndPointer(position:Position, isEnd:Boolean){
    //     console.log(isEnd);
    //     if(isEnd){
    //         this._ex = position.x;
    //         this._ey = position.y;
    //     }
    //     this.line.clear();
    //     this.line.moveTo(this._sx, this._sy);
    //     this.line.lineStyle(10,0xe5e8ea);
    //     this.line.lineTo(position.x, position.y);
    //     this.lineContainer.addChildAt(this.line,0);
    //     this.computeLength(this._sx, this._sy, position.x, position.y);

    //   }
    // onDragStartPointer(position:Position,isEnd:Boolean){
    //     if(isEnd){
    //         this._sx = position.x;
    //         this._sy = position.y;
    //     }
    //     this.line.clear();
    //     this.line.moveTo(position.x, position.y);
    //     this.line.lineStyle(10,0xe5e8ea);
    //     this.line.lineTo(this._ex, this._ey);
    //     this.line.zIndex =1;
    //     this.lineContainer.addChildAt(this.line, 0);
    //     this.computeLength(position.x, position.y, this._ex, this._ey);
       
    // }
    updatePointers({x1, y1},{x2, y2}){
        this._updateStartAneEndPointer(x1,y1,x2,y2);
        this.clear();
        this.lineStyle(10,0xe5e8ea);
        this.moveTo(x1,y1);
        this.lineTo(x2, y2);
        this.computeLength();
    }
    private _updateStartAneEndPointer(x1:number, y1:number, x2:number, y2:number){
        this._sy = y1;
        this._sx = x1;
        this._ey = y2;
        this._ex = x2;
    }
}