export type ApiResponse<T> = {
  code: number
  message?: string
  msg?: string
  data: T
}

export type AuthToken = {
  uid: number
  token: string
  expireTime?: string
  demo?: boolean
}

export type KeyValuePair = {
  key: string
  label: string
  value?: string
  placeholder?: string
  valueType?: string
}

export type Profile = {
  title: string
  name?: string
  photoUrl?: string
  photoEnabled: boolean
  photoLayout: number
  itemLayout: number
  enabled: boolean
  items: KeyValuePair[]
}

export type ResumeModuleItem = {
  titleEnabled: boolean
  titleMajorName: string
  titleMinorName: string
  titleOtherName: string
  titleDateName: string
  titleMajor?: string
  titleMinor?: string
  titleOther?: string
  titleDate?: string
  contentHint?: string
  content?: string
}

export type ResumeModule = {
  key: string
  title: string
  defaultModule: boolean
  enabled: boolean
  items: ResumeModuleItem[]
}

export type RawData = {
  profile: Profile
  modules: ResumeModule[]
}

export type ExtraStyle = {
  pageMarginHorizontal: number
  pageMarginVertical: number
  moduleMargin: number
  themeColor: string
  fontFamily: string
  contentFontSize: number
  contentLineHeight: number
}

export type Resume = {
  id: number
  uid: number
  name: string
  templateId: number
  fileUrl?: string
  rawData?: RawData
  extraStyle?: ExtraStyle
  public?: boolean
  isPublic?: boolean
  createTime?: string
  updateTime?: string
}

export type Template = {
  id: number
  name: string
  pageFrame?: string
  pageStyle?: string
  thumbnailUrl?: string
  demoResumeId?: number
  public?: boolean
  isPublic?: boolean
}
