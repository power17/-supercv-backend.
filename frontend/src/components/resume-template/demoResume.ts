import { defaultExtraStyle, defaultRawData } from '../../lib/demo'
import type { Resume, ResumeModuleItem } from '../../types'

function item(
  titleMajor: string,
  titleMinor: string,
  titleOther: string,
  titleDate: string,
  content: string,
): ResumeModuleItem {
  return {
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
  }
}

export function createTemplateDemoResume(): Resume {
  const rawData = structuredClone(defaultRawData)
  rawData.profile.name = '林子涵'
  rawData.profile.photoEnabled = true
  rawData.profile.photoUrl = 'https://static.supercv.cn/image/default_profile_photo.png'
  rawData.profile.items = rawData.profile.items.map((profileItem) => {
    const values: Record<string, string> = {
      telephone: '138 0013 8000',
      email: 'linzihan@example.com',
      workYears: '5 年',
      workPlace: '上海',
      jobIntention: '高级前端工程师',
      github: 'github.com/linzihan',
    }
    return { ...profileItem, value: values[profileItem.key] ?? profileItem.value }
  })

  const skill = rawData.modules.find((module) => module.key === 'skill')
  if (skill) {
    skill.items = [{
      titleEnabled: false,
      titleMajorName: '', titleMinorName: '', titleOtherName: '', titleDateName: '',
      content: '• 熟练掌握 React、TypeScript、Next.js，具备大型 Web 应用架构设计经验\n• 熟悉 Vue、Redux、Zustand、Tailwind CSS 与常用前端工程化工具\n• 熟练使用 Vite、Webpack、ESLint、Vitest，能够建设标准化研发流程\n• 熟悉性能优化、微前端、组件库建设、可视化及复杂交互开发\n• 掌握 Node.js、Java、MySQL、Redis，具备完整的前后端协作经验\n• 熟悉 Docker、GitLab CI/CD，能够独立完成应用构建、发布与监控',
    }]
  }

  const job = rawData.modules.find((module) => module.key === 'job')
  if (job) {
    job.items = [
      item('星河科技有限公司', '平台研发部', '高级前端工程师', '2022.06 - 至今', '负责企业级智能协作平台的前端架构和核心功能建设；推动组件库与工程规范落地，将需求交付效率提升 35%；通过分包、缓存和渲染优化，将首屏时间缩短 42%。'),
      item('远景网络有限公司', '产品技术部', '前端工程师', '2019.07 - 2022.05', '参与数据分析平台从 0 到 1 的建设，负责权限、报表和可视化模块；封装通用业务组件 30 余个，支撑多个产品团队快速迭代。'),
    ]
  }

  const project = rawData.modules.find((module) => module.key === 'project')
  if (project) {
    project.items = [
      item('企业知识库平台', '核心开发', 'React / TypeScript', '2023.10 - 2024.08', '建设企业知识管理、智能检索和在线协作能力；负责编辑器、权限模型及异常监控体系，平台服务 10 余个业务团队。'),
      item('数据运营分析平台', '项目负责人', 'React / ECharts', '2022.08 - 2023.09', '设计可配置数据看板和指标管理系统，支持复杂图表联动与大数据量渲染，帮助运营团队将周报制作时间减少 70%。'),
    ]
  }

  const education = rawData.modules.find((module) => module.key === 'education')
  if (education) {
    education.items = [
      item('华东理工大学', '计算机科学与技术', '本科', '2015.09 - 2019.06', '主修数据结构、操作系统、计算机网络、数据库系统；获得校级优秀毕业生和两次一等奖学金。'),
      item('上海市第二中学', '理科实验班', '高中', '2012.09 - 2015.06', '担任学习委员，获得校级优秀学生干部，参与信息学竞赛并获得市级二等奖。'),
    ]
  }

  rawData.modules.push(
    {
      key: 'certification',
      title: '证书与荣誉',
      defaultModule: false,
      enabled: true,
      items: [
        item('PMP 项目管理认证', 'PMI', '', '2023.05', '系统掌握项目范围、进度、成本、风险及团队协作管理方法。'),
        item('优秀技术贡献奖', '星河科技', '', '2022.12', '因推动前端工程体系升级和核心性能专项优化获得年度技术奖项。'),
      ],
    },
    {
      key: 'assessment',
      title: '个人评价',
      defaultModule: false,
      enabled: true,
      items: [{
        titleEnabled: false,
        titleMajorName: '', titleMinorName: '', titleOtherName: '', titleDateName: '',
        content: '具备良好的产品意识、系统思维和沟通协作能力，能够快速理解业务目标并将复杂问题拆解为可执行方案；持续关注前端技术发展，乐于分享并推动团队共同成长。',
      }],
    },
  )

  return {
    id: 0,
    uid: 0,
    name: '模板示例简历',
    templateId: 0,
    rawData,
    extraStyle: { ...defaultExtraStyle, contentFontSize: 12, contentLineHeight: 1.42, moduleMargin: 14 },
    isPublic: false,
  }
}
