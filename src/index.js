import AdminDictionary from './admin'
import cloneDeep from 'lodash.clonedeep'
import * as turf from '@turf/helpers'

// 给定 admin code，返回 admin 级别
// 省市县的 admin code 是6位格式，乡镇为8位格式
// 返回值：1 -- 省；2 -- 市；3 -- 县；4 -- 乡镇; 0 -- 全国 -1 -- 无效
export const getAdminType = code => {
  if (code.length == 8) {
    return 4
  }
  if (code === '156') {
    return 0
  }
  // check valid
  if (code.length != 6) {
    return -1
  }
  // 省级行政区的后四位为0
  if (/0000$/.test(code)) {
    return 1
  }
  // 市级行政的后两位为0
  if (/00$/.test(code)) {
    return 2
  }
  return 3
}

const findByName = (name, source) => {
  let result = null
  for(let id in source) {
    if (source[id].name === name) {
      result = cloneDeep(source[id])
      result.id = id
      break
    } else if (source[id].children){
      result = findByName(name, source[id].children)
      if (result) {
        break
      }
    }
  }
  return result
}

const getFeatureData = (value, item) => {
  if (isAdminCode(value)) { // 行政区划编码
    let adminInfo = getAdminDataByCode(String(value))
    if (adminInfo) {
      let{id, name, center} = adminInfo
      return {
        coords: center,
        properties: Object.assign(item, {adname:name, adcode:id})
      }
    }
  } else {
    let adminInfo = getAdminDataByName(value)
    if (adminInfo) {
      let{id, name, center} = adminInfo
      return {
        coords: center,
        properties: Object.assign(item, {adname:name, adcode:id})
      }
    }
  }
  return null
}

const isAdminCode = value => {
  if(Number.isNaN(Number(value))) {
    return false
  }
  return true
}

export const getAdminDataByName = (name, searchArea) => {
  let dictionary = AdminDictionary
  if (searchArea) {
    dictionary = getAdminDataByCode(searchArea).children
  }
  let result = findByName(name, dictionary)
  return result
}

export const getAdminDataByCode = code => {
  let level = getAdminType(code)
  let result = null
  if (level === 1) {
    result = AdminDictionary[code]
  } else if (level === 2) {
    let province = AdminDictionary[code.substr(0, 2) + '0000']
    result = province.children[code] || {}
  } else {
    let province = AdminDictionary[code.substr(0, 2) + '0000']
    if (province.children[code]) {
      result = province.children[code] || {}
    } else {
      let city = province.children[code.substr(0, 4) + '00']
      if (city) {
        result = city.children[code] || {}
      }
    }
  }
  result = cloneDeep(result)
  if (result) {
    result.id === code
  }
  return result
}

export const convert2geojson = (data, options) => {
  let {dataType, searchArea, adminField, adminField1} = options
  let features = []
  data.forEach(item => {
    if (dataType === 'point') {
      let adminValue = item[adminField]
      let fdata = getFeatureData(adminValue, item)
      if (fdata) {
        features.push(turf.point(fdata.coords, fdata.properties))
      }
    } else if (dataType === 'line') {
      let adminValue = item[adminField]
      let adminValue1 = item[adminField1]
      let fdata = getFeatureData(adminValue, item)
      let fdata1 = getFeatureData(adminValue1, item)
      if (fdata && fdata1) {
        features.push(turf.lineString([fdata.coords, fdata1.coords], fdata1.properties))
      }
    }
  })
  return turf.featureCollection(features)
}

export const isMunicipality = (code) => {
  if (!isAdminCode(code)) {
    throw new Error('错误：未指定行政区划代码')
  }
  code = String(code)
  return ['110000', '120000', '310000', '500000'].indexOf(code) !== -1
}