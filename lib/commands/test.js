import chalk from 'chalk'
import * as api from '../api.js'

export async function test() {
  try {
    const proxies = await api.getProxies()
    // 默认测速 Proxy 组的所有节点
    const group = proxies['Proxy'] || Object.values(proxies).find(p => p.type === 'Selector')

    if (!group) {
      console.error('找不到 Proxy 组')
      return
    }

    console.log(`\n当前测速目标组: [${group.name}]`)
    console.log(`包含节点数: ${group.all.length}`)
    console.log('注意: 测速针对的是当前 Clash 正在运行的配置。')
    console.log('如果刚切换了订阅，请确保看到"配置已热重载生效"提示，或手动重启 clash start。\n')

    const results = []
    const concurrency = 10
    const queue = [...group.all]
    const total = group.all.length
    let completed = 0

    console.log(chalk.gray(`准备并发测速 (并发数: ${concurrency})...`))

    const worker = async () => {
      while (queue.length > 0) {
        const name = queue.shift()
        if (!name) break

        try {
          const delay = await api.getProxyDelay(name)
          completed++
          const progress = `[${completed}/${total}]`

          if (delay > 0) {
            const color = delay < 200 ? chalk.green : delay < 800 ? chalk.yellow : chalk.red
            console.log(`${chalk.gray(progress)} ${chalk.cyan(name)}: ${color(delay + 'ms')}`)
            results.push({ name, delay })
          } else {
            console.log(`${chalk.gray(progress)} ${chalk.cyan(name)}: ${chalk.red('超时')}`)
            results.push({ name, delay: 99999 })
          }
        } catch (err) {
          completed++
          results.push({ name, delay: 99999 })
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()))

    console.log(chalk.bold.blue('\n=== 测速结果 (Top 5) ==='))
    results.sort((a, b) => a.delay - b.delay)
    results.slice(0, 5).forEach((r, i) => {
      let delayInfo
      if (r.delay === 99999) {
        delayInfo = chalk.red('超时')
      } else {
        const color = r.delay < 200 ? chalk.green : r.delay < 800 ? chalk.yellow : chalk.red
        delayInfo = color(`${r.delay}ms`)
      }
      console.log(`${chalk.gray(i + 1 + '.')} ${chalk.bold(r.name)}: ${delayInfo}`)
    })
  } catch (err) {
    console.error(err.message)
  }
}
