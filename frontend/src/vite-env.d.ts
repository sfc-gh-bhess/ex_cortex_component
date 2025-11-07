/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SHOW_TEXT?: string
  readonly VITE_SHOW_CHARTS?: string
  readonly VITE_SHOW_TABLES?: string
  readonly VITE_SHOW_THINKING?: string
  readonly VITE_SHOW_TOOL_USE?: string
  readonly VITE_SHOW_STATUS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

