import asciichart from 'asciichart'
import plot from './plot.js'

const bytesToMB = bytes => (bytes / 1024 / 1024).toFixed(2)

export default ({
  points = [],
  initial = 0,
  current = 0,
  min = 1,
  max = 100,
  width = 60,
  height = 20,
  increasePercentage = 0,
  failed = false,
  title = 'Heap Allocation Timeline',
  colors = true
}) => {
  points = points.map(bytesToMB)

  // @FIXME CI Github Actions fails when running asciichart.plot, why?
  return process.env.ENV_CI ? '+'.repeat(1000) : plot(points, {
    title: title,
    sublabels: [ 'Heap alloc. size diff: '+ increasePercentage +'%' ],
    lineLabels: [ 'heap size' ],
    xLabel: 'GC Cycles: ' + points.length,
    yLabels: [
      'Cur: ' + bytesToMB(current) + ' MB',
      'Max: ' + bytesToMB(max) + ' MB'
    ],
    xStartLabel: 'Initial: ' + bytesToMB(initial) + ' MB',
    hideXLabel: true,
    colors: [ failed ? asciichart.red : asciichart.green ],
    min: 1,
    max: Math.ceil(30 + bytesToMB(initial) * 1.5),
    margin: 1,
    width,
    height
  })
}
