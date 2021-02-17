import Canvas from './src/canvas/Canvas';
const el = document.getElementById("canvas");
const canvas = new Canvas(el);
function drawLine() {
    console.log('draw line');
    canvas.drawLine();
    // canvas.drawLine(200,200, 500, 500);
}
function drawFloorPlan(){
    canvas.startDraw();
}
function clear(){
    canvas.clear();
}
function zoomIn(){
    canvas.zoomIn();
}
function zoomOut(){
    canvas.zoomOut();
}

document.getElementById('line-btn').onclick = drawLine;
document.getElementById('draw-btn').onclick = drawFloorPlan;
document.getElementById('clear-btn').onclick = clear;
document.getElementById('zoom-in').onclick = zoomIn;
document.getElementById('zoom-out').onclick = zoomOut;