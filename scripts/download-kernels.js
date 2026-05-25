import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import axios from 'axios'
import { DEFAULT_BUNDLED_TARGETS, KERNEL_TARGETS } from '../lib/kernel-platforms.js'
import { packagePath } from '../lib/paths.js'

const MIHOMO_VERSION_URL = 'https://github.com/MetaCubeX/mihomo/releases/latest/download/version.txt'

function getTargets() {
  const targets = process.argv.slice(2)
  return targets.length > 0 ? targets : DEFAULT_BUNDLED_TARGETS
}

async function downloadFile(url, dest) {
  const tmp = `${dest}.tmp`
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout: 60 * 1000,
  })

  await pipeline(response.data, fs.createWriteStream(tmp))
  fs.renameSync(tmp, dest)
}

async function main() {
  const kernelsDir = packagePath('kernels')
  fs.mkdirSync(kernelsDir, { recursive: true })

  const { data } = await axios.get(MIHOMO_VERSION_URL, { timeout: 30 * 1000 })
  const version = data.trim()
  const targets = getTargets()
  const manifest = {
    version,
    targets: [],
  }

  console.log(`Mihomo version: ${version}`)

  for (const key of targets) {
    const target = KERNEL_TARGETS[key]
    if (!target) {
      throw new Error(`Unknown kernel target: ${key}`)
    }

    const filename = `${target.assetName}-${version}.${target.archiveExt}`
    const url = `https://github.com/MetaCubeX/mihomo/releases/download/${version}/${filename}`
    const dest = path.join(kernelsDir, filename)
    const oldFiles = fs
      .readdirSync(kernelsDir)
      .filter(file => file.startsWith(`${target.assetName}-`) && file.endsWith(`.${target.archiveExt}`) && file !== filename)

    for (const oldFile of oldFiles) {
      fs.unlinkSync(path.join(kernelsDir, oldFile))
    }

    if (fs.existsSync(dest)) {
      console.log(`skip ${filename}`)
    } else {
      console.log(`download ${filename}`)
      await downloadFile(url, dest)
    }

    manifest.targets.push({ key, filename })
  }

  fs.writeFileSync(path.join(kernelsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`kernel assets ready: ${kernelsDir}`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
