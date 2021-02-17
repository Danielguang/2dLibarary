import * as PIXI from "pixi.js";
export default class Pointer extends PIXI.Graphics{
    isMouseDown = false;
    data:PIXI.InteractionData;
    dragEvent:Function;
    constructor(x:number, y:number, radius:number, onDrag?:Function){
        super();
        this.beginFill(0x000000);// 黑色的点
        this.lineStyle(0);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        // if(onDrag){
        //     console.log('in drag',onDrag);
        //     p.interactive = true;
        //     p.on('mousemove', this._onDrag.bind(this));
        //     p.on('mousedown', this.onMouseDown.bind(this));
        //     p.on('mouseup', this.onMouseUp.bind(this));
        // }
        this.dragEvent = onDrag;
    }
    // private _onDrag(){
    //     const arr = [...arguments];
    //     if(this.isMouseDown){
    //         if(this.data){
    //             const newPosition = this.data.getLocalPosition(this.pointer.parent);
    //             this.pointer.x = newPosition.x;
    //             this.pointer.y = newPosition.y;
    //             this.dragEvent.call(this, newPosition, false);
    //         }
           
    //     }
    // }
    onMouseDown(event:PIXI.InteractionEvent){
        this.isMouseDown = true;
        this.alpha = 0.5;
        this.data = event.data;
    }
    onMouseUp(event:PIXI.InteractionEvent){
        this.isMouseDown = false;
        this.alpha = 1;
        if(this.data){
            const newPosition = this.data.getLocalPosition(this.parent);
            this.dragEvent.call(this, newPosition, true);
        }
    }
}