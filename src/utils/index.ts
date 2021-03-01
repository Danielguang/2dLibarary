import { isEqual, uniq, uniqBy, uniqWith, cloneDeep, transform } from "lodash";
import { Polygon } from "pixi.js";

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
// 两个四边形
const mock = [
    [{x:10, y:10}, {x:20, y:10}], // 1
    [{x:20, y:10} ,{x:30, y:10},], // 2
    [{x:30, y:10}, {x:30, y:20 }], // 3
    [{x:30, y:20}, {x:20, y:20 }], // 4
    [{x:20, y:20}, {x:10, y:20 }], // 5
    [{x:10, y:20}, {x:10, y:10}], // 6
    [{x:20, y:20}, {x:20, y:10}], // 7

] as lineRef[];

const mock1 = [
    [{x:10, y:10}, {x:10, y:20}], 
    [{x:10, y:20}, {x:20, y:20}], 
    [{x:20, y:20}, {x:20, y:10}], 
    [{x:20, y:10}, {x:10, y:10 }],
    [{x:10, y:10}, {x:20, y:20 }],
] as lineRef[];


// 1. extract all the pointer from line, get DotRef

export const getMultiPolygon = (lines:lineRef[]) =>{
    const data = lines;
    // 低于两条线不用考虑
    if(data.length<3) return;
    // @ts-ignore
    let pointers = data.flat() as IPosition[];
    const polygons = [] as PointRef[][];
    pointers = uniqWith(pointers,isEqual);
    // 初始化所有点
    const pointerRef = pointers.map(el=>{
        return {
            ...el,
            path:[],
            maxLength:Infinity
        }
    }) as PointRef[];

    // 拿到点和点之间的关系
    const links = getPointerRefByLine(pointers, data);
    // 开始遍历每个边
    for(let i = 0; i< data.length; i++){
        // 获得新的映射关系方便映射
        const sIndex =  getPointIndexInRef(pointerRef, data[i][0]);;
        const eIndex =  getPointIndexInRef(pointerRef, data[i][1]);
        const cloneRef = cloneDeep(pointerRef);
        let currentLink = removeFromLink(links, sIndex, eIndex);
        const [s, u] = initTwoUnit(pointers, sIndex);
        // console.log(currentLink, sIndex, eIndex);
        while(u.length){
            updatePointByRef(s,u, currentLink, pointers, cloneRef);
         }
         const p = cloneRef[eIndex];
         p.path.unshift(sIndex);
         console.log(p.path);
         if(p.path.length >= 3){
            const result = transformToPolygon(p.path, pointerRef);
            if(!checkDuplicate2(polygons,result)){
                polygons.push(result);
            }
         }
    }
    console.log(polygons);    
}
const checkDuplicate2 = (polygons:PointRef[][], p:PointRef[]) =>{
    for(let i = 0; i< polygons.length; i++){
        let pointerFlag = true;
        for(let n =0; n< p.length; n++) {
            const container = polygons[i];
            const pointer = p[n];
            if(container.findIndex(el => el.x=== pointer.x && el.y === pointer.y) == -1){
                pointerFlag = false;
                break;
            }
        }
        if(pointerFlag) {
            // 和任意一个相同，就返回flag = true, 然后跳出循环
            return true;
        };
    }
    return false;

}
const transformToPolygon = (path:number[], pointerRef:PointRef[]):PointRef[]=>{
    const pointers = [];
    for(let i = 0; i< path.length; i++){
        pointers.push(pointerRef[path[i]])
    }
    return pointers;
}
const initTwoUnit= (pointer:IPosition[], sIndex:number)=>{
   const a = [sIndex];
   const b = [];
    for(let i=0; i<pointer.length; i++){
        if(i !== sIndex){
            b.push(i);
        }
    }
    return [a, b]
}
const getPointIndexInRef = (pointers:PointRef[], p:IPosition)=>{
    return pointers.findIndex(el => el.x===p.x && el.y ===p.y);

}
const removeFromLink = (links:number[][], sIndex:number, eIndex:number) =>{
    const cloneLink = cloneDeep(links);
    cloneLink[sIndex] = links[sIndex].filter(el => el != eIndex);
    cloneLink[eIndex] = links[eIndex].filter(el => el != sIndex);
    return cloneLink;

}
const getPointerRefByLine =(pointers:IPosition[], lines:lineRef[])=>{
    const links = [];
    for(let i = 0; i< pointers.length; i++){
        const pointer = pointers[i];
        const linked = [];
        lines.forEach(el => {
            let x:number, y:number;
            if(isEqual(el[0], pointer)){
                x = el[1].x;
                y = el[1].y;
            }

            if(isEqual(el[1], pointer)){
                x = el[0].x;
                y = el[0].y;
            }
            if(x && y){
                const pIndex = pointers.findIndex(el => el.x ===x && el.y ===y);
                linked.push(pIndex);
            }
        });
        links.push(linked)
    }
    return links;
}
// 更新相邻点的位置，且不在s集中
const updatePointByRef = (s:number[], u:number[], links:number[][], pointers:IPosition[],pointerRef:PointRef[] ) =>{
    const sIndex = s[s.length -1];
    let minIndex = -1;
    let lastLength = Infinity;
    const pre = pointerRef[sIndex];
    let preLength = pointerRef[sIndex].maxLength;
    for(let i =0; i< links[sIndex].length; i++){
        const p = links[sIndex][i];
        // 如果s包含直接退出
        if(s.includes(p)) continue;
        const line = [
            {
                x: pointers[sIndex].x,
                y: pointers[sIndex].y,
            },
            {
                x: pointers[p].x,
                y: pointers[p].y,
            }
        ] as lineRef;
        const length = getLineLength(line);
        if(pointerRef[p].maxLength === Infinity){
            pointerRef[p].maxLength =  length;
            pointerRef[p].path =[...pre.path];
            pointerRef[p].path.push(p);
        }
        if(lastLength > length){
            lastLength = length;
            minIndex = p;
        } 
        // 更新每一个点大于的情况
        if(pointerRef[p].maxLength > preLength + length){
            pointerRef[p].path = [...pre.path];
            pointerRef[p].path.push(p);
            pointerRef[p].maxLength = preLength + length;
        }
    }
    // 当循环完成后，将最小的点取出，放入s中
    if(minIndex !== -1){
        s.push(minIndex);
        const index = u.findIndex((el,index) => el === minIndex);
        u.splice(index,1);
    } else {
        // 如果没有，则没有经过遍历。直接拿出下一个再进行比较
        const p = u.shift();
        s.push(p);
    }
}

