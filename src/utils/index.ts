
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
import {cloneDeep, uniqWith, isEqual, difference, remove, pullAt, trimEnd } from 'lodash';

const mock = [
    [
        {
          "x": 10,
          "y": 10
        },
        {
          "x": 20,
          "y": 10
        }
    ],
    [
        {
          "x": 20,
          "y": 10
        },
        {
          "x": 30,
          "y": 10
        }
    ],
    [
        {
          "x": 20,
          "y": 10
        },
        {
          "x": 20,
          "y": 20
        }
    ],
    [
        {
          "x": 30,
          "y": 10
        },
        {
          "x": 30,
          "y": 20
        }
    ],
    [
        {
          "x": 20,
          "y": 20
        },
        {
          "x": 30,
          "y": 20
        }
    ],
    [
        {
          "x": 10,
          "y": 20
        },
        {
          "x": 20,
          "y": 20
        }
    ],
    [
        {
          "x": 10,
          "y": 10
        },
        {
          "x": 10,
          "y": 20
        }
    ]
  ] as lineRef[];

  const mockPolygon = [
    [
      {
        "x": 10,
        "y": 10
      },
      {
        "x": 20,
        "y": 10
      }
    ],
    [
      {
        "x": 20,
        "y": 10
      },
      {
        "x": 30,
        "y": 10
      }
    ],
    [
      {
        "x": 30,
        "y": 10
      },
      {
        "x": 30,
        "y": 20
      }
    ],
    [
      {
        "x": 20,
        "y": 20
      },
      {
        "x": 30,
        "y": 20
      }
    ],
    [
      {
        "x": 10,
        "y": 20
      },
      {
        "x": 20,
        "y": 20
      }
    ],
    [
      {
        "x": 10,
        "y": 10
      },
      {
        "x": 10,
        "y": 20
      }
    ]
  ] as lineRef[];

// 1. 首先根据每一个点直接遍历所有图形可形成闭合区域的
// 2. 每个点依次遍历
// 3. 去除重复的
// 4. 去除包含的
const polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
export const getClosePolygon = (lines?: lineRef[])=>{
    const res = [] as lineRef[][];
    const visited = new Set();
    // 回溯算法
    const backTrack = (path:lineRef[], current:lineRef, start:lineRef,hitPosition:IPosition,visited:Set<any>) =>{
        visited.add(current);
        const { x, y} = hitPosition;
        if(current !== start){
            const final = start[0];
            if((current[0].x === final.x && current[0].y === final.y) || (current[1].x=== final.x && current[1].y === final.y)){
                if(!checkDuplicate(path, res)){
                    res.push(path);
                };
                return;
            }
        }
        const _next = mock.filter((item) => getLinkLine(item, hitPosition ) && !visited.has(item));
        if(_next.length === 0) {
            return;
        };
        for(let i =0; i< _next.length; i++){
            const n = _next[i];
            if(n[0].x === x && n[0].y ===y){
                hitPosition = n[1];
            }else {
                hitPosition = n[0];
            }
            const merged = new Set();
            visited.forEach(merged.add, merged);
            backTrack(path.concat([n]), n, start,hitPosition, merged)
        }   
    }
    for(let i = 0; i<mock.length; i++){
        visited.clear();
        backTrack([mock[i]], mock[i],mock[i], mock[i][1], visited);
    }
    const deleteIndex = [];
    // for(let i = 0; i< res.length; i++){
    //     for(let n =0; n< res.length; n++){
    //         if(i !== n && !deleteIndex.includes(i)){
    //             const a = res[i];
    //             const b = res[n];
    //             // 将目前的和剩下的做比较，如果包含剩下的，直接移除
    //             if(checkContains(a,b)){
    //                 deleteIndex.push(i);
    //             }
    //         }
    //     }
    // }
    // console.log('res', res, deleteIndex);
    console.log(judge({x:22, y:10}, res[2]))
    // console.log(checkContains(res[2], res[0]));

}
const getLinkLine = (a:lineRef, b:IPosition):boolean => {
    // 头部
    if(a[0].x === b.x && a[0].y === b.y ) return true;
    // 尾部
    if(a[1].x === b.x && a[1].y === b.y) return true;
    return false;
}
/*
    compare 检查是否包含 target 的所有点
    const polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
*/
const pointInPolygon = (point:IPosition, polygon:lineRef[])=>{
    const x = point.x, y = point.y;
    const vs = polygon.reduce((pre,cur)=>{
        const a = [
            [cur[0].x, cur[0].y],
            [cur[1].x, cur[1].y]
        ]
        pre.push([cur[0].x, cur[0].y]);
        pre.push([cur[1].x, cur[1].y]);
        return pre;

    }, [] as number[][])
    console.log(vs);
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}
const checkContains = (target:lineRef[], compare:lineRef[]) =>{
    let flag = true;
    compare.forEach(p => {  
        if(!flag) return;
        // p 被比较的点都包含在target 中
        if(!judge(p[0], target) || !judge(p[1], target)){
            flag = false;
        }
        
    });
    if(flag) {
        console.log('compare contains target');
        return true;
    }
    console.log('compare not contains target');
    return false;
    
}
// duplicate polygons in res
const checkDuplicate = (compare:lineRef[], exist:lineRef[][]) => {
    const filter = exist.find(polygon => {
        let flag = true;
        polygon.forEach((line:lineRef)=>{
            if(!flag) return;
           flag = hasSameLine(line, compare);
        });
        return flag;
    })
    if(filter) return true;
    return false;
}
// 
const hasSameLine = ( a:lineRef, compare:lineRef[])=>{
    const p1= a[0];
    const p2= a[1];
    const find = compare.find(el => (el[0] === p1 && el[1] === p2) || (el[0] === p1 && el[1] === p2));
    if(find) return true;
    return false;
}


