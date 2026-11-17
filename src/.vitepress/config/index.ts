import { defineConfig } from 'vitepress'
import { en } from './en'
import { ja } from './ja'
import { shared } from './shared'
import { zh } from './zh'

export default defineConfig({
  ...shared,
  locales: {
    root: { label: '简体中文', ...zh },
    en: { label: 'English', link: '/en/', ...en },
    ja: { label: '日本語', link: '/ja/', ...ja },
  },
})