// 1. 首先根据每一个点直接遍历所有图形可形成闭合区域的
// 2. 每个点依次遍历 done
// 3. 去除包含的
export const getClosePolygon = (lines?: lineRef[])=>{
    getMultiPolygon(lines);
    return;
    const res = [] as lineRef[][];
    const visited = new Set();
    const data = mock1;
    if(!data) return[];
    console.log('data', data);
    // console.log(getAngleByCos(data[0], data[1]))
    // console.log(getAngleByCos(data[1], data[2]))
    // console.log(getAngleByCos(data[1], data[4]))
    // return;
   
    // 回溯算法
    // path:当前记录的路径总和
    // current 当前的路径
    // start: 开始线
    // hitPosition: 
    // startPointer；起始点位置
    const backTrack = (path:lineRef[], current:lineRef, start:lineRef,hitPosition:IPosition,visited:Set<any>) =>{
        visited.add(current);
        const { x, y } = hitPosition;
        if(current !== start){
            const final = start[1];
            if((current[0].x === final.x && current[0].y === final.y) || (current[1].x=== final.x && current[1].y === final.y)){
                if(!checkDuplicate(path, res)){
                    res.push(path);
                };
                return true;
            }
        }
        const _next = data.filter((item) => getLinkLine(item, hitPosition ) && !visited.has(item));
        if(_next.length === 0) {
            return false;
        };
        if(_next.length >=2){
            _next.sort((a, b) => {
                // cos 越小，越大
                const a1 = getAngleByCos(a, current);
                const b1 = getAngleByCos(b, current);
                return a1 - b1;
            })
        }
        for(let i =0; i< _next.length; i++){
            const n = _next[i];
            if(n[0].x === x && n[0].y ===y){
                hitPosition = n[1];
            }else {
                hitPosition = n[0];
            }
            const merged = new Set();
            visited.forEach(merged.add, merged);
            const flag = backTrack(path.concat([n]), n, start, hitPosition, merged);
        }   
    }
     /// backTrack([mock[2]], mock[2], mock[2], getStartLine(mock[2]), visited, getStartLine(mock[2]));
     console.log(res);
     // return;
    for(let i = 0; i < data.length; i++){
        visited.clear();
        backTrack([data[i]], data[i], data[i], data[i][0], visited);
    }
    console.log(res);
    // 
    return res;
}
const getLinkLine = (a:lineRef, b:IPosition):boolean => {
    // 头部
    if(a[0].x === b.x && a[0].y === b.y ) return true;
    // 尾部
    if(a[1].x === b.x && a[1].y === b.y) return true;
    
    return false;
}
/**
 * line: 当前的直线
 * pivot: 基准的直线
 * cross: 当前交叉的点
 */
const getAngle = (line:lineRef, pivot:lineRef, clockwise = true)=> {
    const cross = getClosePointer(line, pivot);
    console.log(cross);
    const p1 = getNextPosition(line, cross);
    const x1 = p1.x - cross.x;
    const y1 = p1.y - cross.y;
    
    const p2 = getNextPosition(pivot, cross);
    const x2 = p2.x - cross.x;
    const y2 = p2.y - cross.y;
    const dot = x1 * x2 + y1 * y2
    const det = x1 * y2 - y1 * x2
    const angle = Math.atan2(det, dot) / Math.PI * 180;
    const result = (angle + 360) % 360;
    return (result - 180> 0) ? result -180:result
}
const getClosePointer = (line1:lineRef, line2:lineRef)=>{
    if(samePosition(line1[0], line2[0])) return line2[0];
    if(samePosition(line1[1], line2[0])) return line2[0];
    if(samePosition(line1[0], line2[1])) return line2[1];
    if(samePosition(line1[1], line2[1])) return line2[1];
}

