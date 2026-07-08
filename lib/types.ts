export interface Tale {
  id: string
  title: string
  summary: string
  fullText: string
  image: string
  likes: number
  publishedDate: string
  readingTime: string
}

export interface Comment {
  id: string
  taleId: string
  userName: string
  text: string
  timestamp: string
}

export interface AuthorInfo {
  name: string
  bio: string
  image: string
  tagline: string
  genreDescription?: string
}
