// Run in tail mode and observer a seesaw leak
// start with `node tail.js --memstat`

import { leaky } from '../../test/leaky.js'
import Memstat from '../../index.js'

setInterval(() => leaky({ mb: 25 }), 1 * 1000)
