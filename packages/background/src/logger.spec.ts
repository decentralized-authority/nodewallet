import should from 'should';
import { Logger } from './logger';
import { timeout } from '@nodewallet/util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import escapeRegExp from 'lodash/escapeRegExp';
import { storageKeys } from '@nodewallet/constants';

dayjs.extend(utc);

const timestampPattStr = '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z';
const generateInfoLogPatt = (message: string) => new RegExp(`^info:\\s${escapeRegExp(message)}\\s.+${timestampPattStr}.+$`);
const generateErrorLogPatt = (message: string) => new RegExp(`^error:\\s${escapeRegExp(message)}\\s.+${timestampPattStr}.+$`);

describe('Logger', function() {

  let logger: Logger;

  beforeEach(function() {
    logger = new Logger();
  });

  describe('._checkLength()', function() {
    it('should remove the first element if the length is greater than the max', function() {
      const maxLogs = 5;
      logger._maxLogs = maxLogs;
      logger._logs = new Array(6)
        .fill(1)
        .map((_, i) => i.toString());
      logger._checkLength();
      logger._logs.length.should.equal(maxLogs);
      logger._logs[0].should.equal('1');
    });
  });

  describe('._save()', function() {
    it('should call storage.set() with the logs', async function() {
      let setCalled = false;
      const logs = ['0', '1', '2'];
      logger._logs = logs;
      let logsSavedToStorage: string[] = [];
      // @ts-ignore
      logger._storage = {
        set: async (obj)  => {
          const { [storageKeys.LOGS]: val } = obj;
          setCalled = true;
          logsSavedToStorage = val;
        },
      };
      logger._save();
      await timeout(0);
      setCalled.should.be.True();
      logsSavedToStorage.should.deepEqual(logs);
    });
  });

  describe('._getTimestamp()', function() {
    it('should return a timestamp in ISO format', function() {
      const timestamp = logger._getTimestamp();
      should(timestamp).be.a.String();
      should(timestamp).match(new RegExp(`^${timestampPattStr}$`));
    });
  });

  describe('.getLogs', function() {
    it('should return a copy of all available logs', function() {
      logger._logs = ['0', '1', '2'];
      const returnedLogs = logger.getLogs();
      should(returnedLogs).be.an.Array();
      returnedLogs.should.not.equal(logger._logs);
      returnedLogs.should.deepEqual(logger._logs);
    });
  });

  describe('.info()', function() {
    it('should add an info log to the logs', function() {
      const message = 'test info message';
      logger.info(message);
      logger._logs.length.should.equal(1);
      logger._logs[0].should.match(generateInfoLogPatt(message));
    });
  });

  describe('.error()', function() {
    it('should add an error log to the logs', function() {
      const message = 'test error message';
      logger.error(message);
      logger._logs.length.should.equal(1);
      logger._logs[0].should.match(generateErrorLogPatt(message));
    });
  });

  describe(`${Logger.events.INFO} event`, function() {
    it('should be emitted when .info() is called', async function() {
      const message = 'test info message';
      let eventEmitted = false;
      let emittedLog = '';
      logger.on(Logger.events.INFO, (log) => {
        eventEmitted = true;
        emittedLog = log;
      });
      logger.info(message);
      await timeout(0);
      eventEmitted.should.be.True();
      emittedLog.should.match(generateInfoLogPatt(message));
    });
  });

  describe(`${Logger.events.ERROR} event`, function() {
    it('should be emitted when .error() is called', async function() {
      const message = 'test error message';
      let eventEmitted = false;
      let emittedLog = '';
      logger.on(Logger.events.ERROR, (log) => {
        eventEmitted = true;
        emittedLog = log;
      });
      logger.error(message);
      await timeout(0);
      eventEmitted.should.be.True();
      emittedLog.should.match(generateErrorLogPatt(message));
    });
  });

});
