// 관광지/시설 기본 정보
export interface Attraction {
  contentid: string
  contenttypeid: string
  title: string
  addr1: string
  addr2: string
  tel: string
  firstimage: string
  firstimage2: string
  mapx: string
  mapy: string
  zipcode: string
}

// 사용자 리뷰
export interface Review {
  id: string
  contentid: string
  userId: string
  userName: string
  rating: number // 1-5
  title: string
  content: string
  createdAt: string
  updatedAt: string
  likes: number
}

// 댓글
export interface Comment {
  id: string
  reviewId: string
  userId: string
  userName: string
  content: string
  createdAt: string
  likes: number
}

// 북마크/찜
export interface Bookmark {
  contentid: string
  title: string
  attractionData: Attraction
  bookmarkedAt: string
}

// 사용자 프로필
export interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  bookmarks: Bookmark[]
  reviews: Review[]
  comments: Comment[]
  role: 'user' | 'admin'
}

// 검색 필터
export interface SearchFilter {
  query: string
  category: string
  sortBy: 'recent' | 'rating' | 'views'
  minRating: number
}

// ============ 커뮤니티 관련 ============

export interface Post {
  id: string
  boardType: 'free' | 'attraction' // 자유게시판 또는 명소추천
  title: string
  content: string
  author: string
  password: string // 4자리 숫자
  location?: string // 명소명
  locationLink?: string // contentid 링크
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  comments: PostComment[]
}

export interface PostComment {
  id: string
  postId: string
  author: string
  password: string
  content: string
  createdAt: string
  likes: number
}

// ============ 매칭 관련 ============

export interface MatchingPost {
  id: string
  gu: string // 서울 구명
  title: string
  content: string
  author: string
  password: string
  kakaoLink: string // 오픈톡 링크
  interests: string[] // 관심사
  age: string // 20대, 30대 등
  gender: 'M' | 'F' | 'All'
  createdAt: string
  views: number
  likes: number
}

// ============ 축제 데이터 ============

export interface Festival {
  contentid: string
  title: string
  addr1: string
  addr2: string
  eventStartDate: string
  eventEndDate: string
  firstimage: string
  tel: string
  mapx: string
  mapy: string
  overview?: string
}

// ============ 구 정보 ============

export interface GuData {
  name: string
  code: string
  mapx: number
  mapy: number
}