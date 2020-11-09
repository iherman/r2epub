module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules" : {
        "no-console" : 0, // set it to 0 if it is o.k. to have console.log
        "@typescript-eslint/no-explicit-any" : 0,
        "no-constant-condition": [
            "error",
            {
                "checkLoops" : false
            }
        ],
        "indent" : [
            "error", 4
        ],
        "no-multi-spaces": [
            "error",
            {
                "exceptions": {
                    "VariableDeclarator": true,
                    "ImportDeclaration" : true
                }
            }
        ],
        "no-else-return": 0,
        "max-len": [
            "error",
            {
                "code": 150,
                "ignoreComments" : true,
                "ignoreUrls" : true,
                "ignoreStrings" : true,
                "ignoreTemplateLiterals" : true,
                "ignoreRegExpLiterals" : true
            }
        ],


    }
};
