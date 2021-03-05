'use strict';

const Ajv = require('ajv');
const conf_schema = require('../r2epub.schema.json');

class MyAjv {
    constructor() {
        this.validator = ajv.compile(conf_schema);
    }

    validate(data) {
        return this.validator(data);
    }

    errors() {
        return this.validator.errors;
    }
}



module.exports = { MyAjv };
