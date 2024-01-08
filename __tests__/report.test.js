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

  //   it("db error should res 500", async () => {
  //     const mockRes = mockResponse();
  //     globalDB.query.mockRejectedValue("Rejected");
  //     await ticket.create(
  //       {
  //         body: {
  //           UserID: null,
  //           TrackID: null,
  //           InventoryTypeID: 1,
  //           Sticker: null,
  //           SerialNo: null,
  //           TrackTopic: "hello",
  //           TrackDescription: null,
  //           ContactDetail: "00000000000",
  //         },
  //         tokenData: { UserID: 888 },
  //       },
  //       mockRes
  //     );

  //     expect(mockRes.status).toHaveBeenCalledWith(500);
  //   });
  //   it("ticket create happy flow", async () => {
  //     const mockRes = mockResponse();
  //     globalDB.query.mockResolvedValue([{ InsertedId: 999 }]);
  //     await ticket.create(
  //       {
  //         body: {
  //           UserID: null,
  //           TrackID: null,
  //           InventoryTypeID: 1,
  //           Sticker: null,
  //           SerialNo: null,
  //           TrackTopic: "hello",
  //           TrackDescription: null,
  //           ContactDetail: "00000000000",
  //         },
  //         tokenData: { UserID: 888 },
  //       },
  //       mockRes
  //     );

  //     expect(mockRes.status).toHaveBeenCalledWith(200);
  //   });
});
