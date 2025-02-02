// message.test.ts
import message from "../Events/message";
import Message from "../models/message";
import Channel from "../models/channels";
import User from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

jest.mock("../models/message");
jest.mock("../models/channels");
jest.mock("../models/user");

describe("message function", () => {
  let fakeSocket: Partial<Socket>;
  let fakeCallback: jest.Mock;

  beforeEach(() => {
    process.env.JWT_SECRET = "secret";

    fakeSocket = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    fakeCallback = jest.fn();

    jest.clearAllMocks();
  });

  it("devrait appeler le callback avec une erreur si l'utilisateur n'existe pas", async () => {
    const token = "fakeToken";
    const conversationId = "channel1";
    const content = "Hello";
    const data = { token, conversationId, content, files: [] };

    (jest.spyOn(jwt, "verify") as jest.Mock).mockReturnValue({ id: "user1" } as JwtPayload);


    (Channel.findOne as jest.Mock).mockResolvedValue({ _id: conversationId, users: [] });

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await message(data, fakeCallback, fakeSocket as Socket);

    expect(fakeCallback).toHaveBeenCalledWith({
      success: false,
      message: "User does not exist",
    });
  });

  it("devrait appeler le callback avec une erreur si le channel n'existe pas", async () => {
    const token = "fakeToken";
    const conversationId = "channel1";
    const content = "Hello";
    const data = { token, conversationId, content, files: [] };

    (jest.spyOn(jwt, "verify")as jest.Mock).mockReturnValue({ id: "user1" } as JwtPayload);

    (Channel.findOne as jest.Mock).mockResolvedValue(null);

    (User.findOne as jest.Mock).mockResolvedValue({
      _id: "user1",
      username: "Alice",
      socketId: "socket1",
    });

    await message(data, fakeCallback, fakeSocket as Socket);

    expect(fakeCallback).toHaveBeenCalledWith({
      success: false,
      message: "Channel does not exist",
    });
  });

  it("devrait sauvegarder le message, appeler le callback avec succès et émettre le message aux clients", async () => {
    const token = "fakeToken";
    const conversationId = "channel1";
    const content = "Hello";
    const data = { token, conversationId, content, files: [] };

    const decoded = { id: "user1" };
    (jest.spyOn(jwt, "verify")as jest.Mock).mockReturnValue(decoded as JwtPayload);

    const fakeChannel = { _id: conversationId, users: ["user1", "user2"] };
    (Channel.findOne as jest.Mock).mockResolvedValue(fakeChannel);

    const fakeSender = { _id: "user1", username: "Alice", socketId: "socket1" };
    const fakeReceiver = { _id: "user2", username: "Bob", socketId: "socket2" };
    (User.findOne as jest.Mock).mockImplementation(({ _id }: { _id: string }) => {
      if (_id === "user1") return Promise.resolve(fakeSender);
      if (_id === "user2") return Promise.resolve(fakeReceiver);
      return Promise.resolve(null);
    });

    const fakeSave = jest.fn().mockResolvedValue(undefined);
    const fakeMessageInstance = {
      _id: "message1",
      save: fakeSave,
      channel: fakeChannel,
      conversationsId: conversationId,
      sender: decoded.id,
      text: content,
      timestamp: new Date(),
      img: fakeSender.username,
    };

    (Message as unknown as jest.Mock).mockImplementation(() => fakeMessageInstance);

    await message(data, fakeCallback, fakeSocket as Socket);

    expect(fakeSave).toHaveBeenCalled();
    expect(fakeCallback).toHaveBeenCalledWith({
      success: true,
      message: "Message sent",
    });

    expect(fakeSocket.to).toHaveBeenCalledWith(fakeReceiver.socketId);
    expect(fakeSocket.emit).toHaveBeenCalledWith("message", expect.objectContaining({
      _id: "message1",
      text: content,
      sender: decoded.id,
      conversationsId: conversationId,
      img: fakeSender.username,
      timestamp: expect.any(Date),
    }));
  });
});
