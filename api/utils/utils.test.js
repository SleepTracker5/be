const {
  errDetail,
  sanitizeUser,
  validateTime,
  randRange,
  isIterable,
} = require("./utils");

describe("the utils suite", () => {
  test("isIterable correctly identifies iterable data", () => {
    const isIterableData = isIterable([1, 2, 3]);
    expect(isIterableData).toBe(true);
  });

  test("isIterable works with falsey data", () => {
    const isIterableData = isIterable(undefined);
    expect(isIterableData).toBe(false);
  });

  test("randRange returns a number in the range", () => {
    const randNum = randRange(1, 1);
    expect(randNum).toBe(1);
    const randNums = randRange(1, 2);
    expect([1, 2].includes(randNums)).toBe(true);
  });

  test("randRange works with negative numbers", () => {
    const randNum = randRange(-1, -1);
    expect(randNum).toBe(-1);
    const randNums = randRange(-1, 2);
    expect([-1, 0, 1, 2].includes(randNums)).toBe(true);
  });

  test("validateTime formats as intended", () => {
    const timeToValidate = "12/21/2020 6:10 AM";
    const validatedTime = validateTime(timeToValidate);
    expect(validatedTime).toBe("1608549000000");
  });

  test("validateTime handles numeric input", () => {
    // Handle time as a string
    const numToValidate = "1608549000000";
    const validatedNum = validateTime(numToValidate);
    expect(validatedNum).toBe("1608549000000");
  });

  test("sanitizerUser removes the password property", () => {
    const testObj = { username: "testUser", password: "password" };
    const sanitized = sanitizeUser(testObj);
    expect(sanitized.password).not.toBeDefined();
  });

  test("sanitizerUser has no effect on the other properties", () => {
    const testObj = { username: "testUser", password: "password" };
    const sanitized = sanitizeUser(testObj);
    expect(sanitized.password).not.toBeDefined();
    expect(sanitized.username).toBe(testObj.username);
  });

  test("errDetail returns the expected shape", done => {
    // Mocked res Express object

    const res = {
      body: {
        message: "",
        validation: [],
        data: null,
      },
      code: null,
      status(status) {
        this.code = status;
        return this;
      },
      send(payload) {
        this.body.data = payload;
      },
      json(payload) {
        this.body.data = payload;
      },
    };

    const expectedErr = {
      message: "There was a problem completing the required operation",
      validation: [],
      data: {},
    };
    const err = new Error("There was a testing error");

    errDetail(res, err);
    expect(res.code).toBe(500);
    expect(res.code).not.toBe(200);
    expect(res.body.data).toEqual(expectedErr);
    done();
  });
});
