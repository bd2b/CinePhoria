/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./src/jest.setup.ts'],
  testEnvironment: "jsdom",
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    // 🔁 Remplace les imports relatifs avec .js par leur équivalent sans extension
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/public/"
  ],
};