const fs = require("fs")
const path = require("path")
const toString = require("lodash/toString")
const isPlainObject = require("lodash/isPlainObject")

const convertPath = (filePath) => {
  if (path.isAbsolute(filePath)) return filePath
  return path.join(process.cwd(), filePath)
}

const getTemplateFilePath = ({ templatePath, template = "html5bp" }) => {
  if (templatePath) return templatePath
  return path.resolve(path.join(__dirname, "..", "templates", template))
}

const readBodyOrFile = (body, filePath) => {
  if (body) {
    return toString(body)
  }
  if (!filePath) {
    return
  }
  if (fs.statSync(filePath).isDirectory()) {
    return
  }
  return fs.readFileSync(convertPath(filePath), "utf-8")
}

const convertIncludes = (includes) => {
  if (!includes || !Array.isArray(includes)) return []

  return includes.map((include) => {
    if (typeof include === "string") {
      return {
        type: path.extname(include).replace(".", ""),
        filePath: include,
      }
    }
    if (isPlainObject(include)) {
      return include
    }
  })
}


module.exports = {
  readBodyOrFile,
  convertPath,
  convertIncludes,
  getTemplateFilePath,
}
