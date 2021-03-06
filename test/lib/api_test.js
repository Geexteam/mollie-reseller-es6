"use strict";
require('should');
const {wrap} = require('co');
const {readFile} = require('fs');
const {join} = require('path');
const API = require('../../lib/api');

describe('API', function () {
    const test_keys = require('../test_keys.json');
    const test_users = require('../test_users.json');
    const api = new API(test_keys);

    let check = 0;

    beforeEach(function () {
        check = 0;
    });

    describe('Statics', function () {
        describe('.stringToEncodedURI', function () {
            it('Should return a String', function () {
                const result = API.stringToEncodedURI('foo');
                result.should.be.a.String();
            });

            it('Should change a String in the correct way', function () {
                const result = API.stringToEncodedURI("t_e.s~t*p'a(s)s!");
                result.should.equal('t_e.s%7et%2ap%27a%28s%29s%21');
            });
        });

        describe('.getLegalForms', function () {
            it('Should return an array of Objects', function () {
                const result = API.getLegalForms();

                result.should.be.an.Array();
                result[1].should.be.an.Object();
            });

            it('Should contain Objects with a key and value properties', function () {
                const result = API.getLegalForms();

                const result_length = result.length;
                for(let i = 0; i < result_length; i++) {
                    const obj = result[i];
                    obj.should.have.property('key');
                    obj.should.have.property('value');
                }

            });
        });
    });

    describe('Object', function () {

        describe('Constructor', function () {
            const reseller_api = new API(test_keys);

            describe('Basics', function () {
                it('Should be an Object', function () {
                    reseller_api.should.be.an.Object;
                });
            });

            describe('Errors', function () {
                it('An Object should be thrown with property error', function () {
                    try {
                        new API();
                        check = 1;
                    } catch (error) {
                        error.should.be.an.Object();
                        error.should.have.property('error', 'Not all required keys are given');
                        check = 2;
                    }
                    check.should.equal(2);
                });

                it('Should throw an error if no partner_id is given', function () {
                    try {
                        new API({profile_key: 'test', secret: 'test'});
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error', 'Not all required keys are given');
                        check = 2;
                    }
                    check.should.equal(2);
                });

                it('Should throw an error if no profile_key is given', function () {
                    try {
                        new API({partner_id: 'test', secret: 'test'});
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error', 'Not all required keys are given');
                        check = 2;
                    }
                    check.should.equal(2);
                });

                it('Should throw an error if no secret is given', function () {
                    try {
                        new API({profile_key: 'test', partner_id: 'test'});
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error', 'Not all required keys are given');
                        check = 2;
                    }
                    check.should.equal(2);
                });
            });

            describe('Success', function () {
                it('Should return an Object', function () {
                    api.should.be.a.Object();
                });

                it('Should have basic properties', function () {
                    api.should.have.property('partner_id', test_keys.partner_id);
                    api.should.have.property('profile_key', test_keys.profile_key);
                    api.should.have.property('secret', test_keys.secret);
                    api.should.have.property('api_start', '/api/reseller/v1/');
                });

                it('Should have functions', function () {
                    // accountValid
                    api.should.have.property('accountValid');
                    api.accountValid.should.be.a.Function();

                    // generateBasicDataObject
                    api.should.have.property('generateBasicDataObject');
                    api.generateBasicDataObject.should.be.a.Function();
                });
            });
        });

        describe('.generateBasicDataObject', function () {
            it('Should return an Object', function () {
                const result = api.generateBasicDataObject();
                result.should.be.an.Object();
            });

            it('Should have basic data properties', function () {
                const result = api.generateBasicDataObject();
                result.should.have.property('partner_id', api.partner_id);
                result.should.have.property('profile_key', api.profile_key);
                result.should.have.property('timestamp');
            });
        });

        describe('.accountClaim', function () {
            describe('Error', function () {

                it('Should throw an error if something goes wrong', wrap(function *() {
                    try {
                        yield api.accountClaim();
                        check = 1
                    } catch (error) {
                        check = 2
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if no username is given', wrap(function *() {
                    try {
                        yield api.accountClaim(null, 'fake_password');
                        check = 1
                    } catch (error) {
                        error.should.have.property('error', 'No username or password supplied');
                        check = 2
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if no password is given', wrap(function *() {
                    try {
                        yield api.accountClaim('fake_username', null);
                        check = 1
                    } catch (error) {
                        error.should.have.property('error', 'No username or password supplied');
                        check = 2
                    }
                    check.should.equal(2);
                }));
            });

            describe('Success', function () {
                it('Should not throw an error if an unknown account is given', wrap(function *() {
                    try {
                        const result = yield api.accountClaim('fake_username', 'fake_password');

                        result.should.be.an.Object();
                        result.success.should.equal(false);

                        check = 1
                    } catch (error) {
                        check = 2
                    }
                    check.should.equal(1);
                }));
            });
        });

        describe('.accountValid', function () {
            describe('Error', function () {
                it('Should throw an error if something goes wrong', wrap(function *() {
                    try {
                        yield api.accountValid();
                        check = 1
                    } catch (error) {
                        check = 2
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if no username is given', wrap(function *() {
                    try {
                        yield api.accountValid(null, 'fake_password');
                        check = 1
                    } catch (error) {
                        error.should.have.property('error', 'No username or password supplied');
                        check = 2
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if no password is given', wrap(function *() {
                    try {
                        yield api.accountValid('fake_username', null);
                        check = 1
                    } catch (error) {
                        error.should.have.property('error', 'No username or password supplied');
                        check = 2
                    }
                    check.should.equal(2);
                }));
            });

            describe('Success', function () {
                it('Should return an Object', wrap(function *() {
                    try {
                        const result = yield api.accountValid(test_users.username, test_users.password);
                        result.should.be.an.Object();
                        check = 1
                    } catch (error) {
                        error.should.have.property('error', 'No username or password supplied');
                        check = 2
                    }
                    check.should.equal(1);
                }));
            });
        });

        describe('.profiles', function () {
            describe('Error', function () {
                it('Should throw an error if something goes wrong', wrap(function *() {
                    try {
                        yield api.profiles();
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if a username, but no password is given', wrap(function *() {
                    try {
                        yield api.profiles({username: 'username'});
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(2);
                }));

                it('Should throw an error if a password, but no usernameis given', wrap(function *() {
                    try {
                        yield api.profiles({password: 'password'});
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(2);
                }));
            });

            describe('Success', function () {
                it('Should not throw an error if both a username and password are given', wrap(function *() {
                    try {
                        const result = yield api.profiles({
                            username: test_users.sub_username,
                            password: test_users.sub_password
                        });

                        result.should.be.an.Object();

                        check = 1;
                    } catch (error) {
                        console.log(error);
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(1);
                }));

                it('Should not throw an error if only partner_id_customer is given', wrap(function *() {
                    try {
                        const result = yield api.profiles({
                            partner_id_customer: test_users.partner_id_customer
                        });

                        result.should.be.an.Object();

                        check = 1;
                    } catch (error) {
                        console.log(error);
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(1);
                }));

                it('Should not throw an error if an unconnected or nonexistent account is given', wrap(function *() {
                    try {
                        const result = yield api.profiles({
                            username: 'JOHN',
                            password: 'CENA!!!!!!'
                        });

                        result.should.be.an.Object();

                        check = 1;
                    } catch (error) {
                        console.log(error);
                        error.should.have.property('error');
                        check = 2;
                    }
                    check.should.equal(1);
                }));
            });
        });

        describe('.parseResponse', function () {
            let xml = '';

            before(function (done) {
                readFile(join(__dirname, '../response.txt'), function (err, result) {
                    xml = result.toString();
                    done();
                });
            });

            describe('Error', function () {
                it('Should throw an error if something goes wrong', function () {
                    try {
                        API.parseResponse();
                        check = 1
                    } catch (error) {
                        check = 2
                    }
                    check.should.equal(2);
                });

                it('Error should be an Object with property error', function () {
                    try {
                        API.parseResponse();
                        check = 1
                    } catch (error) {
                        error.should.be.an.Object();
                        error.should.have.property('error');
                        check = 2
                    }
                    check.should.equal(2);
                });

                it('Should throw an error if anything but a string is given', function () {
                    try {
                        API.parseResponse(1);
                        check = 1;
                    } catch (error) {
                        error.should.have.property('error', 'Response is not a String');
                        check = 2;
                    }
                    check.should.equal(2);

                    try {
                        API.parseResponse(true);
                        check = 3;
                    } catch (error) {
                        error.should.have.property('error', 'Response is not a String');
                        check = 4;
                    }
                    check.should.equal(4);

                    try {
                        API.parseResponse(function () {
                        });
                        check = 5;
                    } catch (error) {
                        error.should.have.property('error', 'Response is not a String');
                        check = 6;
                    }
                    check.should.equal(6);
                });
            });

            describe('Success', function () {
                it('Should return an Object', function () {
                    try {
                        const result = API.parseResponse(xml);
                        result.should.be.an.Object();
                        check = 1;
                    } catch (error) {
                        check = 2;
                    }
                    check.should.equal(1);
                });

                it('Should at least have properties "success" and "resultcode"', function () {
                    try {
                        const result = API.parseResponse(xml);
                        result.should.have.property('success');
                        result.should.have.property('resultcode');
                        check = 1;
                    } catch (error) {
                        check = 2;
                    }
                    check.should.equal(1);
                });

                it('Should cast the String, Boolean- and Integer values to Booleans and Integers', function () {
                    try {
                        const result = API.parseResponse(xml);

                        result.success.should.be.a.Boolean();
                        result.resultcode.should.be.a.Number();
                        result.resultmessage.should.be.a.String();
                        check = 1;
                    } catch (error) {
                        check = 2;
                    }
                    check.should.equal(1);
                });
            });
        });
    });
});
