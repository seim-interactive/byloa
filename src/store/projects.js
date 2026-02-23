import { ref } from 'vue'
import { apiURL, API_ENDPOINTS } from '../lib/config'

export const projects = ref([])
export const isLoading = ref(false)
export const error = ref(null)

export const fetchProjects = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await fetch(apiURL(API_ENDPOINTS.PROJECTS))
    const result = await response.json()
    if (result.success) {
      projects.value = result.data
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

export const addProject = (project) => {
  projects.value.push(project)
}

export const updateProject = (idx, project) => {
  projects.value[idx] = project
}

export const deleteProject = (idx) => {
  projects.value.splice(idx, 1)
}

export const getProjects = () => projects.value
