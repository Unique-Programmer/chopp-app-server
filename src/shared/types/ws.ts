import { WS_MESSAGE_TYPE } from "../enums";

export type ActiveSocket = {
    socketId: string;
    userId: number;
}

export type WsMessage<T> = {
    type: WS_MESSAGE_TYPE; 
    payload: T
}