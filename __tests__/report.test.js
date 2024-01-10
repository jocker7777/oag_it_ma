const report = require("../controllers/report-controllers");
beforeAll(async () => {
  jest.spyOn(console, "log").mockResolvedValue([]);
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

describe("access log", () => {
  it("empty data should res 400", async () => {
    const mockRes = mockResponse();
    await report.accessLog({ body: {} }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
  it("unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue([[], []]);
    await report.accessLog(
      {
        body: { StartDate: "01/01/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("database error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockRejectedValue("error");
    await report.accessLog(
      {
        body: { StartDate: "01/01/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("invalid date should res 400", async () => {
    const mockRes = mockResponse();
    await report.accessLog(
      {
        body: { StartDate: "xx/xx/2567", EndDate: "zz/zz/2567" },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("access log happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.accessLog(
      {
        body: { StartDate: "01/01/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});

describe("Report Search", () => {
  it("invalid date should res 400", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StartDate: "xx/xx/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("database error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockRejectedValue("error");
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567", EndDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("report search only start date should success", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
  });

  it("report search only StartDate or EndDate should success", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { EndDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { EndDate: "01/01/2567" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it("report search only StaffSearchWord should success", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StaffSearchWord: "ทดสอบ" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it("report search only StaffSearchWord should success", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StaffSearchWord: "ทดสอบ" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { StaffSearchWord: "%ชื่อ นามสกุล;" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it("report search only UserSearchWord should success", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { UserSearchWord: "ทดสอบ" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    jest.clearAllMocks();
    await report.reportSearch(
      {
        body: { UserSearchWord: "%ชื่อ นามสกุล;" },
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it("report search happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StartDate: "01/01/2567", EndDate: "31/12/2567" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    expect(mockRes.status).not.toHaveBeenCalled();
    jest.clearAllMocks();
    globalDB.query.mockResolvedValue([[], []]);
    await report.reportSearch(
      {
        body: { StaffSearchWord: "ทดสอบ", UserSearchWord: "ผู้ใช้งาน ครับ" },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
    expect(mockRes.status).not.toHaveBeenCalled();
    jest.clearAllMocks();
    globalDB.query.mockResolvedValue([[], []]);
    await report.accessLog(
      {
        body: {
          StartDate: "01/01/2566",
          EndDate: null,
          StaffSearchWord: "ทดสอบ",
          UserSearchWord: "ผู้ใช้งาน ครับ",
        },
        tokenData: { UserID: 888, Role: 2 },
      },
      mockRes
    );
  });
});
