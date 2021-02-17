interface line {
    sp:IPosition,
    ep:IPosition,
    next:line[]
}
export const intersection = (start1:number, end1:number, start2:number, end2:number, k = 0) => {
    if (k === 0) {
        if (start2[0] - end2[0] === 0 || start2[1] - end2[1] === 0)
            return intersection(start2, end2, start1, end1, k = 1)
    }
    // 这个是可能的交点
    let x = null, y = null
    // 第一条平行于Y轴
    if (start1[0] - end1[0] === 0) {
        if (start2[0] - end2[0] === 0) {
            // 两条线都平行Y轴
            if (start1[0] === start2[0] && Math.max(start1[1], end1[1]) >= Math.min(start2[1], end2[1]) && Math.min(start1[1], end1[1]) <= Math.max(start2[1], end2[1]))
                return [start1[0], Math.max(Math.min(start2[1], end2[1]), Math.min(start1[1], end1[1]))]
        } else {
            // 第二条线不平行Y(未判断线段可交)
            let k = (end2[1] - start2[1]) / (end2[0] - start2[0])
            x = start1[0]
            y = (x - end2[0]) * k + end2[1]
        }
    } else if (start1[1] - end1[1] === 0) {
        // 第一条平行于X轴
        if (start2[1] - end2[1] === 0) {
            // 两条线都平行X轴
            if (start1[1] === start2[1] && Math.max(start1[0], end1[0]) >= Math.min(start2[0], end2[0]) && Math.min(start1[0], end1[0]) >= Math.max(start2[0], end2[0]))
                return [Math.max(Math.min(start2[0], end2[0]), Math.min(start1[0], end1[0]), start1[1])]
        } else if (start2[0] - end2[0] === 0) {
            // 第二条线平行Y(未判断线段可交)
            x = start2[0]
            y = start1[1]
        } else {
            // 第二条线存在K
            let k = (end2[1] - start2[1]) / (end2[0] - start2[0])
            y = start1[1]
            x = (y - (start2[1] - (k * start2[0]))) / k
        }
    } else if ((end2[1] - start2[1]) / (end2[0] - start2[0]) === (end1[1] - start1[1]) / (end1[0] - start1[0])) {
        // 斜率不为0存在且相等
        let k = (end2[1] - start2[1]) / (end2[0] - start2[0])
        if ((end2[1] - k * end2[0]) === (end1[1] - k * end1[0])) {
            // b相等
            x = Math.max(Math.min(start1[0], end1[0]), Math.min(start2[0], end2[0]))
            y = Math.max(Math.min(start1[1], end1[1]), Math.min(start2[1], end2[1]))
        } else {
            // b不相等 没有交点
            return []
        }
    } else {
        // 两个都是正常的K
        let k2 = (end2[1] - start2[1]) / (end2[0] - start2[0])
        let k1 = (end1[1] - start1[1]) / (end1[0] - start1[0])
        let b2 = (start2[1] - k2 * start2[0])
        let b1 = (start1[1] - k1 * start1[0])
        x = (b2 - b1) / (k1 - k2)
        y = (x * k1) + b1
    }
    // 上下左右边界，确定所求出来的x,y是不是在线段上面
    let l = Math.max(Math.min(start1[0], end1[0]), Math.min(start2[0], end2[0]))
    let r = Math.min(Math.max(start1[0], end1[0]), Math.max(start2[0], end2[0]))
    let b = Math.max(Math.min(start1[1], end1[1]), Math.min(start2[1], end2[1]))
    let t = Math.min(Math.max(start1[1], end1[1]), Math.max(start2[1], end2[1]))
    // console.log(l, r, b, t)
    // console.log(x, y)
    if (x !== null && x >= l && x <= r && y <= t && y >= b) {
        return [x, y]
    } else {
        return []
    }
};
import {cloneDeep } from 'lodash';

const mock = [
    {
        "sp": {
          "x": 333,
          "y": 312
        },
        "ep": {
          "x": 361,
          "y": 362
        },
        "next": []
      },
    {
      "sp": {
        "x": 109,
        "y": 237
      },
      "ep": {
        "x": 302,
        "y": 236
      },
      "next": []
    },
    {
      "sp": {
        "x": 295,
        "y": 60
      },
      "ep": {
        "x": 111,
        "y": 75
      },
      "next": []
    },
    {
      "sp": {
        "x": 302,
        "y": 236
      },
      "ep": {
        "x": 333,
        "y": 312
      },

    },
    {
      "sp": {
        "x": 333,
        "y": 312
      },
      "ep": {
        "x": 128,
        "y": 341
      }
    },
    {
        "sp": {
          "x": 302,
          "y": 236
        },
        "ep": {
          "x": 295,
          "y": 60
        },
        "next": []
      },
    {
        "sp": {
          "x": 128,
          "y": 341
        },
        "ep": {
          "x": 109,
          "y": 237
        }
      },
      {
        "sp": {
          "x": 111,
          "y": 75
        },
        "ep": {
          "x": 109,
          "y": 237
        },
        "next": []
      }
  ] as line[];
export const getClosePolygon = ()=>{
    console.log(mock);
    const clone = cloneDeep(mock)
    // 回溯算法
    const res = new Set();
    const visited = new Set();
    const leftLine = [];
    const backTrack = (path, current:line, start:line,stop = false) =>{
        if(stop) return;
        visited.add(current);
        const _next = clone.filter(item => item.ep.x === current.sp.x && item.ep.y === current.sp.y && !visited.has(item));
        console.log('_next', _next);
        // debugger;
        if(_next.length === 0) return;
        if(_next.length >= 2) leftLine.push(current)
        for(let i =0; i< _next.length; i++){
            const n = _next[i];
            // 4个坐标相等，回到原点，结束
            if(n.sp.x === start.sp.x && n.sp.x === start.sp.x && n.sp.y === start.sp.y && n.sp.x === start.sp.x){
                res.add(path);
                backTrack(path.concat(n),n,start,true)
            } else {
                backTrack(path.concat(n),n,start,false)
            }
            
        }   
    }
    for(let i =0; i< mock.length; i++){
        const n = mock[i];
        const start = clone[i];
        backTrack([].concat(start), n, start)
    }
    console.log(res, leftLine);
}
getClosePolygon();