const ticket = require("../controllers/ticket-controllers");

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

describe("create", () => {
  it("empty data should res 400", async () => {
    const mockRes = mockResponse();
    await ticket.create({ body: {}, tokenData: { UserID: 888 } }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
  it("empty unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = mockResponse();
    await ticket.create({ tokenData: { UserID: 888 } }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.create(
      {
        body: {
          UserID: null,
          TrackID: null,
          InventoryTypeID: 1,
          Sticker: null,
          SerialNo: null,
          TrackTopic: "hello",
          TrackDescription: null,
          ContactDetail: "00000000000",
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("ticket create happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([{ InsertedId: 999 }]);
    await ticket.create(
      {
        body: {
          UserID: null,
          TrackID: null,
          InventoryTypeID: 1,
          Sticker: null,
          SerialNo: null,
          TrackTopic: "hello",
          TrackDescription: null,
          ContactDetail: "00000000000",
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe("update data", () => {
  it("empty data should res 400", async () => {
    const mockRes = mockResponse();
    await ticket.updateData({ body: {}, tokenData: { UserID: 888 } }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("empty unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue({});
    await ticket.updateData(undefined, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.updateData(
      {
        body: {
          UserID: null,
          TrackID: 999,
          InventoryTypeID: 1,
          Sticker: null,
          SerialNo: null,
          TrackTopic: "hello",
          TrackDescription: null,
          ContactDetail: "00000000000",
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("ticket updateData happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue({ affectedRows: 1 });
    await ticket.updateData(
      {
        body: {
          UserID: null,
          TrackID: 999,
          InventoryTypeID: 1,
          Sticker: null,
          SerialNo: null,
          TrackTopic: "hello",
          TrackDescription: null,
          ContactDetail: "00000000000",
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe("update status", () => {
  it("empty data should res 400", async () => {
    const mockRes = mockResponse();
    await ticket.updateStatus(
      { body: {}, tokenData: { UserID: 888 } },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("empty unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue({});
    await ticket.updateStatus(undefined, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.updateStatus(
      {
        body: {
          UserID: null,
          TrackID: 999,
          StatusID: 1,
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("ticket updateData happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([{ affectedRows: 1 }]);
    await ticket.updateStatus(
      {
        body: {
          UserID: 1,
          TrackID: 999,
          StatusID: 1,
        },
        tokenData: { UserID: 888 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe("ticket ownedlist", () => {
  it("empty token data should res 400", async () => {
    const mockRes = mockResponse();
    await ticket.ownedList({ body: {}, tokenData: {} }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("empty unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue({});
    await ticket.ownedList(undefined, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.ownedList(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("ownedList happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.ownedList(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});

describe("ticket list", () => {
  it("empty token data should res 400", async () => {
    const mockRes = mockResponse();
    await ticket.list({ body: {}, tokenData: {} }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("empty unexpect error should res 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue({});
    await ticket.list(undefined, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.list(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("list happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.list(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});

describe("ticket inventoryType", () => {
  it("empty unexpect error should res 500", async () => {
    //jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: undefined,
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.inventoryType({ body: {} }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.inventoryType(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("inventoryType happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.inventoryType(
      {
        body: {},
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});

describe("ticket status option", () => {
  it("db error should res 500", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockRejectedValue("Rejected");
    await ticket.trackStatus(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("unexpected error should res 500", async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.trackStatus(
      {
        body: {},
        tokenData: { UserID: 888, Role: 1 },
      },
      mockRes
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("status option happy flow", async () => {
    const mockRes = mockResponse();
    globalDB.query.mockResolvedValue([[], []]);
    await ticket.trackStatus(
      {
        body: {},
      },
      mockRes
    );
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});
