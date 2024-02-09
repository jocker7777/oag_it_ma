const authen = require("../public/authen-middleware");

const fakeToken =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Gz7-ovZdlkMx6MhGtjlpjhr9-kOwEMCzCWBYyc0UYT8";
const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn(),
    next: jest.fn(),
  };
};

afterEach(() => {
  jest.clearAllMocks();
});

let token = "";
beforeAll(() => {});

describe("signToken", () => {
  it("no variable should fail", async () => {
    return authen.signToken().catch((e) => {
      expect(e).toMatchObject({ code: 500 });
    });
  });

  it("wrong expire should fail", async () => {
    return authen.signToken({}, "wrong").catch((e) => {
      expect(e).toMatchObject({ code: 500 });
    });
  });

  it("signToken happy flow", async () => {
    token = await authen.signToken({ Role: 1 });
    expect(typeof token).toBe("string");
  });
});

describe("verifytoken", () => {
  it("verifytoken no variable should be throw", async () => {
    return authen.verifyToken().catch((e) => {
      expect(typeof e).toBe("object");
    });
  });

  it("verifytoken fake token should be throw", async () => {
    return authen.verifyToken(fakeToken).catch((e) => {
      expect(typeof e).toBe("object");
    });
  });

  it("verifytoken Happy flow", async () => {
    const tokenData = await authen.verifyToken(token).catch((e) => {
      expect(e).not.toHaveBeenCalled();
    });
    expect(typeof tokenData).toBe("object");
    return tokenData;
  });
});

describe("permissionCheck", () => {
  it("empty role should fail 401", async () => {
    const mockExpress = {
      req: { headers: { authorization: `Bearer ${token}` } },
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      },
      next: jest.fn(),
    };
    authen.checkPermission(null)(
      mockExpress.req,
      mockExpress.res,
      mockExpress.next
    );
    expect(mockExpress.res.status).toHaveBeenCalledWith(401);
  });

  it("no token should fail 401", async () => {
    const mockExpress = {
      req: { body: {} },
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      },
      next: jest.fn(),
    };
    authen.checkPermission([])(
      mockExpress.req,
      mockExpress.res,
      mockExpress.next
    );
    expect(mockExpress.res.status).toHaveBeenCalledWith(401);
  });

  it("fake token should fail 401", async () => {
    const mockExpress = {
      req: {},
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      },
      next: jest.fn(),
    };
    authen.checkPermission([])(
      mockExpress.req,
      mockExpress.res,
      mockExpress.next
    );
    expect(mockExpress.res.status).toHaveBeenCalledWith(401);
  });

  it("role not match should fail 403", async () => {
    const mockExpress = {
      req: { headers: { authorization: `Bearer ${token}` } },
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      },
      next: jest.fn(),
    };
    authen.checkPermission([99])(
      mockExpress.req,
      mockExpress.res,
      mockExpress.next
    );
    expect(mockExpress.res.status).toHaveBeenCalledWith(403);
  });

  it("check role happy flow", async () => {
    const mockExpress = {
      req: { headers: { authorization: `Bearer ${token}` } },
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      },
      next: jest.fn(),
    };
    authen.checkPermission([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
      mockExpress.req,
      mockExpress.res,
      mockExpress.next
    );
    expect(mockExpress.next).toHaveBeenCalled();
  });
});

describe("LogTokenDecode", () => {
  it("no token should be false", async () => {
    const userID = await authen.LogTokenDecode();
    expect(userID).toBeFalsy();
  });

  it("token with no UserID should be null should", async () => {
    NoUserIDtoken = await authen.signToken({});
    const userID = await authen.LogTokenDecode(NoUserIDtoken);
    expect(userID).toBeNull();
  });

  it("token with UserID should return value", async () => {
    UserIDtoken = await authen.signToken({ UserID: 987909 });
    const userID = await authen.LogTokenDecode(UserIDtoken);
    expect(userID).toBe(987909);
  });
});
