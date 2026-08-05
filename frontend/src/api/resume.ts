import {
  deleteDemoResume,
  loadDemoResumes,
  newDemoResume,
  saveDemoResume,
} from '../lib/demo'
import type { AuthToken, Resume, Template } from '../types'
import { formBody, request } from './client'

export async function listResumes(auth: AuthToken): Promise<Resume[]> {
  if (auth.demo) return loadDemoResumes()
  const data = await request<{ count: number; resumes: Resume[] }>(
    '/v1/resume/list/mine?page_no=1&page_size=50',
    {},
    auth,
  )
  return data.resumes
}

export async function getResume(auth: AuthToken, id: number): Promise<Resume> {
  if (auth.demo) {
    const resume = loadDemoResumes().find((item) => item.id === id)
    if (!resume) throw new Error('简历不存在')
    return resume
  }
  return request<Resume>(`/v1/resume/detail?resume_id=${id}`, {}, auth)
}

export async function createResume(
  auth: AuthToken,
  name: string,
  templateId = 1625,
  template?: Template,
): Promise<Resume> {
  if (auth.demo) {
    return saveDemoResume({ ...newDemoResume(), name, templateId, template })
  }
  return request<Resume>(
    '/v1/resume/create-blank-resume',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({ template_id: templateId, resume_name: name }),
    },
    auth,
  )
}

export async function updateResume(auth: AuthToken, resume: Resume): Promise<Resume> {
  if (auth.demo) return saveDemoResume(resume)
  await request<boolean>(
    '/v1/resume/update',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({
        resume_id: resume.id,
        name: resume.name,
        template_id: resume.templateId,
        raw_data_json: JSON.stringify(resume.rawData),
        extra_style_json: JSON.stringify(resume.extraStyle),
        is_public: resume.isPublic ?? resume.public ?? false,
      }),
    },
    auth,
  )
  return resume
}

export async function removeResume(auth: AuthToken, id: number) {
  if (auth.demo) {
    deleteDemoResume(id)
    return
  }
  await request<void>(
    '/v1/resume/delete',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({ resume_id: id }),
    },
    auth,
  )
}

export async function copyResume(auth: AuthToken, resume: Resume): Promise<Resume> {
  const copyName = `${resume.name} - 副本`
  if (auth.demo) {
    return saveDemoResume({
      ...structuredClone(resume),
      id: Date.now(),
      name: copyName,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    })
  }
  return request<Resume>(
    '/v1/resume/create-from-copying',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({ resume_id: resume.id, resume_name: copyName }),
    },
    auth,
  )
}

export function listTemplates(pageNo = 1, pageSize = 12) {
  return request<{ count: number; templates: Template[] }>(
    `/v1/resume/template/list?page_no=${pageNo}&page_size=${pageSize}&is_public=true`,
  )
}

export function optimizeResumeContent(
  auth: AuthToken,
  moduleName: string,
  content: string,
) {
  return request<string>(
    '/v1/resume/optimize/module-item-content',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({ module_name: moduleName, content }),
    },
    auth,
  )
}
