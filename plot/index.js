import asciichart from 'asciichart'
import plot from './plot.js'

const bytesToMB = bytes => Math.ceil((bytes / 1024) / 1024)

// discard equal points if they are next to each other; consecutive.
// i.e:
// - `[1, 3, 3, 4, 4, 4, 1, 3]` becomes `[1, 3, 4, 1, 3]`
// - we always make sure we keep first/last elements
const areEqualConsecutive = (point, i, arr) => i == 0 || point !== arr[i - 1]

export default class Plot {
  constructor({ initial = 0, window }) {
    this.window = window

    this.snapshots = []
    this.initial = bytesToMB(initial)
    this.current = 0
  }

  update({ snapshots, current, percentageIncrease }) {
    this.snapshots = snapshots.map(bytesToMB).filter(areEqualConsecutive)
    this.current = bytesToMB(current)
    this.percentageIncrease = percentageIncrease

    return this
  }

  end() {
    return this
  }

  generate(opts) {
    opts = opts || {}
    const colors = typeof opts.colors !== 'undefined' ? opts.colors : true

    return process.env.ENV_CI ? '+'.repeat(1000) : plot(this.snapshots, {
      title: (opts.parent ? opts.parent.title : opts.title) || 'Heap size',
      sublabels: [ 'Heap alloc. size diff: '+ this.percentageIncrease +'%' ],
      lineLabels: [ 'heap size' ],
      xLabel: 'GC Cycles: ' + this.snapshots.length,
      yLabels: [
        'Cur: ' + this.current + ' MB',
        'Max: ' + Math.max(...this.snapshots) + ' MB'
      ],
      xStartLabel: 'Initial: ' + this.initial + ' MB',
      min: 1,
      max: Math.ceil(20 + this.current * 1.25),
      margin: 1,
      height: this.window.rows,
      width: this.window.columns,
      hideXLabel: true,
      colors: [ opts.state === 'failed' ? asciichart.red : asciichart.green ]
    })
  }
}
