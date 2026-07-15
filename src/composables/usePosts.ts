import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Post, PostComment } from '../types/tourism'

const posts = ref<Post[]>([])
const storageKey = 'community-posts'

const loadPosts = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    posts.value = JSON.parse(saved)
  }
}

const savePosts = () => {
  localStorage.setItem(storageKey, JSON.stringify(posts.value))
}

const createPost = (
  boardType: 'free' | 'attraction',
  title: string,
  content: string,
  author: string,
  password: string,
  location?: string,
  locationLink?: string
) => {
  const post: Post = {
    id: uuidv4(),
    boardType,
    title,
    content,
    author,
    password: btoa(password), // 간단한 인코딩
    location,
    locationLink,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: []
  }
  posts.value.unshift(post)
  savePosts()
  return post
}

const updatePost = (
  id: string,
  password: string,
  updates: { title?: string; content?: string }
) => {
  const post = posts.value.find(p => p.id === id)
  if (post && post.password === btoa(password)) {
    post.title = updates.title || post.title
    post.content = updates.content || post.content
    post.updatedAt = new Date().toISOString()
    savePosts()
    return true
  }
  return false
}

const deletePost = (id: string, password: string) => {
  const index = posts.value.findIndex(p => p.id === id)
  if (index !== -1 && posts.value[index].password === btoa(password)) {
    posts.value.splice(index, 1)
    savePosts()
    return true
  }
  return false
}

const getPostsByBoard = (boardType: 'free' | 'attraction') => {
  return posts.value.filter(p => p.boardType === boardType)
}

const addComment = (
  postId: string,
  author: string,
  password: string,
  content: string
) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const comment: PostComment = {
      id: uuidv4(),
      postId,
      author,
      password: btoa(password),
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    }
    post.comments.push(comment)
    savePosts()
    return comment
  }
  return null
}

const deleteComment = (postId: string, commentId: string, password: string) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const index = post.comments.findIndex(c => c.id === commentId)
    if (index !== -1 && post.comments[index].password === btoa(password)) {
      post.comments.splice(index, 1)
      savePosts()
      return true
    }
  }
  return false
}

const incrementViews = (postId: string) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.views++
    savePosts()
  }
}

const likePost = (postId: string) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.likes++
    savePosts()
  }
}

export const usePosts = () => ({
  posts,
  loadPosts,
  savePosts,
  createPost,
  updatePost,
  deletePost,
  getPostsByBoard,
  addComment,
  deleteComment,
  incrementViews,
  likePost
})