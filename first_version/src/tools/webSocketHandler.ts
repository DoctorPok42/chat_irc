import { socket } from "../index";

const emitEvent = (
  eventName: string,
  data: any,
  callback?: (data: any, error?: any) => void
) => {
  try {
    socket.on(eventName, (data: any) => {
      if (data.status === "success") {
        callback && callback(data);
      } else {
        if (callback && callback.length === 2) {
          callback && callback(data, data.message);
        }
        console.error(data.message);
      }
    });

    socket.emit(eventName, data, callback);
  } catch (error) {
    return null;
  }
};

export default emitEvent;
