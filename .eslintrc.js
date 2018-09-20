module.exports = {
  extends: "airbnb-base/legacy",
  rules: {
    "quotes": ["error", "double", {"avoidEscape": true}],
    "vars-on-top": "off"
  },
  env: {
    "browser": true,
    "node": true,
  }
}
