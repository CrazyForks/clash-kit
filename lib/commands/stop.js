import ora from 'ora'
import * as sysproxy from '../sysproxy.js'
import * as tun from '../tun.js'
import { killClashProcess } from '../kernel.js'

export async function stop() {
  const spinner = ora('正在停止 Clash 服务...').start()
  try {
    // 停止前先关闭系统代理
    await sysproxy.disableSystemProxy()

    // 检查并关闭 TUN 模式
    const tunEnabled = await tun.isTunEnabled()
    if (tunEnabled) {
      spinner.text = '正在关闭 TUN 模式...'
      await tun.disableTun()
      console.log('TUN 模式已关闭')
    }

    // 使用公共函数停止进程
    spinner.text = '正在停止 Clash 服务...'
    if (killClashProcess()) {
      spinner.succeed('Clash 服务已停止')
    } else {
      spinner.warn('未找到运行中的 Clash 服务，或已停止')
    }
  } catch (err) {
    spinner.warn(`停止服务时出错: ${err.message}`)
  }
}
