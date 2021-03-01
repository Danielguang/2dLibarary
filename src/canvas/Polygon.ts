import * as PIXI from "pixi.js";
interface IPosition {
    x:number,
    y:number
}
export default class Polygon  extends PIXI.Graphics{
    positions:IPosition[];
    constructor(positions: IPosition[]){
        super();
        const color = Number(this.getRandomColor());
        console.log(color);
        this.beginFill(color);
        const _position = [] as PIXI.Point[];
        for(let i =0;i< positions.length; i++){
            const p = positions[i];
            const pointer = new PIXI.Point(p.x, p.y);
            _position.push(pointer);
        }
        this.drawPolygon(_position);
        this.endFill();
        this.positions = positions;
        // this._transformToLocalPosition(positions);
        // console.log(this._positions);
    }
    updatePolygon(pointers){
        this.clear();

        this.beginFill(0x66FF33);
        this.drawPolygon(pointers);
        this.endFill();
        this._transformToLocalPosition(pointers);
    }
    getRandomColor() {
        var letters = '0123456789ABCDEF';
        let color ='';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return `0x${color}`;
      }
    _transformToLocalPosition(pointers:lineRef[]){
        // for(let i = 0; i<pointers.length; i++){    
        //     if(i%2 === 0){
        //      const tmp = pointers.slice(i, i+2);
        //      if(tmp.length === 2){
        //         this._positions.push({
        //             x:tmp[0],
        //             y:tmp[1],
        //         }) 
        //      }   
        //     }
        // }
        for(let i = 0; i<pointers.length; i++){    
            this.positions.push({
                x:pointers[i][0].x,
                y:pointers[i][0].y
            });
            this.positions.push({
                x:pointers[i][1].x,
                y:pointers[i][1].y
            });
        }
    }
    get size(){
        const len = this.positions.length;
        let s = this.positions[0].y * (this.positions[len-1].x - this._positions[1].x);
        for(let i = 1; i< len; ++i){
            s += this.positions[i].y * (this.positions[i-1].x - this._positions[(i+1)%len].x);
        }
        return Math.abs(s/2);
    }

    get centerPosition(){
        let x = 0;
        let y = 0;
      for (var i = 1; i <= this.positions.length; i++) {
        const lat = this.positions[i % this.positions.length].x;
        const lng = this.positions[i % this.positions.length].y;
        const nextLat = this.positions[i - 1].x;
        const nextLng = this.positions[i - 1].y;
        const temp = (lat * nextLng - lng * nextLat) / 2;
        x += (temp * (lat + nextLat)) / 3;
        y += (temp * (lng + nextLng)) / 3;
      }
      x = x / this.size;
      y = y / this.size;
      return [x, y];
    }
}
