//require("../../connectdb");
const office = require("../controllers/office-controllers");
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

describe("Area", () => {
  it("Area happy flow", async () => {
    const mockRes = mockResponse();
    await office.area({}, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        { ProvinceID: 0, ProvinceName: "ต่างจังหวัด" },
        { ProvinceID: 1, ProvinceName: "กรุงเทพฯ" },
        { ProvinceID: 2, ProvinceName: "ทั้งหมด" },
      ])
    );
  });
  it("Area unexpect error", async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: undefined,
      end: jest.fn(),
    };
    await office.area({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});

describe("Section", () => {
  it("Section empty body should call with province 0", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 10,
          OfficeName: "สำนักงานคดีอัยการสูงสุด",
          OfficeNameCode: "สคอส.",
        },
      ],
      [],
    ]);
    await office.section({}, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [2, 0]);
    expect(mockRes.json).toHaveBeenCalled();
  });
});

describe("Section", () => {
  it("Section empty body should call with province 0", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 10,
          OfficeName: "สำนักงานคดีอัยการสูงสุด",
          OfficeNameCode: "สคอส.",
        },
      ],
      [],
    ]);
    await office.section({}, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [2, 0]);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it("Section variable type error should fail ", async () => {
    const mockRes = mockResponse();
    await office.section({ body: { ProvinceID: "kk" } }, mockRes);
    expect(globalDB.query).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("Section unexpect error should res 500 ", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: undefined,
      end: jest.fn(),
    };
    await office.section({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("Section db error should res 500 ", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("error");
    await office.section({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("Section happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 10,
          OfficeName: "สำนักงานคดีอัยการสูงสุด",
          OfficeNameCode: "สคอส.",
        },
      ],
      [],
    ]);
    await office.section({ body: { ProvinceID: 1 } }, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [2, 1]);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it("Section happy flow 2", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 10,
          OfficeName: "สำนักงานคดีอัยการสูงสุด",
          OfficeNameCode: "สคอส.",
        },
      ],
      [],
    ]);
    await office.section({ body: { ProvinceID: 2 } }, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [2, 2]);
    expect(mockRes.json).toHaveBeenCalled();
  });
});

describe("Office", () => {
  it("Office empty body should call with OfficeID 0", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 2,
          OfficeName: "สำนักงานอัยการพิเศษฝ่ายคดีอาญากรุงเทพใต้ 1",
          OfficeNameCode: "สฝอต",
        },
      ],
      [],
    ]);
    await office.office({}, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [0]);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it("Office variable type error should fail ", async () => {
    const mockRes = mockResponse();
    await office.office({ body: { OfficeID: "kk" } }, mockRes);
    expect(globalDB.query).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("Office unexpect error should res 500 ", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: undefined,
      end: jest.fn(),
    };
    await office.office({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("Office db error should res 500 ", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("error");
    await office.office({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("office happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([
      [
        {
          OfficeID: 1,
          OfficeName: "สำนักงานคดีอาญากรุงเทพใต้",
          OfficeNameCode: "สคอต.",
        },
        {
          OfficeID: 2,
          OfficeName: "สำนักงานอัยการพิเศษฝ่ายคดีอาญากรุงเทพใต้ 1",
          OfficeNameCode: "สฝอต",
        },
      ],
      [],
    ]);
    await office.office({ body: { OfficeID: 2 } }, mockRes);
    expect(globalDB.query).toHaveBeenCalledWith(expect.anything(), [2]);
    expect(mockRes.json).toHaveBeenCalled();
  });
});
