import axios from 'axios'

const API_BASE = 'http://127.0.0.1:9090'
const API_SECRET = 'your-strong-secret-key' // 实际项目中应该从 config 读取

const headers = {
  Authorization: `Bearer ${API_SECRET}`,
}

export async function getProxies() {
  try {
    const res = await axios.get(`${API_BASE}/proxies`, { headers })
    return res.data.proxies
  } catch (err) {
    throw new Error(`无法连接到 Clash API: ${err.message}`)
  }
}

export async function switchProxy(groupName, proxyName) {
  try {
    await axios.put(
      `${API_BASE}/proxies/${encodeURIComponent(groupName)}`,
      { name: proxyName },
      { headers }
    )
  } catch (err) {
    throw new Error(`切换节点失败: ${err.message}`)
  }
}

export async function getProxyDelay(proxyName) {
  try {
    const res = await axios.get(
      `${API_BASE}/proxies/${encodeURIComponent(proxyName)}/delay`,
      {
        params: {
          timeout: 5000,
          url: 'http://www.gstatic.com/generate_204'
        },
        headers
      }
    )
    return res.data.delay
  } catch (err) {
    return -1 // 超时或失败
  }
}

export async function getConfig() {
  try {
    const res = await axios.get(`${API_BASE}/configs`, { headers })
    return res.data
  } catch (err) {
    throw new Error(`获取配置失败: ${err.message}`)
  }
}

export async function reloadConfig(configPath) {
  try {
    // Clash API: PUT /configs
    // payload: { path: '/absolute/path/to/config.yaml' }
    await axios.put(
      `${API_BASE}/configs?force=true`,
      { path: configPath },
      { headers }
    )
  } catch (err) {
    throw new Error(`重载配置失败: ${err.message}`)
  }
}
