import { select } from '@inquirer/prompts'
import * as sysproxy from '../sysproxy.js'

export async function setSysProxy(action) {
  if (action === 'on') {
    await sysproxy.enableSystemProxy()
  } else if (action === 'off') {
    await sysproxy.disableSystemProxy()
  } else {
    // 交互式选择
    const answer = await select({
      message: '请选择系统代理操作:',
      choices: [
        { name: '开启系统代理', value: 'on' },
        { name: '关闭系统代理', value: 'off' },
      ],
    })
    if (answer === 'on') {
      await sysproxy.enableSystemProxy()
    } else {
      await sysproxy.disableSystemProxy()
    }
  }
}
