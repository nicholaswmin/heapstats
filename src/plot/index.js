import asciichart from 'asciichart'
import plot from './plot.js'

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
  // @FIXME CI Github Actions fails when running asciichart.plot, why?
  return process.env.ENV_CI ? '+'.repeat(1000) : plot(points, {
    title: title,
    sublabels: width > 45 ?
      [ 'Heap increased: '+ increasePercentage +'%'.slice(0, 10) ] :
      [],
    lineLabels: [],
    xLabel: 'GC Cycles: ' + points.length,
    yLabels: [
      'Cur: ' + current.toFixed(2) + ' MB',
      'Max: ' + max.toFixed(2) + ' MB'
    ],
    xStartLabel: 'Initial: ' + initial.toFixed(2) + ' MB',
    hideXLabel: true,
    colors: [ failed ? asciichart.red : asciichart.green ],
    min: 1,
    max: Math.ceil(30 + initial * 1.5),
    margin: 1,
    width,
    height
  })
}
