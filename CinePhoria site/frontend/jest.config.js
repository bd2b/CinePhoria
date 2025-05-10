/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./src/jest.setup.ts'],
  testEnvironment: "jsdom",
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};