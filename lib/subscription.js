import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { reloadConfig } from './api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROFILES_DIR = path.join(__dirname, '../profiles')
const CONFIG_PATH = path.join(__dirname, '../config.yaml')

// 确保 profiles 目录存在
if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR)
}

export async function downloadSubscription(url, name) {
  try {
    const res = await axios.get(url, { responseType: 'text' })
    const filePath = path.join(PROFILES_DIR, `${name}.yaml`)
    fs.writeFileSync(filePath, res.data)
    return filePath
  } catch (err) {
    throw new Error(`下载订阅失败: ${err.message}`)
  }
}

export function listProfiles() {
  return fs
    .readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => f.replace('.yaml', ''))
}

export async function useProfile(name) {
  const source = path.join(PROFILES_DIR, `${name}.yaml`)
  if (!fs.existsSync(source)) {
    throw new Error(`配置文件 ${name} 不存在`)
  }
  fs.copyFileSync(source, CONFIG_PATH)

  // 尝试热重载
  try {
    await reloadConfig(CONFIG_PATH)
    console.log('Clash 配置已热重载生效')
  } catch (err) {
    // 忽略错误，可能是 Clash 未运行
    console.log('Clash 未运行或无法连接，配置将在下次启动时生效')
  }
}
