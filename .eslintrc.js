module.exports = {
  extends: "airbnb-base/legacy",
  rules: {
    "quotes": ["error", "double", {"avoidEscape": true}],
  },
  env: {
    "browser": true,
    "node": true,
  }
}
