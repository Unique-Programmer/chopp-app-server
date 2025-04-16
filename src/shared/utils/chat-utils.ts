import { User } from "src/users/users.model";
import { Chat } from "src/websockets/chats/chats.model";
import { ActiveSocket } from "../types";

export const getActiveRecipientsIds = (chat: Chat, user: User, activeSessions: ActiveSocket[]) => {
    const recipients = chat.users
        .filter((recipient) => recipient.id !== user.id)
        .map((recipient) => recipient.id);

    return activeSessions
        .filter((session) => recipients.includes(session.userId))
        .map((session) => session.socketId);
}