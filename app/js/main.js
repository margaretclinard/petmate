'use strict';

var FIREBASE_URL = 'https://petmate.firebaseio.com',
    $form        = $('.contacts-form'),
    $newContact  = $('.newContact'),
    $addContact  = $('.addContact'),
    fb           = new Firebase(FIREBASE_URL);

$(document).ready(function () {
  $newContact.click(function() {
    $form.show();
    $addContact.show();
    $newContact.hide();
  });

  $addContact.click(getContact);
  $('tbody').on('click', '.removeButton' , removeContact);
});

if (fb.getAuth()) {
  $('.login').remove();
  $('.app').toggleClass('hidden');

  $.get(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/data/dislikes.json', function(data){
    if(data !== null) {
      Object.keys(data).forEach(function(uuid) {
        addContactToTable(uuid, data[uuid]);
      });
    }
  });
}

$('.login input[type="button"]').click(function () {
  var $loginForm = $('.loginForm'),
      email      = $loginForm.find('[type="email"]').val(),
      pass       = $loginForm.find('[type="password"]').val(),
      data       = {email: email, password: pass};

  registerAndLogin(data, function (err, auth) {
    if (err) {
      $('.error').text(err);
    } else {
      location.reload(true);
    }
  });
});

$('.login form').submit(function(event){
  var $loginForm = $(event.target),
      email      = $loginForm.find('[type="email"]').val(),
      pass       = $loginForm.find('[type="password"]').val(),
      data       = {email: email, password: pass};

  event.preventDefault();

  fb.authWithPassword(data, function(err, auth) {
    if (err) {
      $('.error').text(err);
    } else {
      location.reload(true);
    }
  });
});

$('.logout').click(function (){
  fb.unauth();
  location.reload(true);
});

function registerAndLogin(obj, cb) {
  fb.createUser(obj, function(err) {
    if (!err) {
      fb.authWithPassword(obj, function (err, auth){
        if (!err) {
          cb(null, auth);
        } else {
          cb(err);
        }
      });
    } else {
      cb(err);
    }
  });
}

function addContactToTable(uuid, contact) {
  var $tr = $('<tr><td class="image"><img class="image" src="' + contact.photo +
             '"></td><td class="name">' + contact.name +
              '</td><td class="address">' + contact.address +
              '</td><td class="phone">' + contact.phone +
              '</td><td class="email">' + contact.email +
             '</td><td><button class="removeButton">Remove</button></td></tr>');
  $tr.attr('data-uuid', uuid);
  $('.target').append($tr);
  $('.contacts-form').trigger('reset');
}

function getContact(event) {
  event.preventDefault();

  var $name    = $('.name').val(),
      $address = $('.address').val(),
      $phone   = $('.phone').val(),
      $email   = $('.email').val(),
      $photo   = $('.photo').val();

  var contact = {name: $name, address: $address, phone: $phone, email: $email, photo: $photo};
  var data = JSON.stringify(contact);
  $.post(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/data/dislikes.json', data, function(res){
    console.log(res);
    addContactToTable(res.name, contact);
  });
  $form.hide();
  $addContact.hide();
  $newContact.show();
}

function removeContact(evt) {
  var $tr = $(evt.target).closest('tr');
  $tr.remove();
  var uuid = $tr.data('uuid');
  var url = FIREBASE_URL + '/users/' + fb.getAuth().uid + '/data/friends/' + uuid + '.json';
  $.ajax(url, {type: "DELETE"});
}


