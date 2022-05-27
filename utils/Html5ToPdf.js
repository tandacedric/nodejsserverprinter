const puppeteer = require("puppeteer")
const pickBy = require("lodash/pickBy")
const {
  readBodyOrFile,
  convertPath,
  getTemplateFilePath,
  convertIncludes,
} = require("./util")
const successlog = require('../utils/logger').successlog

class Html5ToPdf {

  constructor(options) {
    if(options && options!=null)this.options =  this.parseOptions(options)
  }
  
  setOptions(options){
    this.options = this.parseOptions(options)
  }

  parseOptions(options) {
    const {
      inputBody,
      inputFileName,
      inputPath,
      outputPath,
      templateUrl,
      renderDelay,
      launchOptions,
      include = [],
      basePath,
    } = options
    const legacyOptions = options.options || {}
    const pdf = pickBy(
      options.pdf || {
        landscape: legacyOptions.landscape,
        format: legacyOptions.pageSize,
        printBackground: legacyOptions.printBackground,
      },
    )
    if (!pdf.path && outputPath) {
      pdf.path = convertPath(outputPath)
    }
    const templatePath = getTemplateFilePath(options)
    const body = inputBody
    //const body = readBodyOrFile(inputBody, inputPath)
    return {
      body,
      pdf,
      inputPath,
      templatePath,
      templateUrl,
      launchOptions,
      include: convertIncludes(include),
      renderDelay,
      inputFileName,
      basePath,
    }
  }

  includeAssets(page, options) {
    const includePromises = options.include.map(({ type, filePath }) => {
      if (type === "js") {
        return page.addScriptTag({
          path: filePath,
        })
      }
      if (type === "css") {
        return page.addStyleTag({
          path: filePath,
        })
      }
    })
    includePromises.push(() => {
      return page.addStyleTag({
        path: getTemplateFilePath("pdf.css"),
      })
    })
    includePromises.push(() => {
      return page.addStyleTag({
        path: getTemplateFilePath("highlight.css"),
      })
    })
    return Promise.all(includePromises)
  }
  async init(launchOptions){
    //successlog.info(`Try to start puppeter at ${(new Date()).toLocaleDateString()}`)
    this.browser = await puppeteer.launch(launchOptions)
    //successlog.info(`Puppeter started at ${(new Date()).toLocaleDateString()}`)

  }

  async process(opts) {
    let options = this.parseOptions(opts)
    successlog.info(`Enter process ${(new Date()).toLocaleDateString()}`)

    let page = await this.browser.newPage()
    successlog.info(`Create new Page ${(new Date()).toLocaleDateString()}`)
    console.log("url", `${options.basePath}/${options.inputFileName}`)
    await page.goto(`${options.basePath}/${options.inputFileName}`, {
      waitUntil: "networkidle0",
      //timeout:0
    })
    if (options.body && /^\s*<html>/.test(options.body)) {
      await page.setContent(options.body, {
        waitUntil: "networkidle0",
      })
    } else if (options.body) {
      await page.evaluate((body) => {
        document.querySelector("body").innerHTML = body
      }, options.body)
    }
    successlog.info(`Wait until networkidle0 ${(new Date()).toLocaleDateString()}`)
    //successlog.info(`Wait until networkidle2 ${(new Date()).toLocaleDateString()}`)

    //await this.includeAssets(options)
    //successlog.info(`Wait include asset ${(new Date()).toLocaleDateString()}`)

    if (options.renderDelay) {
      await page.waitFor(options.renderDelay)
      successlog.info(`Wait after Render delay ${renderDelay} => ${(new Date()).toLocaleDateString()}`)

    }
    successlog.info(`Wait after create pdf ${(new Date()).toLocaleDateString()}`)

    const buf = await page.pdf(options.pdf)
    successlog.info(`Create pdf ${(new Date()).toLocaleDateString()}`)

    if (!options.pdf.path) {
      await page.close()
      successlog.info(`Close Page ${(new Date()).toLocaleDateString()}`)

      return buf
    }else{
      await page.close()
      return null
    }
  }

  async close() {
    successlog.info(`Printer will close at ${(new Date()).toLocaleDateString()}`)

    await this.browser.close()
    successlog.info(`Printer closed at ${(new Date()).toLocaleDateString()}`)

  }
}
const  printer = new Html5ToPdf()
printer.init({})
successlog.info(`Printer init at ${(new Date()).toLocaleDateString()}`)
module.exports = printer

//module.exports =  Html5ToPdf


