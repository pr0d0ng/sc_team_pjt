import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { MatchingPost } from '../types/tourism'

const matchingPosts = ref<MatchingPost[]>([])
const storageKey = 'matching-posts'

const loadMatchingPosts = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    matchingPosts.value = JSON.parse(saved)
  }
}

const saveMatchingPosts = () => {
  localStorage.setItem(storageKey, JSON.stringify(matchingPosts.value))
}

const createMatchingPost = (
  gu: string,
  title: string,
  content: string,
  author: string,
  password: string,
  kakaoLink: string,
  interests: string[],
  age: string,
  gender: 'M' | 'F' | 'All'
) => {
  const post: MatchingPost = {
    id: uuidv4(),
    gu,
    title,
    content,
    author,
    password: btoa(password),
    kakaoLink,
    interests,
    age,
    gender,
    createdAt: new Date().toISOString(),
    views: 0,
    likes: 0
  }
  matchingPosts.value.unshift(post)
  saveMatchingPosts()
  return post
}

const deleteMatchingPost = (id: string, password: string) => {
  const index = matchingPosts.value.findIndex(p => p.id === id)
  if (index !== -1 && matchingPosts.value[index].password === btoa(password)) {
    matchingPosts.value.splice(index, 1)
    saveMatchingPosts()
    return true
  }
  return false
}

const getPostsByGu = (gu: string) => {
  return matchingPosts.value.filter(p => p.gu === gu)
}

const likeMatchingPost = (id: string) => {
  const post = matchingPosts.value.find(p => p.id === id)
  if (post) {
    post.likes++
    saveMatchingPosts()
  }
}

export const useMatching = () => ({
  matchingPosts,
  loadMatchingPosts,
  saveMatchingPosts,
  createMatchingPost,
  deleteMatchingPost,
  getPostsByGu,
  likeMatchingPost
})