'use strict'
import LedgerBridge from './LedgerBridge'
(async () => {
  const bridge = new LedgerBridge()
  window.bridge = bridge;
  window.onclick = function () {
    window.bridge.unlock();
  }
})()
console.log('Mina < = > Ledger Bridge initialized!!')