/**
 * @param  dot {{x,y}} 需要判断的点
 * @param  coordinates {{x,y}[]} 多边形点坐标的数组，为保证图形能够闭合，起点和终点必须相等。
 *        比如三角形需要四个点表示，第一个点和最后一个点必须相同。 
 * @param  
 */
 const judge = (dot:IPosition ,vs:lineRef[],noneZeroMode =1) => {
    // 默认启动none zero mode
    noneZeroMode=noneZeroMode||1;
    const x = dot.x,y=dot.y;
    let crossNum = 0;
    // 点在线段的左侧数目
    let leftCount = 0;
    // 点在线段的右侧数目
    let rightCount = 0;
    let continueFlag = true;
    let inLine = false;
    console.log(vs);
    for(let i=0;i<vs.length-1;i++){
       const start = vs[i][0];
       const end = vs[i][1];
        if(!continueFlag) break;
       // 起点、终点斜率不存在的情况
       if(start.x===end.x) {
          // 因为射线向右水平，此处说明不相交
          if(x>start.x) continue;
           
          // 从左侧贯穿
          if((end.y>start.y&&y>=start.y && y<=end.y)){
             leftCount++;
             crossNum++;
          }
          // 从右侧贯穿
          if((end.y<start.y&&y>=end.y && y<=start.y)) {
             rightCount++;
             crossNum++;
          }
          continue;
       }
       // 斜率存在的情况，计算斜率
       const k=(end.y-start.y)/(end.x-start.x);
       const k2 = (y- start.y)/(x-start.x);
       console.log(k, k2);
       if(k === k2){
            const minX = Math.min(start.x, end.x);
            const maxX = Math.max(start.x, end.x);
            console.log(start.x, end.x);
            console.log(end.x, end.y);
            console.log(x, y);
           if(x>=minX && x<=maxX){
            console.log('在线上') 
            return true;
           } else {
            console.log('在延长线上');
           }
           continueFlag = false;
       }
       // 水平不计算
       if(k === 0){
           continue;
       }
       // 交点的x坐标
       const x0 = (y-start.y)/k+start.x;
       // 因为射线向右水平，此处说明不相交
       if(x>x0) continue;
        
       if((end.x>start.x&&x0>=start.x && x0<=end.x)){
          crossNum++;
          if(k>=0) leftCount++;
          else rightCount++;
       }
       if((end.x<start.x&&x0>=end.x && x0<=start.x)) {
          crossNum++;
          if(k>=0) rightCount++;
          else leftCount++;
       }
    }
    if(!continueFlag){
        return true;
    }
     
    return noneZeroMode===1?leftCount-rightCount!==0:crossNum%2===1;
 }

 