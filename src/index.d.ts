
declare interface IPosition{
    x:number,
    y:number
}
declare interface lineRef {
    [index:number]:IPosition;
    length:2
}

// import Line from './canvas/Line';
// import Point from './canvas/Pointer';