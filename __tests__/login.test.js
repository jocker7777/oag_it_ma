//require("../../connectdb");
const login = require("../controllers/auth-controllers");
const authen = require("../public/authen-middleware");
beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  global.globalDB = {
    promise: jest.fn().mockReturnThis(),
    query: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn(),
  };
};

describe("Login", () => {
  it("empty data should fail", async () => {
    const mockRes = mockResponse();
    await login.logIn({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("password not match data should fail", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          PersonID: "0000000000000",
          FirstNameEng: "test",
          LastNameEng: "test",
          Username: "test.t",
          Password: "0000000000000",
          ActiveStatus: 0,
        },
      ],
      [],
    ]);
    await login.logIn(
      {
        body: {
          username: "test.t",
          password: "xxxxxxxxx",
        },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("inactive user should res 401", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          PersonID: "0000000000000",
          FirstNameEng: "test",
          LastNameEng: "test",
          Username: "test.t",
          Password: "0000000000000",
          ActiveStatus: 1,
        },
      ],
      [],
    ]);
    await login.logIn(
      {
        body: {
          username: "test.t",
          password: "xxxxxxxxx",
        },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("password data currupt should fail", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          Username: "x",
          PersonID: "x",
          FirstNameEng: -1,
          ActiveStatus: 0,
        },
      ],
      [],
    ]);
    await login.logIn(
      {
        body: {
          username: "x",
          password: "xxxx",
        },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("db error should be res 500", async () => {
    const mockRes = mockResponse();
    jest.spyOn(console, "error").mockImplementation(() => {});
    globalDB.query.mockRejectedValue("db error");
    await login.logIn(
      {
        body: {
          username: "mockuser",
          password: "xxxx",
        },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("unexpected error should be res 500", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          PersonID: "0000000000000",
          FirstNameEng: "test",
          LastNameEng: "test",
          Username: "test.t",
          Password: "0000000000000",
          ActiveStatus: 0,
        },
      ],
      [],
    ]);
    const signToken = jest
      .spyOn(authen, "signToken")
      .mockImplementationOnce(() => {
        throw new Error("undexpect");
      });
    await login.logIn(
      {
        body: {
          username: "test.t",
          password: "tes000",
        },
      },
      mockRes
    );
    expect(signToken).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });

  it("broke user data should response 401", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          PersonID: null,
          PrefixID: null,
          PrefixName: null,
          FirstName: "test",
          LastName: "test",
          Password: "0000000000000",
          Role: 3,
          OfficeID: 198,
          PositionID: 22,
          PositionName: null,
          Email: null,
          Telephone: null,
          ActiveStatus: 0,
        },
      ],
      [],
    ]);
    await login.logIn(
      {
        body: {
          username: "test.t",
          password: "tes000",
        },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("Login happy flow", async () => {
    const mockRes = mockResponse();

    globalDB.query.mockResolvedValue([
      [
        {
          UserID: 1,
          PersonID: "0000000000000",
          PrefixID: null,
          PrefixName: null,
          FirstName: "test",
          LastName: "test",
          FirstNameEng: "test",
          LastNameEng: "test",
          Username: "test.t",
          Password: "0000000000000",
          Role: 3,
          OfficeID: 198,
          PositionID: 22,
          PositionName: null,
          Email: null,
          Telephone: null,
          ActiveStatus: 0,
        },
      ],
      [],
    ]);
    const signToken = jest.spyOn(authen, "signToken");
    await login.logIn(
      {
        body: {
          username: "test.t",
          password: "tes000",
        },
      },
      mockRes
    );
    expect(signToken).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.anything() })
    );
  });
});
