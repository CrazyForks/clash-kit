import { select } from '@inquirer/prompts'
import * as api from '../api.js'

export async function proxy() {
  try {
    const proxies = await api.getProxies()
    // 通常我们只关心 Proxy 组或者 Selector 类型的组
    const groups = Object.values(proxies).filter(p => p.type === 'Selector')

    if (groups.length === 0) {
      console.log('没有找到可选的节点组')
      return
    }

    // 选择组
    const groupName = await select({
      message: '请选择节点组:',
      choices: groups.map(g => ({ name: g.name, value: g.name })),
    })

    const group = proxies[groupName]

    // 选择节点
    const proxyName = await select({
      message: `[${groupName}] 当前: ${group.now}, 请选择节点:`,
      choices: group.all.map(n => ({ name: n, value: n })),
    })

    await api.switchProxy(groupName, proxyName)
    console.log(`已切换 ${groupName} -> ${proxyName}`)
  } catch (err) {
    console.error(err.message)
  }
}
