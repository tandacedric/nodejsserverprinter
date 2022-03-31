var express = require('express');
const HTML5ToPDF = require("html5-to-pdf")
const SequentialTaskQueue = require("sequential-task-queue")
const path = require("path")
const errorLog = require('../utils/logger').errorlog;
const successlog = require('../utils/logger').successlog;
var router = express.Router();
const html5ToPDF = new HTML5ToPDF();
var queue = new SequentialTaskQueue.SequentialTaskQueue();
var printNumber = 1;



/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('index', { title: 'Learndia Printer HTML5 to PDF' });
});
/* GET home page. */

var printNumber = 1;
router.post('/print', async (req, res, next) => {
  queue.push(async () => {
    printNumber++;
    let input = req.body.input;
    let size = req.body.size;
    let landscape = req.body.landscape;
    let displayHeaderFooter = req.body.displayHeaderFooter;
    let output = req.body.output;
    let renderDelay = req.body.renderDelay ? req.body.renderDelay : -1;
    const options = {
      inputPath: input,
      outputPath: decodeURIComponent(output),
      include: [
      ]
    };

    if (!!parseInt(displayHeaderFooter)) {
      var cssb = [];
      cssb.push('<style>');
      cssb.push(`.layout.horizontal,.layout.vertical{display:-ms-flexbox;display:-webkit-flex;display:flex}.layout.horizontal{-ms-flex-direction:row;-webkit-flex-direction:row;flex-direction:row}.layout.center,.layout.center-center{-ms-flex-align:center;-webkit-align-items:center;align-items:center}.layout.center-center,.layout.center-justified{-ms-flex-pack:center;-webkit-justify-content:center;justify-content:center}.flex{-ms-flex:1 1 .000000001px;-webkit-flex:1;flex:1;-webkit-flex-basis:.000000001px;flex-basis:.000000001px}.layout.center,.layout.center-center{-ms-flex-align:center;-webkit-align-items:center;align-items:center}.layout.start-justified{-ms-flex-pack:start;-webkit-justify-content:flex-start;justify-content:flex-start}.layout.center-center,.layout.center-justified{-ms-flex-pack:center;-webkit-justify-content:center;justify-content:center}.layout.end-justified{-ms-flex-pack:end;-webkit-justify-content:flex-end;justify-content:flex-end}.layout.around-justified{-ms-flex-pack:distribute;-webkit-justify-content:space-around;justify-content:space-around}.layout.justified{-ms-flex-pack:justify;-webkit-justify-content:space-between;justify-content:space-between}.flex,.flex-1{-ms-flex:1 1 .000000001px;-webkit-flex:1;flex:1;-webkit-flex-basis:.000000001px;flex-basis:.000000001px}`);
      cssb.push('</style>');

      const css = cssb.join('');

      options['pdf'] = {

        printBackground: true,
        //preferCSSPageSize: true,
        displayHeaderFooter: true,
        landscape: !!parseInt(landscape),
        format: size,
        footerTemplate: css + `<div class="layout horizontal center justified" style="margin-top:10px;padding:5px 35px 0;width:100%">
                          <span style="background-color:#2196f3">
                            <span style="font-size:10px">
                              www.learndia.com
                            </span>
                          </span>
                          <span style="font-size:10px" >Page <span class="pageNumber"></span> sur <span  class="totalPages"></span></span>
                        </div>`,
        headerTemplate: css + `<div class="layout horizontal  center justified"  style="padding:0 35px 5px;width:100%">
                          <span class="flex"></span>
                          <span><span style="font-size:10px" class="date"></span></span>
                        </div>`,
      };
    } else {
      options['options'] = {
        printBackground: true,
        landscape: !!parseInt(landscape),
        pageSize: size
      };
    }
    if (parseInt(renderDelay) > 0) options['renderDelay'] = parseInt(renderDelay);
    html5ToPDF.setOptions(options);

    try {
      await html5ToPDF.start();
      await html5ToPDF.build();
      await html5ToPDF.close();
      successlog.info(`Job number ${printNumber}: DONE  : ${JSON.stringify(options)}`);

    } catch (error) {
      errorLog.error(`Job number ${printNumber} ERROR: : ${JSON.stringify(options)} =>  ${JSON.stringify(error)}`);
      //console.error(error)
      //process.exitCode = 1
    } finally {
      //process.exit();
    }
    res.json({ title: 'print' });
  },{timeout: 10000});

});

module.exports = router;
