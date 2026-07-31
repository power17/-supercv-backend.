import type { ExtraStyle, RawData, Resume, ResumeModule } from '../types'

export const defaultExtraStyle: ExtraStyle = {
  pageMarginHorizontal: 36,
  pageMarginVertical: 34,
  moduleMargin: 18,
  themeColor: '#2556d8',
  fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  contentFontSize: 14,
  contentLineHeight: 1.7,
}

const moduleItem = (
  titleMajor: string,
  titleMinor: string,
  titleOther: string,
  titleDate: string,
  content: string,
) => ({
  titleEnabled: true,
  titleMajorName: '主标题',
  titleMinorName: '次标题',
  titleOtherName: '其他',
  titleDateName: '时间',
  titleMajor,
  titleMinor,
  titleOther,
  titleDate,
  content,
})

export const defaultRawData: RawData = {
  profile: {
    title: '基本信息',
    name: '王小明',
    photoEnabled: false,
    photoLayout: 2,
    itemLayout: 3,
    enabled: true,
    items: [
      { key: 'telephone', label: '手机', value: '138 0013 8000' },
      { key: 'email', label: '邮箱', value: 'hello@example.com' },
      { key: 'workYears', label: '工作年限', value: '3 年' },
      { key: 'workPlace', label: '工作地点', value: '上海' },
      { key: 'jobIntention', label: '求职意向', value: 'Web 前端工程师' },
      { key: 'github', label: 'GitHub', value: 'github.com/example' },
    ],
  },
  modules: [
    {
      key: 'skill',
      title: '专业技能',
      defaultModule: true,
      enabled: true,
      items: [
        {
          titleEnabled: false,
          titleMajorName: '',
          titleMinorName: '',
          titleOtherName: '',
          titleDateName: '',
          content:
            '熟练掌握 React、TypeScript 与现代前端工程化，熟悉性能优化、组件设计和前后端协作。',
        },
      ],
    },
    {
      key: 'job',
      title: '工作经历',
      defaultModule: true,
      enabled: true,
      items: [
        moduleItem(
          '星海科技有限公司',
          '研发中心',
          'Web 前端工程师',
          '2022.07 - 至今',
          '负责核心业务平台的前端架构与功能迭代；推动组件库落地，将重复开发成本降低 30%；通过分包、缓存和渲染优化，将首屏时间缩短 40%。',
        ),
      ],
    },
    {
      key: 'project',
      title: '项目经历',
      defaultModule: true,
      enabled: true,
      items: [
        moduleItem(
          '企业知识库平台',
          '核心开发',
          'React / TypeScript',
          '2023.10 - 2024.06',
          '从 0 到 1 建设企业知识管理平台，负责权限、检索和在线编辑模块；封装通用数据请求层与异常监控体系，支撑 10+ 业务团队接入。',
        ),
      ],
    },
    {
      key: 'education',
      title: '教育经历',
      defaultModule: true,
      enabled: true,
      items: [
        moduleItem(
          '华东理工大学',
          '计算机科学与技术',
          '本科',
          '2018.09 - 2022.06',
          '主修数据结构、计算机网络、操作系统、数据库系统。',
        ),
      ],
    },
  ],
}

export const newDemoResume = (id = Date.now()): Resume => ({
  id,
  uid: 10001,
  name: '我的专业简历',
  templateId: 1625,
  rawData: structuredClone(defaultRawData),
  extraStyle: { ...defaultExtraStyle },
  isPublic: false,
  updateTime: new Date().toISOString(),
})

const initialResumes: Resume[] = [
  newDemoResume(1001),
  {
    ...newDemoResume(1002),
    name: '前端工程师社招简历',
    extraStyle: { ...defaultExtraStyle, themeColor: '#0f766e' },
    updateTime: '2026-07-28T10:30:00.000Z',
  },
]

const storageKey = 'supercv_demo_resumes'

export function loadDemoResumes(): Resume[] {
  const stored = localStorage.getItem(storageKey)
  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify(initialResumes))
    return initialResumes
  }
  try {
    return JSON.parse(stored) as Resume[]
  } catch {
    return initialResumes
  }
}

export function saveDemoResume(resume: Resume) {
  const resumes = loadDemoResumes()
  const index = resumes.findIndex((item) => item.id === resume.id)
  const next = { ...resume, updateTime: new Date().toISOString() }
  if (index === -1) resumes.unshift(next)
  else resumes[index] = next
  localStorage.setItem(storageKey, JSON.stringify(resumes))
  return next
}

export function deleteDemoResume(id: number) {
  localStorage.setItem(
    storageKey,
    JSON.stringify(loadDemoResumes().filter((item) => item.id !== id)),
  )
}

export function createEmptyModule(key: string, title: string): ResumeModule {
  return {
    key,
    title,
    defaultModule: false,
    enabled: true,
    items: [
      {
        titleEnabled: true,
        titleMajorName: '主标题',
        titleMinorName: '次标题',
        titleOtherName: '其他',
        titleDateName: '时间',
        content: '',
      },
    ],
  }
}

