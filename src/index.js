const core = require('@actions/core')
const exec = require('@actions/exec')
const path = require('path')
const glob = require('glob')
const fs = require('fs')

const MAIN_FILE_PATH = './build/static/js/main.*.chunk.js'

async function run() {
  await exec.exec('yarn build', null, {
    ignoreReturnCode: true,
  })
  try {
    const [mainFile] = await new Promise(resolve => {
      glob(MAIN_FILE_PATH, null, (err, files) => {
        resolve(files)
      })
    })
    if (!mainFile) {
      throw Error('Main file not found')
    }
    const { size: sizeInBytes } = fs.statSync(mainFile)
    const sizeInKiloBytes = sizeInBytes / 1000
    console.log(`Main bundle size: ${sizeInKiloBytes}KB`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
