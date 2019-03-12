const assert = require('assert');
const { fpmc, Func, init } = require("fpmc-jssdk");
init({ mode: 'DEV', appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

describe('Function', () => {
  it('test', async () => {
    try {
      const ret = await new Func('test.foo').invoke()
      assert(true)
    } catch (error) {
      throw error
    }
  })
})