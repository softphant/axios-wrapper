import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

enum PROBLEM_CODE {
    CLIENT_ERROR = 'CLIENT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    CANCEL_ERROR = 'CANCEL_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export interface ApiErrorResponse<T> {
    ok: false
    problem: PROBLEM_CODE
    originalError: AxiosError

    data?: T
    status?: number
    headers?: any
    config?: AxiosRequestConfig
    duration?: number
}

export interface ApiOkResponse<T> {
    ok: true
    problem: null
    originalError: null

    data: T
    status?: number
    headers?: any
    config?: AxiosRequestConfig
    duration?: number
}

export interface ApiConfig {
    url: string
    timeout?: number
    headers?: Record<string, any>
}

export type ApiResponse<T> = ApiErrorResponse<T> | ApiOkResponse<T>

export const createApi = (config: ApiConfig) => {
    const api = axios.create({
        baseURL: config.url,
        timeout: config.timeout,
        headers: config.headers,
    })
    api.interceptors.response.use(interceptor, responseError)

    return api
}

export const getProblemFromStatus = (status: number | undefined): PROBLEM_CODE | null | undefined => {
    if (!status) return PROBLEM_CODE.UNKNOWN_ERROR
    if (status >= 200 && status < 300) return null
    if (status >= 400 && status < 500) return PROBLEM_CODE.CLIENT_ERROR
    if (status >= 500) return PROBLEM_CODE.SERVER_ERROR
    return PROBLEM_CODE.UNKNOWN_ERROR
}

export const getProblemFromError = (error: AxiosError) => {
    if (error.message === 'Network Error') return PROBLEM_CODE.NETWORK_ERROR
    if (axios.isCancel(error)) return PROBLEM_CODE.CANCEL_ERROR
    if (!error.code) return getProblemFromStatus(error.response?.status)
    if (error.code === 'ECONNABORTED') return PROBLEM_CODE.TIMEOUT_ERROR
    return PROBLEM_CODE.UNKNOWN_ERROR
}

const interceptor = (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return { ...response, data: response.data ?? {}, ok: true }
}

/* Typescript hint */
const isAxiosError = (error: any): error is AxiosError => {
    if ((error as AxiosError).isAxiosError) return true
    return false
}

const responseError = (e: any): Partial<ApiErrorResponse<any>> => {
    if (isAxiosError(e)) {
        return {
            ...e.response,
            ok: false,
            status: e.response?.status,
            config: e.config as any,
            originalError: e as any,
            problem: getProblemFromStatus(e.response?.status) ?? undefined,
        }
    }
    throw e
}
