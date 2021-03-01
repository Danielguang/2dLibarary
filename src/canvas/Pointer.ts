import * as PIXI from "pixi.js";
export default class Pointer extends PIXI.Graphics{
    dragging:boolean = false;
    data:PIXI.InteractionData;
    dragEvent:Function;
    dragAble:boolean = false;
    radius:number;
    onMove:(position:IPosition, context:any)=> void;
    constructor(x:number, y:number, radius:number){
        super();
        this.beginFill(0x000000);// 黑色的点
        this.lineStyle(0);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onDragStart)
        .on('pointerup', this.onDragEnd)
        .on('pointerupoutside', this.onDragEnd)
        .on('pointermove', this.onDragMove);
    }
    onDragStart(event:PIXI.InteractionEvent){
        if(!this.dragAble) return;
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
    }
    onDragEnd(){
        if(!this.dragAble) return;
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
    }
    onDragMove(){
        if (this.dragging && this.dragAble) {
            const newPosition = this.data.getLocalPosition(this.parent);
            this.x = newPosition.x;
            this.y = newPosition.y;
            if(this.onMove){
                this.onMove({x:this.x, y:this.y}, this);
            }
        }
    }
    rePaint(){
        this.beginFill(0x000000);// 黑色的点
        this.lineStyle(0);
        this.drawCircle(0, 0, this.radius);
        this.endFill();
    }

}