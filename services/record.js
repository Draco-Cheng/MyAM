var controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js')
};


var logger = require('../controller/logger.js');


exports.delRecord = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.delRecordTypeMap(data);
    await controller.dbController.delRecord(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.getRecord = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getRecord(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.setRecord = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.setRecord(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.setRecordTypes = async function(data) {
  try {
    await controller.dbFile.checkDB(data);

    await controller.dbController.connectDB(data);
    await controller.dbController.getRecordTypeMap(data);

    //parse what we need to add and what have to delete
    data.tids_add = data.tids_json.map(i => {
      return parseInt(i)
    })
    data.tids_del = [];
    data.resault.forEach(_obj => {
      if (parseInt(_obj.rid) == data.rid) {
        var _index = data.tids_add.indexOf(_obj.tid);
        if (_index === -1)
          data.tids_del.push(_obj.tid);
        else
          delete data.tids_add[_index]
      }
    })

    data.tids_add = data.tids_add.filter(i => {
      return i !== undefined
    });

    await controller.dbController.setRecordTypeMap(data);
    await controller.dbController.closeDB(data);

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.getRecordTypes = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getRecordTypeMap(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}
