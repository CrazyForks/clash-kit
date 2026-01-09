import { select } from '@inquirer/prompts'
import chalk from 'chalk'
import * as tun from '../tun.js'
import * as sysnet from '../sysnet.js'
import { main as startClashService } from '../../index.js'

export async function setTun(action) {
  try {
    let shouldRestart = false

    if (action === 'on') {
      if (process.platform !== 'win32') {
        const hasPerm = tun.checkTunPermissions()
        const isRoot = process.getuid && process.getuid() === 0

        if (!hasPerm && !isRoot) {
          console.log(chalk.yellow('检测到内核缺少 SUID 权限，当前也非 Root 用户，TUN 模式可能无法启动。'))
          const confirm = await select({
            message: '是否自动授予内核 SUID 权限 (推荐)?',
            choices: [
              { name: '是 (仅需输入一次 sudo 密码)', value: true },
              { name: '否 (之后需要 sudo clash start)', value: false },
            ],
          })
          if (confirm) {
            tun.setupPermissions()
            console.log(chalk.green('权限设置成功！'))
            shouldRestart = true
          }
        }
      }

      console.log('正在开启 TUN 模式...')
      await tun.enableTun()
      sysnet.setDNS(['223.5.5.5', '114.114.114.114'])
      console.log(chalk.green('TUN 模式配置已开启'))

      if (shouldRestart) {
        console.log(chalk.yellow('因为更改了权限，正在重启 Clash 服务以应用更改...'))
        startClashService()
      } else {
        console.log(chalk.gray('提示: 如果 TUN 模式未生效，请尝试运行 "clash start" 重启服务。'))
      }
    } else if (action === 'off') {
      console.log('正在关闭 TUN 模式...')
      await tun.disableTun()
      sysnet.setDNS([]) // 恢复系统默认 DNS
      console.log(chalk.green('TUN 模式配置已关闭'))
      console.log(chalk.gray('配置已热重载。'))
    } else {
      const isEnabled = await tun.isTunEnabled()
      const answer = await select({
        message: `请选择 TUN 模式操作 (当前状态: ${isEnabled ? chalk.green('开启') : chalk.gray('关闭')}):`,
        choices: [
          { name: '开启 TUN 模式', value: 'on' },
          { name: '关闭 TUN 模式', value: 'off' },
        ],
      })
      if (answer === 'on') {
        if (process.platform !== 'win32') {
          const hasPerm = tun.checkTunPermissions()
          const isRoot = process.getuid && process.getuid() === 0
          if (!hasPerm && !isRoot) {
            console.log(chalk.yellow('提示: 建议授予内核 SUID 权限以避免 sudo 启动。'))
            const confirm = await select({
              message: '是否授予权限?',
              choices: [
                { name: '是', value: true },
                { name: '否', value: false },
              ],
            })
            if (confirm) {
              tun.setupPermissions()
              shouldRestart = true
            }
          }
        }
        await tun.enableTun()
        sysnet.setDNS(['223.5.5.5', '114.114.114.114'])
        console.log(chalk.green('TUN 模式配置已开启'))

        if (shouldRestart) {
          console.log(chalk.yellow('正在重启 Clash 服务...'))
          startClashService()
        }
      } else {
        await tun.disableTun()
        sysnet.setDNS([])
        console.log(chalk.green('TUN 模式配置已关闭'))
      }
    }
  } catch (err) {
    console.error(chalk.red(`设置 TUN 模式失败: ${err.message}`))
  }
}
