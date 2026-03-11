module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "no-undef": "error",
        "semi": ["error", "always"],
        "quotes": ["warn", "single", { "avoidEscape": true }]
    },
    "globals": {
        // Known globals used in the legacy architecture
        "gsap": "readonly",
        "ScrollTrigger": "readonly"
    }
};
