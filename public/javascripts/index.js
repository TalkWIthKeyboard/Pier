// 1. Replenish html.
function configGenerator(config, name, type) {
  var _type = type ? 'text' : 'choose';

  config[_type].push({
    name: name,
    type: _type,
    id: 'info-' + name.toLowerCase()
  })
}

function textCreator(config, name) {
  configGenerator(config, name, true);
}

function chooseCreator(config, name) {
  configGenerator(config, name, false);
}

function textHtmlCreator(obj) {
  return '<div class="form-group"> ' +
    '<div class="form-group form-group-sm"> ' +
    '<label class="col-sm-3 control-label">' + obj.name + '</label> ' +
    '<div class="col-sm-8"> ' +
    '<input type="text" class="form-control" aria-describedby="basic-addon1" id="' + obj.id + '"> ' +
    '</div> ' +
    '</div> ' +
    '</div>';
}

function chooseHtmlCreator(list) {
  var str = '<div class="form-group"> ' +
    '<div class="form-group form-group-sm form-choose"> ';

  for (let index in list) {
    str += '<label class="checkbox-inline"> ' +
      '<input type="checkbox" id="'+ list[index].id +'" checked>' + list[index].name +
      '</label>'
  }

  str += '</div></div>';
  return str;
}

var textNameList = ['Name', 'Depth', 'Container', 'NameDisplay', 'FileNameContains', 'NameStatsMsSql', 'Title'];
var chooseNameList = ['FileNameContainsFilter', 'DisplayUI', 'HasBuildNumber', 'DetailFromLogs',
  'InsertStatsMsSql', 'InsertDocDb', 'InsertSql', 'InsertKusto', 'Enable', 'JustDuration'];

function replenishHtml() {
  var config = {
    text: [],
    choose: []
  };

  // defined
  for (let index in textNameList) {
    textCreator(config, textNameList[index])
  }

  for (let index in chooseNameList) {
    chooseCreator(config, chooseNameList[index])
  }

  var appendStr = '';

  for (let index in config.text) {
    appendStr += textHtmlCreator(config.text[index]);
  }
  
  var index = 0;
  while (index < config.choose.length) {
    var end = index + 4 <= config.choose.length ? index + 4 : config.choose.length;
    appendStr += chooseHtmlCreator(config.choose.slice(index, end));
    index += 4;
  }

  $('.form-horizontal').append(appendStr);
  $('.form-horizontal').append(
    '<div class="modal-footer"> ' +
    '<button type="button" class="btn btn-default" data-dismiss="modal" style="float: right; margin-left: 20px"> CLOSE ' +
    '</button> ' +
    '<button type="button" id="create-update-btn" class="btn btn-primary" style="float: right"> SURE' +
    '</button> ' +
    '</div>')
}


// 2. Bind event
function initTable() {
  for (let key in textNameList) {
    var lowKey = textNameList[key].toLowerCase();
    var id = '#info-' + lowKey;
    $(id).val('');
    $(id).attr('readonly', false);
  }

  for (let key in chooseNameList) {
    var lowKey = chooseNameList[key].toLowerCase();
    var id = '#info-' + lowKey;

    if (chooseNameList[key] !== 'HasBuildNumber' && chooseNameList[key] !== 'JustDuration') {
      $(id).prop('checked', true);
    } else {
      $(id).prop('checked', false);
    }

    $(id).removeAttr('onclick');
  }
}

function collectData(model) {
  for (let key in model)
    if (key !== 'name') {
      var id = '#info-' + key.toLowerCase();
      var type = $(id).attr('type');
      if (type === 'text') {
        model[key] = $(id).val();
      } else {
        model[key] = $(id).prop('checked') ? 1 : 0;
      }
    }

  delete model['name'];
  return model;
}


function tableBindData(data, readonly) {
  for (let key in data) {
    var lowKey = key.toLowerCase();
    var id = '#info-' + lowKey;

    if (typeof data[key] === 'string'
      || typeof data[key] === 'number'
      || !data[key]
    ) {
      $(id).val(data[key]);
      $(id).attr('readonly', readonly);
    } else {
      $(id).attr("checked", data[key]);
      if (readonly)
        $(id).attr('onclick', "return false");
    }

    $('#info-name').attr('readonly', true);
    $('#create-update-btn').attr('data-name', data['name']);
  }

  // change create btn to update btn
  if (!readonly) {
    $('#create-update-btn').unbind('click');
    $('#create-update-btn').click(function () {
      var putData = collectData(data);
      var name = $(this).attr('data-name');
      var url = '/env/' + name;
      $.ajax({
        url: url,
        type: 'PUT',
        dataType: "json",
        data: putData,
        success: function (res) {
          if (res.data === 'success') {
            location.reload();
          }
        },
        error: function (res) {
          alert('err: ' + res.err);
        }
      })
    })
  }
}

function getTableData(obj, readonly) {
  initTable();
  var objList = $(obj).parent().prevAll();
  var name = objList[objList.length - 1].innerHTML;
  var url = '/env/' + name;
  $.ajax({
    url: url,
    type: 'GET',
    success: function (res) {
      tableBindData(res.data, readonly);
    },
    error: function (res) {
      alert('err: ' + res.err);
    }
  })
}

function collectDataWithoutModel() {
  var modelList = {};
  var res = {};
  for (let key in textNameList) {
    var value = textNameList[key][0].toLowerCase()
      + textNameList[key].slice(1, textNameList[key].length);
    modelList['info-' + textNameList[key].toLowerCase()] = value;
  }

  for (let key in chooseNameList) {
    var value = chooseNameList[key][0].toLowerCase()
      + chooseNameList[key].slice(1, chooseNameList[key].length);
    modelList['info-' + chooseNameList[key].toLowerCase()] = value;
  }

  $(':text').each(function () {
    if (!!modelList[$(this).attr('id')])
      res[modelList[$(this).attr('id')]] = $(this).val();
  });

  $(':checkbox').each(function () {
    if (!!modelList[$(this).attr('id')])
      res[modelList[$(this).attr('id')]] = $(this).prop('checked') ? 1 : 0;
  });

  return res;
}


function bindEvent() {
  // 1. detail button
  $('.detail-button').click(function () {
    getTableData(this, true);
  });

  // 2. update button
  $('.update-button').click(function () {
    getTableData(this, false);
  });

  // 3. delete button
  $('.delete-button').click(function () {
    var objList = $(this).parent().prevAll();
    var url = '/env/' + objList[objList.length - 1].innerHTML;
    $('#delete-sure-button').attr('data-url', url);
  });

  $('#delete-sure-button').click(function () {
    var url = $(this).attr('data-url');
    $.ajax({
      url: url,
      type: 'DELETE',
      success: function (res) {
        if (res.data === 'success') {
          location.reload();
        }
      },
      error: function (res) {
        alert('err: ' + res.err);
      }
    })
  });

  // 4. create button
  $('#create-button').click(function () {
    initTable();
    $('#create-update-btn').unbind('click');
    $('#create-update-btn').click(function () {
      var putData = collectDataWithoutModel();
      $.ajax({
        url: '/env',
        type: 'POST',
        dataType: "json",
        data: putData,
        success: function (res) {
          if (res.data === 'success') {
            location.reload();
          }
        },
        error: function (res) {
          alert('err: ' + res.err);
        }
      })
    })
  });
}

$(document).ready(function () {
  replenishHtml();
  bindEvent();
});