/* jshint mocha: true, expr: true, strict: false */

describe('test suite', function () {
  it('should assert true', function () {
    true.should.be.true;
    false.should.be.false;
  });
});

describe('DOM', function () {
  describe('div', function(){
    beforeEach(function() {
      if (window.__karma__) {
        $('body').append('<div class=".candidatePool"></div>');
      }
    });
    beforeEach(function() {
      $('div').empty();
    });
  });

  describe('animal object', function () {
    it('should have property', function () {
      var animal = { location: 'Nashville', name: 'Felix', occupation: 'nurse', sex: 'Male' };
      expect(animal).to.have.property('location');
    });
  });

});

