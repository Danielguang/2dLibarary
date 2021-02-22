### 2D libary 用于房型图设计，初搞

#### 安装

``` javascript
    npm install -g parcel-bundler
    npm install
    parcel index.html
```

### 点 Dot
- 点一般是{x, y} 表示
``` javascript
    const dot = new Dot(x, y);

```
### 线 Line
- 线一般是两个点组成
``` javascript
    const line = new Line([
        {x, y},
        {x, y},
    ])
```

### 面
- 多个围成的点组成面
``` javascript
    const line = new Polygon([
        {x, y},
        {x, y},
    ], [
        {x, y},
        {x, y}
    ])
```

