function get(url, scb, type = 'GET') {
  var success = !scb
    ? function (res) {
      if (res.data === 'success') {
        location.reload();
      }
    }
    : scb;

  $.ajax({
    url: url,
    type: type,
    success: success,
    err: function (res) {
      alert(res);
    }
  })
}

function bindEvent() {
  $('#start-job-btn').click(function () {
    get('/job/start');
  });

  $('#stop-job-btn').click(function () {
    get('/job/stop');
  });

  $('#del-sure-btn').click(function () {
    get('/log', null, 'DELETE');
  });

  $('.show-log-btn').click(function () {
    // 1. change button text
    var name = $(this).text();
    $('.dropdown-toggle').html(name + '  <span class="caret"></span>');

    // 2. get data and reload page
    var url = $(this).attr('data-url');
    get(url, function (res) {
      var content = res.data;

      if (content.producer) {
        $('div.producer').attr('hidden', false);
        $('pre.producer').html(content.producer);
      } else {
        $('div.producer').attr('hidden', true);
      }

      if (content.customer) {
        $('div.customer').attr('hidden', false);
        $('pre.customer').html(content.customer);
      } else {
        $('div.customer').attr('hidden', true);
      }
    })
  })
}

function initLogTable() {
  var producerContent = $('pre.producer').html();
  if (producerContent === '') {
    $('div.producer').attr('hidden', true);
  }

  var customerContent = $('pre.customer').html();
  if (customerContent === '') {
    $('div.customer').attr('hidden', true);
  }
}

$(document).ready(function () {
  bindEvent();
  initLogTable();
});