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

  $addProfile.click(getPetProfile);
  $('tbody').on('click', '.removeButton' , removeContact);
  $('div').on('click', '.browse', showMatches);
  $('div').on('click', '.myProfile', showProfile);
  $('div').on('click', '.like', postLike);
  $('div').on('click', '.dislike', postDislike);
});

//Function for clicking on Find Your Mate button
function showMatches() {
  $('.profile').hide();
  $('.petPool').show();
  $form.hide();
}

//Function for clicking on My Profile button
function showProfile() {
  $('.profile').show();
  $('.petPool').hide();
  $form.hide();
}

if (fb.getAuth()) {
  $('.login').remove();
  $('.app').toggleClass('hidden');

  $.get(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/profile.json', function(data){
    if(data !== null) {
      Object.keys(data).forEach(function(uuid) {
        addProfileToTable(uuid, data[uuid]);
        showPetDiv();
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

//Creates table of user profile with uuid data attribute
function addProfileToTable(uuid, pet) {
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

//Posts pet profile to table
function getPetProfile(event) {
  event.preventDefault();

  var $name       = $('.name').val(),
      $sex        = $('.sex').val(),
      $location   = $('.location').val(),
      $occupation = $('.occupation').val(),
      $photo      = $('.photo').val();

  var profile = {name: $name, sex: $sex, location: $location, occupation: $occupation, photo: $photo};
  var data = JSON.stringify(profile);
  $.post(FIREBASE_URL + '/users/' + fb.getAuth().uid + 'profile.json', data, function(res){
    addProfileToTable(res.name, profile);
  });
  $form.hide();
  $addProfile.hide();
  $newProfile.show();
}

//Removes pet profile from table
function removeContact(evt) {
  var $tr = $(evt.target).closest('tr');
  $tr.remove();
  var uuid = $tr.data('uuid');
  var url = FIREBASE_URL + '/users/' + fb.getAuth().uid + '/profile/' + uuid + '.json';
  $.ajax(url, {type: "DELETE"});
}

//Creates div of other pets in database
function getMatch(login, pet) {
  var $petDiv = $('<div class="pet"><img class="petPhoto" src="' + pet.photo +
                  '"><div class="petName">' + pet.name +
                  '</div><div class="petSex">' + pet.sex +
                  '</div><div class="petLocation">' + pet.location +
                  '</div><div class="petOccupation">' + pet.occupation +
                  '</div><button class="like">Like</button><button class="dislike">Dislike</button></div>');
  $petDiv.attr('data-uuid', login);
  $('.petPool').append($petDiv);
  console.log('from getMatch function:')
  console.log(pet);
}

//Displays div of other pets in database
function showPetDiv() {
  $.get(FIREBASE_URL + '/users.json', function (data) {
    Object.keys(data).forEach(function (login) {
      getMatch(login, data[login].profile);
      console.log('from showPetDiv function:');
      console.log(data[login].profile);
    });
  });
}

//Send like to "Like" database on click
function postLike(event) {
  event.preventDefault();

  var like = $('.pet').data('uuid'),
      data = JSON.stringify(like);
  $.post(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/data/likes.json', data, function () {
  });
}

//Send dislike to "Dislikes" database on click
function postDislike(event) {
  event.preventDefault();

  var dislike = $('.pet').data('uuid'),
      data    = JSON.stringify(dislike);
      console.log(dislike);
  $.post(FIREBASE_URL + '/users/' + fb.getAuth().uid + '/data/dislikes.json', data, function (res) {
  });
}
