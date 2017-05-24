var controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js')
};

var logger = require('../controller/logger.js');

exports.getTypes = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getTypes(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.setTypes = async function(data) {
  try {
    await controller.dbFile.checkDB(data);

    await controller.dbController.connectDB(data);

    if (data.tid)
      await controller.dbController.getTypes(data);

    if (!data.tid || data.resault.length !== 0)
      await controller.dbController.setTypes(data);

    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.delTypes = async function(data) {
  try {

    let _delTid = data['meta']['del_tid'];

    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    //*****************************
    // check record dependency
    const _tempData = {
      db: data.db,
      reqId: data.reqId,
      tid: _delTid,
      limit: 1
    }

    await controller.dbController.getRecordTypeMap(_tempData);
    if (_tempData.resault.length) {
      data['error'] = {
        code: 424,
        message: 'RECORD_DEPENDENCIES'
      };
      return data;
    }

    //*****************************
    // unlink tid in TypeMaps
    data['meta'] = { del_tid: _delTid };
    await controller.dbController.delTypeMaps(data)


    await controller.dbController.delTypes(data);
    await controller.dbController.closeDB(data);

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.delTypeMaps = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.delTypeMaps(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.getTypeMaps = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getTypeMaps(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.setTypeMaps = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getTypeMaps(data);

    if (data['resault'].length === 0 && data.tid !== data.sub_tid)
      await controller.dbController.setTypeMaps(data);

    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}
