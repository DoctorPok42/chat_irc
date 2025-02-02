import { Server, Socket } from "socket.io";
import startSocket from "../socket";

describe("startSocket", () => {
  let fakeIO: Partial<Server>;
  let fakeSocket: Partial<Socket> & { _handlers?: Record<string, Function> };
  let events: { [key: string]: jest.Mock };
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    events = {
      testEvent: jest.fn(),
      anotherEvent: jest.fn(),
    };

    fakeSocket = {
      on: jest.fn(),
      _handlers: {} as Record<string, Function>,
    };

    (fakeSocket.on as jest.Mock).mockImplementation((event: string, handler: Function) => {
      fakeSocket._handlers![event] = handler;
    });

    fakeIO = {
      on: jest.fn(),
    };

    (fakeIO.on as jest.Mock).mockImplementation((event: string, callback: Function) => {
      if (event === "connection") {
        callback(fakeSocket);
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devrait logguer 'a user connected' lors d'une connexion", () => {
    startSocket(fakeIO as Server, events);
    expect(consoleLogSpy).toHaveBeenCalledWith("a user connected");
  });

  it("devrait enregistrer un handler pour chaque événement défini dans events ainsi que pour 'disconnect'", () => {
    startSocket(fakeIO as Server, events);

    Object.keys(events).forEach((eventName) => {
      expect(fakeSocket.on).toHaveBeenCalledWith(eventName, expect.any(Function));
    });
    expect(fakeSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
  });

  it("devrait appeler le handler correspondant d'un événement personnalisé lors de sa réception", () => {
    startSocket(fakeIO as Server, events);

    const eventHandler = fakeSocket._handlers!["testEvent"];
    const dummyData = { message: "Hello" };
    const dummyCallback = jest.fn();

    eventHandler(dummyData, dummyCallback);

    expect(consoleLogSpy).toHaveBeenCalledWith("received testEvent");
    expect(events.testEvent).toHaveBeenCalledWith(dummyData, dummyCallback, fakeSocket);
  });

  it("devrait logguer 'user disconnected' lors de la déconnexion", () => {
    startSocket(fakeIO as Server, events);

    const disconnectHandler = fakeSocket._handlers!["disconnect"];
    disconnectHandler();

    expect(consoleLogSpy).toHaveBeenCalledWith("user disconnected");
  });
});
