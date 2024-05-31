// V8/Oilpan Stats Collector
// Collects heap snapshots from Garbage Collection compaction cycles
//
// Authors: Nik Kyriakides
// @nicholaswmin

import v8 from 'node:v8'
import vm from 'node:vm'
import { setTimeout as sleep } from 'node:timers/promises'
import { PerformanceObserver } from 'node:perf_hooks'
import singleLineLog from 'single-line-log'

import { suspendIO, restoreIO }  from './src/process-io/index.js'
import Plot from './src/plot/index.js'

v8.setFlagsFromString('--expose-gc')
global.gc = vm.runInNewContext('gc')

class Memstat {
  constructor({ tail = false, window = {} } = {}) {
    this.tail = tail
    this.window = window
    this.stopped = false

    this.initial = v8.getHeapStatistics().used_heap_size
    this.snapshots = [this.initial]
    this.current = null

    this.plot = new Plot({
      initial: this.initial,
      tail: this.tail,
      window: this.window
    })

    if (this.tail) {
      suspendIO()
      this.observer = new PerformanceObserver(() => this.update().redrawPlot())
      this.observer.observe({ entryTypes: ['gc'] })
    }
    this.update()
  }

  // for time-based recording
  record() {
    this.throwIfCannotStart()
    this.observer = new PerformanceObserver(() => this.update())
    this.observer.observe({ entryTypes: ['gc'] })
  }

  // public
  // for recording a single execution
  async sample(cb) {
    this.update()

    const res = await cb()

    this.update()

    return res
  }

  // public
  end(ctx) {
    this.stop()

    if (this.plot)
      this.update().plot.end()

    global.gc()

    // draw on next event loop so test has a
    // to actually fail
    if (ctx?.test)
      this.schedulePlotDraw(ctx.test)

    return new Promise(resolve =>
      process.nextTick(() => resolve(this.getStats())))
  }

  // supposedly private,
  // but expose it in case user wants a report before end..
  getStats() {
    return {
      ...this._getStats(),
      plot: this.plot.generate()
    }
  }

  // private
  redrawPlot() {
    singleLineLog.stdout(this.plot.generate(this._getStats()))
  }

  exitTailMode() {
    this.stop()
    restoreIO()
  }

  // private
  schedulePlotDraw(test) {
    setTimeout(() => {
      if (!['failed'].includes(test.state))
        return

      console.log(this.plot.generate({
        ...test,
        ...this._getStats()
      }))
    })
  }

  // private
  update() {
    this.current = v8.getHeapStatistics().used_heap_size
    this.snapshots.push(this.current)
    this.plot.update(this._getStats())

    return this
  }

  // private
  stop() {
    if (this.observer)
      this.observer.disconnect()

  }

  // private
  // creates stats for internal-use, i.e:
  // plot drawing
  _getStats() {
    return {
      initial: this.initial,
      snapshots: [ ...this.snapshots ],
      current: this.current,
      max: Math.max(...this.snapshots),
      percentageIncrease: this.percDiffNum(this.initial, this.current)
    }
  }

  percDiffNum(a, b) {
    let percent

    if (b !== 0) {
      if (a !== 0) {
        percent = (b - a) / a * 100
      } else {
        percent = b * 100
      }
    } else {
      percent = - a * 100
    }

    return Math.floor(percent)
  }

  throwIfCannotStart() {
    if (this.stopped)
      throw new Error('Cannot restart a stopped memstart. Create a new one.')
  }
}

if (process.argv.some(arg => arg.includes('--memstat'))) {
  new Memstat({
    tail: true,
    window: {
      columns: process.stdout.columns - 25,
      rows: process.stdout.rows - 20
    }
  })
}

export default opts => new Memstat({
  tail: opts?.tail || false,
  window: {
    columns: process.stdout.columns - 25,
    rows: process.stdout.rows - 20
  },
  ...opts
})
