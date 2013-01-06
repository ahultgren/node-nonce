var nonce = require('../lib/node-nonce');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['generate and validate valid nonce through express and GET'] = function (test) {
  var validate = nonce.verify('test'),
    req = {
      method: 'GET',
      user: 'test',
      query: {}
    },
    res = {},
    doneCount = 0;
  
  test.expect(4);

  nonce.use(function (req, res, nonceItem, next) {
    test.equal(req.user, nonceItem.data.user);
    next();
  });

  nonce.generate({ action: 'test', user: 'test' }, function (nonce) {
    test.equal(typeof nonce, typeof '', 'Type of nonce is not string');

    req.query.nonce = nonce;

    validate(req, res, function(err){
      test.equal(err instanceof Error, false, 'Validation should not throw an error');

      validate(req, res, function(err){
        test.equal(err instanceof Error, true, 'Validation 2 should throw an error');

        test.done();
      });
    });
  });
};

exports['generate and validate valid nonce through express and POST'] = function (test) {
  var validate = nonce.verify('test'),
    req = {
      method: 'POST',
      user: 'test',
      body: {}
    },
    res = {},
    doneCount = 0;
  
  test.expect(4);

  nonce.use(function (req, res, nonceItem, next) {
    test.equal(req.user, nonceItem.data.user);
    next();
  });

  nonce.generate({ action: 'test', user: 'test' }, function (nonce) {
    test.equal(typeof nonce, typeof '', 'Type of nonce is not string');

    req.body.nonce = nonce;

    validate(req, res, function(err){
      test.equal(err instanceof Error, false, 'Validation should not throw an error');

      validate(req, res, function(err){
        test.equal(err instanceof Error, true, 'Validation 2 should throw an error');

        test.done();
      });

      test.done();
    });
  });
};