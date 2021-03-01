
declare interface IPosition{
    x:number,
    y:number
}
declare interface lineRef {
    [index:number]:IPosition;
    length:2
}

// 用来定义linked Line Ref
declare interface LinkRef {
    length:number;
    point:IPosition
}

declare interface PointRef {
    x:number,
    y:number;
    path?:number[],
    maxLength:number,
}


// import Line from './canvas/Line';
// import Point from './canvas/Pointer';