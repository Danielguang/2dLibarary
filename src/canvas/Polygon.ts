import * as PIXI from "pixi.js";
interface IPosition {
    x:number,
    y:number
}
export default class Polygon  extends PIXI.Graphics{
    _positions:IPosition[];
    constructor(pointers:number[]){
        super();
        // const polygon = new PIXI.Graphics();
        this.beginFill(0x66FF33);
        this.drawPolygon(pointers);
        this.endFill();
        this._positions = [];
        this._transformToLocalPosition(pointers);
        console.log(this._positions);
    }
    updatePolygon(pointers){
        this.clear();
        this.beginFill(0x66FF33);
        this.drawPolygon(pointers);
        this.endFill();
        this._transformToLocalPosition(pointers);
    }
    _transformToLocalPosition(pointers:number[]){
        for(let i = 0; i<pointers.length; i++){    
            if(i%2 === 0){
             const tmp = pointers.slice(i, i+2);
             if(tmp.length === 2){
                this._positions.push({
                    x:tmp[0],
                    y:tmp[1],
                }) 
             }   
            }
        }
    }
    get size(){
        const len = this._positions.length;
        let s = this._positions[0].y * (this._positions[len-1].x - this._positions[1].x);
        for(let i = 1; i< len; ++i){
            s += this._positions[i].y * (this._positions[i-1].x - this._positions[(i+1)%len].x);
        }
        return Math.abs(s/2);
    }

    get centerPosition(){
        let x = 0;
        let y = 0;
      for (var i = 1; i <= this._positions.length; i++) {
        const lat = this._positions[i % this._positions.length].x;
        const lng = this._positions[i % this._positions.length].y;
        const nextLat = this._positions[i - 1].x;
        const nextLng = this._positions[i - 1].y;
        const temp = (lat * nextLng - lng * nextLat) / 2;
        x += (temp * (lat + nextLat)) / 3;
        y += (temp * (lng + nextLng)) / 3;
      }
      x = x / this.size;
      y = y / this.size;
      return [x, y];
    }
}
