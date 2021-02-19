
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
import {cloneDeep, uniqWith, isEqual, difference, remove, pullAt } from 'lodash';

const mock = [
    {
        "sp": {
          "x": 10,
          "y": 10
        },
        "ep": {
          "x": 20,
          "y": 10
        }
      },
      {
        "sp": {
          "x": 20,
          "y": 10
        },
        "ep": {
          "x": 30,
          "y": 10
        }
      },
      {
        "sp": {
          "x": 20,
          "y": 10
        },
        "ep": {
          "x": 20,
          "y": 20
        }
      },
      {
        "sp": {
          "x": 30,
          "y": 10
        },
        "ep": {
          "x": 30,
          "y": 20
        }
      },
      {
        "sp": {
          "x": 20,
          "y": 20
        },
        "ep": {
          "x": 30,
          "y": 20
        }
      },
      {
        "sp": {
          "x": 10,
          "y": 20
        },
        "ep": {
          "x": 20,
          "y": 20
        }
      },
      {
        "sp": {
          "x": 10,
          "y": 10
        },
        "ep": {
          "x": 10,
          "y": 20
        }
      }
  ] as lineRef[];
// 1. 首先根据每一个点直接遍历所有图形可形成闭合区域的
// 2. 每个点依次遍历
// 3. 去除重复的
// 4. 去除包含的
export const getClosePolygon = (lines?: lineRef[])=>{
    const res = [] as lineRef[][];
    const result = []
    const visited = new Set();
    // 回溯算法
    const backTrack = (path, current:lineRef, start:lineRef,step =1, visited) =>{
        const _next = mock.filter((item) => getLinkLine(current, item) && !visited.has(item));
        console.log(_next);
      
        if(_next.length === 0) {
            const {x, y } = start.sp;
            if(current.ep.x === x && current.ep.y === y || current.sp.x ===x && current.sp.y === y){
                res.push(path);
            }
            return;
        };
        visited.add(current);
        step = step +1;
        for(let i =0; i< _next.length; i++){
            const n = _next[i];
            // path.push([{x:n.sp.x, y:n.sp.y},{ x:n.ep.x, y:n.ep.y }]);
            backTrack(path.concat(n), n, start,step,visited); 
        }   
    }
    // for(let i = 0; i<mock.length; i++){
    //     visited.clear();
    //     backTrack([], mock[i],mock[i], 1,visited);
    // }
    backTrack([].concat(mock[0]), mock[0],mock[0], 1,visited);
    console.log(res);
    // console.log(sameOrContainerArea(res[0], res[5]));
    // const clone = cloneDeep(res);
    // const deleteIndex =[];
    // const arr = [];
    // for(let i =0; i < res.length; i++){
    //     const area = res[i];
    //     if(deleteIndex.includes(i)) break;
    //     for(let n = i+1; n < res.length; n++){
    //         const next = res[n]
    //         const result  = sameOrContainerArea(area, res[n]);
    //         if(result.flag){
    //             if(result.toAdd === next){
    //                 deleteIndex.push(n)
    //             }else {
    //                 deleteIndex.push(i);
    //             }
    //         }
    //     }
    // }
    // console.log(deleteIndex);
    // pullAt(res, deleteIndex);
    // console.log(res);
  
    
}
const getLinkLine = (a:lineRef, b:lineRef):boolean => {
    if(a === b) return false;
    // 头部相连
    if(a.sp.x === b.sp.x && a.sp.y === b.sp.y) return true;
    
    // 尾部相连
    if(a.ep.x === b.ep.x && a.ep.y === b.ep.y) return true;
    
    // 头尾相连
     if(a.sp.x === b.ep.x && a.sp.y === b.ep.y) return true;
     
     // 尾头相连
     if(a.ep.x === b.sp.x && a.ep.y === b.sp.y) return true;

     return false;
}
const sameOrContainerArea = (a:lineRef[], b:lineRef[]) => {
    let flag = true;
    let compare:lineRef[], target:lineRef[];
    if(a.length <= b.length){
      compare = a;
      target = b;
    } else {
        compare = b;
        target = a;
    }
    compare.forEach(al =>{
        const l = target.findIndex(bl => {
            return sameLine(al,bl);
        })
        if(l === -1){
          flag = false;  
        }
    })
    return {
        flag,
        toAdd:compare,
        toDelete:target,
    };
}
const sameLine = ( a:lineRef, b:lineRef)=>{
    return a.sp.x === b.sp.x && a.sp.y === b.sp.y && a.ep.x === b.ep.x && a.ep.y === b.ep.y;
}