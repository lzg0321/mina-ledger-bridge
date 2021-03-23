import Transport from "@ledgerhq/hw-transport-u2f";
import {MinaLedgerJS} from "mina-ledger-js";
export default class LedgerBridge {
  constructor() {
    this.addEventListeners();
  }
  addEventListeners () {
    window.addEventListener('message', async e => {
      if (e && e.data && e.data.target === 'LEDGER-IFRAME') {
        const { action, params } = e.data
        const replyAction = `${action}-reply`
        switch (action) {
          case 'ledger-unlock':
            this.unlock(replyAction)
            break
          case 'ledger-sign-payment':
            this.signPayment(replyAction, params.tx)
            break
          case 'ledger-sign-delegation':
            this.signDelegation(replyAction, params.tx)
            break
        }
      }
    }, false)
  }
  async makeApp () {
    try {
      console.log('make app')
      this.transport = await Transport.create()
      console.log('transport', this.transport)
      this.app = new MinaLedgerJS(this.transport)
      console.log('mina app', this.app)
    } catch (e) {
      console.log('LEDGER:::CREATE APP ERROR', e)
    }
  }
  cleanUp () {
    this.app = null
    this.transport.close()
  }
  async unlock (replyAction, hdPath) {
    try {
      await this.makeApp()
      const res = await this.app.getAddress(0)

      this.sendMessageToExtension({
        action: replyAction,
        success: true,
        payload: res,
      })

    } catch (err) {
      const e = this.ledgerErrToMessage(err)

      this.sendMessageToExtension({
        action: replyAction,
        success: false,
        payload: { error: e.toString() },
      })

    } finally {
      this.cleanUp()
    }
  }
  signDelegation() {

  }

  signPayment() {

  }
  sendMessageToExtension(msg) {
    window.parent.postMessage(msg, '*')
  }
  ledgerErrToMessage (err) {
    // todo need support usb error
    const isU2FError = (err) => !!err && !!(err).metaData
    const isStringError = (err) => typeof err === 'string'
    const isErrorWithId = (err) => err.hasOwnProperty('id') && err.hasOwnProperty('message')

    // https://developers.yubico.com/U2F/Libraries/Client_error_codes.html
    if (isU2FError(err)) {
      // Timeout
      if (err.metaData.code === 5) {
        return 'LEDGER_TIMEOUT'
      }

      return err.metaData.type
    }

    if (isStringError(err)) {
      // Wrong app logged into
      if (err.includes('6804')) {
        return 'LEDGER_WRONG_APP'
      }
      // Ledger locked
      if (err.includes('6801')) {
        return 'LEDGER_LOCKED'
      }

      return err
    }

    if (isErrorWithId(err)) {
      // Browser doesn't support U2F
      if (err.message.includes('U2F not supported')) {
        return 'U2F_NOT_SUPPORTED'
      }
    }

    // Other
    return err.toString()
  }

}