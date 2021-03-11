import { initShaders } from "./jsm/utils";
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vsSource = (document.querySelector("#vertexShader") as HTMLElement).innerText;
const fsSource = (document.querySelector("#fragmentShader") as HTMLElement).innerText;
 //三维画笔
const gl = canvas.getContext("webgl");
const program = initShaders(gl, vsSource, fsSource);

const drawRecTangle = (position:number[])=>{
    const vertices = new Float32Array(position);
      //缓冲对象
      const vertexBuffer = gl.createBuffer();
      //绑定缓冲对象
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      //写入数据
      gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)
      //获取attribute 变量
      const a_Position=gl.getAttribLocation(program, 'a_Position')
      //修改attribute 变量
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
      //赋能-批处理
      gl.enableVertexAttribArray(a_Position)

      //声明颜色 rgba
      gl.clearColor(0, 0, 0, 1);
      //绘制顶点
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
/**
 * 
 * @param startPointer 起始位置
 * @param length 最大的边长
 * @param gap 每次缩小的距离
 * @param step 走多少布
 */
const drawPolygon = (startPointer:number[]) => {
    let x = startPointer[0];
    let y = startPointer[1];
    // 假设边长0.5;
    let l = 0.5;
    let directions  = ['LEFT','DOWN', 'RIGHT','TOP'];
    const gap = 0.05;

    for(let i = 0; i< 2; i++){
        const d = directions[i%4];
        if(d === 'LEFT'){
            // 找到三个点
            const p1 = [
                x- l , y, 
                x- l, y - gap,
                x, y,
                x, y - gap,
            ] as number[];
            console.log(p1);
            drawRecTangle(p1);
            x = x- l;
            y = y -gap;
            l = l - gap;// 每次减少0.01;
        }
        if(d === 'DOWN'){
            const p1 = [
                x, y,
                x, y-l,
                x + gap, y,
                x + gap, y - l

            ]
            drawRecTangle(p1);
            x = x + gap;
            y = y - l;
        }
        if(d === 'RIGHT'){
            const p1 = [
                x, y + gap,
                x, y,
                x + l, y + gap,
                x + gap, y - l
            ]
            drawRecTangle(p1);
            x = x + gap;
            y = y - l;
            
        }
        if(d === 'TOP'){
            
        }

    }
    }
// 第一步
drawPolygon([0.25, 0.25]);
//  const getNextPosition = (i:number, position:number[], gap = 0.004)=>{

//     let direction  = ['DOWN', 'RIGHT','TOP', 'RIGHT'];
//     const step = i%4;
//     switch (step) {
//         case 0:
//             position[1] = position[1] -  gap;      
//             break;
//         case 1:
//             position[0] = position[0] +  gap;      
//              break;
    
//         default:
//             break;
//     }
//  }

