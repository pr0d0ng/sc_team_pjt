import type { GuData } from '../types/tourism'

export const seoulGuData: GuData[] = [
  { name: '강남구', code: 'GN', mapx: 127.0276, mapy: 37.4979 },
  { name: '강동구', code: 'GD', mapx: 127.1234, mapy: 37.5286 },
  { name: '강북구', code: 'GB', mapx: 127.0259, mapy: 37.6393 },
  { name: '강서구', code: 'GS', mapx: 126.8495, mapy: 37.5510 },
  { name: '관악구', code: 'GA', mapx: 126.9514, mapy: 37.4816 },
  { name: '광진구', code: 'GJ', mapx: 127.0842, mapy: 37.5379 },
  { name: '구로구', code: 'GR', mapx: 126.8518, mapy: 37.4954 },
  { name: '금천구', code: 'GC', mapx: 126.8931, mapy: 37.4588 },
  { name: '노원구', code: 'NW', mapx: 127.0756, mapy: 37.6554 },
  { name: '도봉구', code: 'DB', mapx: 127.0319, mapy: 37.6663 },
  { name: '동대문구', code: 'DDM', mapx: 127.0396, mapy: 37.5743 },
  { name: '동작구', code: 'DJ', mapx: 126.9627, mapy: 37.5106 },
  { name: '마포구', code: 'MP', mapx: 126.9021, mapy: 37.5635 },
  { name: '서대문구', code: 'SDM', mapx: 126.9368, mapy: 37.5794 },
  { name: '서초구', code: 'SC', mapx: 127.0329, mapy: 37.4863 },
  { name: '성동구', code: 'SD', mapx: 127.0368, mapy: 37.5487 },
  { name: '성북구', code: 'SB', mapx: 127.0171, mapy: 37.5893 },
  { name: '송파구', code: 'SP', mapx: 127.1086, mapy: 37.5145 },
  { name: '양천구', code: 'YC', mapx: 126.8714, mapy: 37.5161 },
  { name: '영등포구', code: 'YDP', mapx: 126.8941, mapy: 37.5248 },
  { name: '용산구', code: 'YS', mapx: 126.9746, mapy: 37.5326 },
  { name: '은평구', code: 'EP', mapx: 126.9282, mapy: 37.6024 },
  { name: '종로구', code: 'JR', mapx: 126.9909, mapy: 37.5730 },
  { name: '중구', code: 'JG', mapx: 126.9979, mapy: 37.5640 },
  { name: '중랑구', code: 'JR2', mapx: 127.0929, mapy: 37.5867 }
]

export const getGuByName = (name: string): GuData | undefined => {
  return seoulGuData.find(gu => gu.name === name)
}

export const getGuByCode = (code: string): GuData | undefined => {
  return seoulGuData.find(gu => gu.code === code)
}