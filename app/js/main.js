'use strict';

var FIREBASE_URL = 'https://petmate.firebaseio.com',
    $form        = $('.contacts-form'),
    $newProfile  = $('.newProfile'),
    $addProfile  = $('.addProfile'),
    fb           = new Firebase(FIREBASE_URL);

$(document).ready(function () {
  $newProfile.click(function() {
    $form.show();
    $addProfile.show();
    $newProfile.hide();
  });

  $addProfile.click(getContact);
  $('tbody').on('click', '.removeButton' , removeContact);
});

if (fb.getAuth()) {
  $('.login').remove();
  $('.app').toggleClass('hidden');

  $.get(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/profile.json', function(data){
    if(data !== null) {
      Object.keys(data).forEach(function(uuid) {
        addContactToTable(uuid, data[uuid]);
        console.log(data);
        _.forEach(data, getMatch(uuid, data[uuid]));
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

function addContactToTable(uuid, pet) {
  var $tr = $('<tr><td class="image"><img class="image" src="' + pet.photo +
             '"></td><td class="name">' + pet.name +
              '</td><td class="sex">' + pet.sex +
              '</td><td class="location">' + pet.location +
              '</td><td class="occupation">' + pet.occupation +
             '</td><td><button class="removeButton">Remove</button></td></tr>');

  $tr.attr('data-uuid', uuid);
  $('.target').append($tr);
  $('.contacts-form').trigger('reset');

}

function getContact(event) {
  event.preventDefault();

  var $name    = $('.name').val(),
      $sex = $('.sex').val(),
      $location   = $('.location').val(),
      $occupation   = $('.occupation').val(),
      $photo   = $('.photo').val();

  var contact = {name: $name, sex: $sex, location: $location, occupation: $occupation, photo: $photo};
  var data = JSON.stringify(contact);
  $.post(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/profile.json', data, function(res){
    addContactToTable(res.name, contact);
    getMatch(res.name, contact);
  });
  $form.hide();
  $addProfile.hide();
  $newProfile.show();
}

function removeContact(evt) {
  var $tr = $(evt.target).closest('tr');
  $tr.remove();
  var uuid = $tr.data('uuid');
  var url = FIREBASE_URL + '/users/' + fb.getAuth().uid + '/profile/' + uuid + '.json';
  $.ajax(url, {type: "DELETE"});
}

function getMatch(uuid, pet) {
  var $petDiv = $('<div class="pet"><img class="petPhoto" src="' + pet.photo +
                  '"><div class="petName">' + pet.name +
                  '</div><div class="petSex">' + pet.sex +
                  '</div><div class="petLocation">' + pet.location +
                  '</div><div class="petOccupation">' + pet.occupation +
                  '</div><button class="like">Like</button><button class="dislike">Dislike</button></div>');

  $petDiv.attr('data-uuid', uuid);
  $('.petPool').append($petDiv);

}