const samePosition = (a:IPosition, b:IPosition) => {
    if(a.x === b.x && a.y === b.y) return true;
    return false;
}

// 决定起始
// 顺时针往下
const getStartLine = (line:lineRef)=>{
    if(line[0].x === line[1].x) {
        return line[0].y > line[1].y?line[1]:line[0];
    }
    return line[0].x > line[1].x?line[0]:line[1];   
    
}

const getNextPosition = (line:lineRef, cross:IPosition):IPosition=>{
    if(line[0].x === cross.x && line[0].y === cross.y){
        return line[1];
    }
    return line[0];

}
const getLineLength = (line:lineRef) => {
    return Math.sqrt(Math.pow((line[0].x - line[1].x),2) + Math.pow((line[0].y - line[1].y),2));
}
const getOutPointer = (line:lineRef, c:IPosition) => {
    if(line[0].x === c.x && line[1].y === c.y) return line[1];
    return line[0];
}

const getAngleByCos = (a:lineRef, b:lineRef) =>{
    const cross = getClosePointer(a, b);// 获得两个线段的焦点
    if(cross){
        let c1, c2;
        if(samePosition(a[0], cross)){
                c1 = a[1];
        } else {
            c1 = a[0]
        }
        if(samePosition(b[0], cross)){
            c2 = b[1];
        } else {
            c2 = b[0]
        }
        const c = [
            {
                x:c1.x,
                y:c1.y
            },
            {
                x:c2.x,
                y:c2.y
            }
        ] as lineRef;
        const aLen = getLineLength(a);
        const bLen = getLineLength(b);
        const cLen = getLineLength(c);
        const angle = Math.acos((Math.pow(aLen,2) + Math.pow(bLen,2)  - Math.pow(cLen,2))/ (2* aLen * bLen)) / Math.PI * 180;
        const result = (angle + 360) % 360;
        return result;
    }
}
const checkContains = (target:lineRef[], compare:lineRef[]) =>{
    let flag = true;
    compare.forEach(p => {  
        // p 被比较的点都包含在target 中
        if(!pointInPolygon(p[0], target) || !pointInPolygon(p[1], target)){
            console.log(p[0], p[1], target);
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
 * @description 默认射线为水平向右的射线
 * @todo 考虑五角星的情况，需要再次·改进
 */
 const pointInPolygon = (dot:IPosition ,vs:lineRef[]) => {
    // 默认启动none zero mode
    const x = dot.x,y=dot.y;
    let crossNum = 0;
    // 点在线段的左侧数目
    let leftCount = 0;
    // 点在线段的右侧数目
    let rightCount = 0;
    console.log(vs);
    for(let i=0;i<vs.length;i++){
        // x较大的为end,否则为start
      const start = vs[i][0];
      const end = vs[i][1];
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const maxY = Math.max(start.y, end.y);
      const minY = Math.min(start.y, end.y);
       // 起点、终点斜率不存在的情况
       if(start.x===end.x) {
          // 因为射线向右水平，此处说明不相交
          // 如果x>maxX 肯定没有焦点
          if(x>maxX) continue;
          // 如果y的区间在maxY 和 minY 之外，肯定无交点
          if(y>maxY || y<minY) continue;
          crossNum++;
          continue;
       }
       // 斜率存在的情况，计算斜率
       const k=(end.y-start.y)/(end.x-start.x);
       // 因为我们是水平向右的射线
       // 所以当k =0 的时候，只需要判断点在不在线上即可
       if(k === 0){
        if(x>=minX && x<=maxX && y<=maxY && y>= minY){
            console.log('点在线上') 
            return true;
        }
        continue;
       }
       if((x === start.x && y=== start.y) || (x === end.x && y=== end.y)){
          console.log('点在线上') 
          return true;
       }
       const k2 = (y - start.y)/(x- start.x);
       /*
        k1 = (p2.y - p1.y)/(p2.x - p1.x)
        k2 = (q.y - p1.y)/(q.x - p1.x)
        */
       if(Math.abs(k - k2)<0.1 && x >= minX && x<=maxX &&y <=maxY && y >=minY){
        return true;
       }
        // 因为我们是水平向右的射线
       // 只要y在区间内，且x
       const x0 = (y-start.y)/k + start.x;
       if((x0>=start.x && x0<=end.x && y<=maxY && y>=minY)){
            crossNum++;
        }
    }
    const flag = crossNum%2===1; 
    return flag;
 }

 