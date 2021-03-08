/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const Ajv = require('ajv');
const conf_schema = require('../r2epub.schema.json');

class MyAjv {
    constructor() {
        this.ajv = new Ajv({ "allErrors" : true});
        this.validator = this.ajv.compile(conf_schema);
    }

    validate(data) {
        return this.validator(data);
    }

    errors() {
        return this.validator.errors;
    }
}



module.exports = { MyAjv };
