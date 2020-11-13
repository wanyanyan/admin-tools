该工具主要用于将行政区划属性数据进行空间化，也可以根据行政区划名称或代码查询该行政区的中心点位置和下一级行政区信息。

## 使用方法

安装
```bash
npm install admin-tools
```

```js
import * as AdminTools from 'admin-tools'

let adminCode = '420000'
AdminTools.getAdminDataByCode(adminCode)
// {name:'湖北省', center: [114.298, 30.584], children: { ... }}
```

## API

### `.getAdminDataByName(name: String, searchArea: String)`

参数 | 类型 | 是否必须 | 说明
--- | --- | --- | ---
name | String | 是 | 行政区划名称，例如“武汉市”
searchArea | String | 否 | 搜索区域，默认会在全国范围内进行匹配，为避免行政区划名称重名导致匹配错误，可以指定匹配范围

根据名称获取行政区划信息

### `.getAdminDataByCode(code: String)`

参数 | 类型 | 是否必须 | 说明
--- | --- | --- | ---
code | String | 是 | 行政区划代码，例如“420100”

根据行政区划代码获取行政区划信息

### `.convert2geojson(data: Array, options: Object)`

参数 | 类型 | 是否必须 | 说明
--- | --- | --- | ---
data | Array | 是 | 需要转换的数据
options | Object | 是 | 转换参数

将给定的属性数据，按行政区划字段进行空间化，转为geojson数据

options选项：

- `dataType`， 数据类型，可以是点（`point`）或者线段（`line`）
- `adminField`，行政区划字段，该字段可以是行政区划名称，也可以是行政区划代码，会自动识别
- `adminField1`， 行政区划字段，当数据类型为“线段”时，`adminField`为线段起点，`adminField1`为线段终点
- `searchArea`，匹配范围，仅当行政区划字段为名称的时候有效，用于手动指定匹配范围

例如：

```js
let data = [
  {
    name: '武汉市',
    gdp: 1000, // 纯属虚构
    pop: 3000  // 纯属虚构
  },
  {
    name: '黄冈市',
    gdp: 800, // 纯属虚构
    pop: 1000  // 纯属虚构
  }
]

convert2geojson(data, {
  dataType: 'point',
  adminField: 'name',
  searchArea: '420000'  // 在湖北省范围内匹配
})
/* => {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        adname: '武汉市',
        adcode: '420100',
        name: '武汉市',
        gdp: 1000,
        pop: 3000
      },
      geometry: {
        type: 'Point',
        coordinates: [114.298, 30.584]
      }
    },
    {
      type: 'Feature',
      properties: {
        adname: '黄冈市',
        adcode: '421100',
        name: '黄冈市',
        gdp: 800,
        pop: 1000
      },
      geometry: {
        type: 'Point',
        coordinates: [114.879, 30.447]
      }
    }
  ]
}
*/
```
