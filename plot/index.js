import asciichart from 'asciichart'
import singleLineLog from 'single-line-log'

import { suspendIO, restoreIO }  from './process-io.js'
import plot from './plot.js'

const bytesToMB = bytes => Math.ceil((bytes / 1024) / 1024)

// discard equal points if they are next to each other; consecutive.
// i.e:
// - `[1, 3, 3, 4, 4, 4, 1, 3]` becomes `[1, 3, 4, 1, 3]`
// - we always make sure we keep first/last elements
const areEqualConsecutive = (point, i, arr) => i == 0 || point !== arr[i - 1]

export default class Plot {
  constructor({ initial = 0, watch, window }) {
    this.watch = watch
    this.window = window

    this.snapshots = []
    this.initial = bytesToMB(initial)
    this.current = 0

    if (this.watch) {
      suspendIO()
      this.observer = new PerformanceObserver((list, entries) => {
        this.update()
      })

      this.observer.observe({ entryTypes: ['gc'] })
    }
  }

  update({ snapshots, current, percentageIncrease }) {
    this.snapshots = snapshots.map(bytesToMB).filter(areEqualConsecutive)
    this.current = bytesToMB(current)
    this.percentageIncrease = percentageIncrease

    if (this.watch)
      singleLineLog.stdout(this.generate({ current, snapshots }))

    return this
  }

  end() {
    if (this.watch) {
      restoreIO()
      this.observer.disconnect()
    }

    return this
  }

  generate(opts) {
    opts = opts || {}
    const colors = typeof opts.colors !== 'undefined' ? opts.colors : true

    return plot(this.snapshots, {
      title: (opts.parent ? opts.parent.title : opts.title) || 'Heap size',
      sublabels: [ 'Heap alloc. increased by: '+ this.percentageIncrease +'%' ],
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
      height: this.window.height,
      width: this.window.width,
      hideXLabel: true,
      colors: [ opts.state === 'failed' ? asciichart.red : asciichart.green ]
    })
  }
}
