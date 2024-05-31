// V8/Oilpan Stats Collector
// Collects heap statistics from Garbage Collection compaction cycles
//
// Authors: Nik Kyriakides
// @nicholaswmin

import v8 from 'node:v8'
import vm from 'node:vm'
import { PerformanceObserver } from 'node:perf_hooks'
import singleLineLog from 'single-line-log'

import { suspendOut, restoreOut }  from './src/suspend-out/index.js'
import plot from './src/plot/index.js'

v8.setFlagsFromString('--expose-gc')
global.gc = vm.runInNewContext('gc')

class Memstat {
  constructor({ tail = false, window = {} } = {}) {
    this.tail = tail
    this.window = window
    this.stopped = false

    this.stats = [v8.getHeapStatistics()]

    if (this.tail) {
      suspendOut()
      this.observeGC(() => this.update().redrawPlot())
    }
    this.update()
  }

  // for time-based recording
  record() {
    this.throwIfCannotStart()
    this.observeGC(() => this.update())
  }

  // public
  // for recording a single execution
  async sample(cb) {
    this.update()

    const result = await cb()

    this.update()

    return result
  }

  // public
  end(ctx) {
    this.disconnectGCObserver()

    global.gc()

    // in case we're in a Mocha test,
    // we want to draw the plot on the *next event loop*
    // since at this point we don't know if the test has passed/failed
    // because it has not ended yet
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
      stats: this.stats,
      plot: plot(this._getStats())
    }
  }

  // private
  redrawPlot() {
    singleLineLog.stdout(plot(this._getStats()))
  }

  exitTailMode() {
    this.disconnectGCObserver()
    restoreOut()
  }

  // private
  schedulePlotDraw(test) {
    setTimeout(() => {
      if (!['failed'].includes(test.state))
        return

      console.log(plot({
        title: `Test: ${test.parent ? test.parent.title : test.title}`,
        failed: test?.state === 'failed',
        ...this._getStats()
      }))
    })
  }

  // private
  update() {
    this.stats.push(v8.getHeapStatistics())

    return this
  }

  // private
  disconnectGCObserver() {
    if (this.observer)
      this.observer.disconnect()
  }

  observeGC(cb) {
    this.observer = new PerformanceObserver(() => cb())
    this.observer.observe({ entryTypes: ['gc'] })
  }

  _getStats() {
    const used_heap_sizes = this.stats.map(stat => stat.used_heap_size)

    return {
      points: used_heap_sizes,
      initial: used_heap_sizes[0],
      width: this.window.columns,
      height: this.window.rows,
      current: used_heap_sizes[used_heap_sizes.length - 1],
      increasePercentage: this.calcPercDifference(
        used_heap_sizes[0],
        used_heap_sizes[used_heap_sizes.length - 1]
      ),
      max: Math.max(...used_heap_sizes)
    }
  }

  calcPercDifference(a, b) {
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
      throw new Error('Cannot restart a stopped instance. Create a new one.')
  }
}

const window = {
  columns: process.stdout.columns - 25,
  rows: process.stdout.rows - 20
}

if (process.argv.some(arg => arg.includes('--memstat'))) {
  new Memstat({ tail: true, window })
}

export default opts => new Memstat({
  tail: opts?.tail || false, window, ...opts
})
