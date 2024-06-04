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

class Heapstats {
  constructor({
    window = {},
    tail = false,
    test = null,
    drawPlotOnTestState = ['failed'], // add 'passed' to always draw
  } = {}) {
    this.window = window
    this.tail = tail
    this.drawPlotOnTestState = drawPlotOnTestState
    this.snapshots = [this.getV8HeapStatisticsMB()]

    // @TODO use polymorphism (class TailingHeaps extends ..)
    if (this.tail) {
      suspendOut()
      this.observeGC(() => this.update().redrawPlot())
    } else {
      this.observeGC(() => this.update())
    }

    if (test)
      this._drawPlotWhenTestStateChanges(test)

    this.update()
  }

  // public
  // for recording a single execution
  async sample(cb) {
    this.update()

    const result = await cb()

    this.update()

    return result
  }

  // supposedly private,
  // but expose it in case user wants a report before end..
  stats() {
    return {
      snapshots: this.snapshots,
      plot: plot(this._getStats()),
      ...this._getStats()
    }
  }

  // private
  redrawPlot() {
    singleLineLog.stdout(plot(this.stats()))
  }

  // private
  exitTailMode() {
    this.disconnectGCObserver()
    restoreOut()
  }

  // private
  update() {
    this.snapshots.push(this.getV8HeapStatisticsMB())

    return this
  }

  // private
  disconnectGCObserver() {
    this.observer.disconnect()

    return this
  }

  observeGC(cb) {
    this.observer = new PerformanceObserver(() => cb())
    this.observer.observe({ entryTypes: ['gc'] })

    return this
  }

  _getStats() {
    const used_heap_sizes = this.snapshots.map(stat => stat.used_heap_size_mb)

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

  getV8HeapStatisticsMB() {
    return Object.entries(v8.getHeapStatistics())
      .reduce((acc, item) => ({
        ...acc,
        [item[0]] : item[1],
        [item[0] + '_mb']: Heapstats.bytesToMB(item[1])
      }), {})
  }

  _drawPlotWhenTestStateChanges(ctx) {
    const test = ctx.currentTest || ctx.test
    const self = this
    const title = test.title

    // This is messing with Mochas internals;
    // Mocha sets a `ctx.state = 'failed' or 'passed'` when the test ends,
    // so we set a setter on that property it to observe and infer it's ending
    // no other reliable way to detect when the test ends
    Object.defineProperty(test, 'state', {
      configurable: true,
      get: function() {
        return this._state
      },

      set: function(state) {
        this._state = state

        try {
          if (self.drawPlotOnTestState.includes(state))
            setImmediate(() => {
              console.log(plot({
                title: state ? `Test: "${title}" has ${state}` : title,
                failed: state === 'failed',
                ...self.stats()
              }))
            }, 0)
        } catch (err) {
          console.error(err)

          throw err
        }
      }
    })
  }

  static bytesToMB(bytes = 0) {
    return bytes / 1000 / 1000
  }
}

const window = {
  columns: (process.stdout.columns || 130) - 25,
  rows: (process.stdout.rows || 40) - 25
}

if (process.argv.some(arg => arg.includes('--heapstats'))) {
  new Heapstats({ tail: true, window })
}

export default opts => new Heapstats({
  tail: opts?.tail || false, window, ...opts
})
