const core = require('@actions/core')
const exec = require('@actions/exec')
const path = require('path')
const fs = require('fs')

const MAIN_FILE_PATH = './build/static/js/main.*.chunk.js'

async function run() {
  await exec.exec('yarn build', null, {
    ignoreReturnCode: true,
  })
  const { size: sizeInBytes } = fs.statSync(MAIN_FILE_PATH)
  const sizeInKiloBytes = sizeInBytes / 1000
  console.log(`Main bundle size: ${sizeInKiloBytes}KB`)
}

run()
