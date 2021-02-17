
declare interface IPosition{
    x:number,
    y:number
}

declare interface ILine {
    line:Line;
    sPointer: Point; // 初始位置的;
    ePointer: Point; // 结束位置;
}
import Line from './canvas/Line';
// import Point from './canvas/Pointer';