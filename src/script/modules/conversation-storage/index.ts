import settings from '../../lib/settings';
import Module from '../../lib/module';
import {
  getAllConversations,
  getSnapchatPublicUser,
  getFriends,
  getSnapchatStore,
} from '../../utils/snapchat';
import { logError } from '../../lib/debug';

function initializeUserInfo() {
  try {
    const store = getSnapchatStore();
    if (!store) {
      setTimeout(() => initializeUserInfo(), 1000);
      return;
    }

    const state = store.getState();
    if (!state?.auth?.userId) {
      setTimeout(() => initializeUserInfo(), 1000);
      return;
    }

    const userId = state.auth.userId;
    const userInfo = state.auth.me;

    if (userId) settings.setSetting('USER_ID', userId);
    if (userInfo) settings.setSetting('USER_INFO', userInfo);
  } catch (error) {
    logError('UserInfo: Error initializing, retrying...', error);
    setTimeout(() => initializeUserInfo(), 1000);
  }
}

async function setTagsInputData() {
  try {
    const GROUP_CHATS: Record<string, { conversation: { title: string } }> = getAllConversations();
    
    const groupChatTitles = Object.entries(GROUP_CHATS).reduce(
      (acc, [conversationId, chat]) => {
        if (chat.conversation.title) {
          const rawTitle = chat.conversation.title;
          const title = typeof rawTitle === 'string' ? rawTitle : (rawTitle as any)?.title || String(rawTitle);
          
          /**
           * BUG PREVENTION: Use both Group Name and a slice of the Unique ID.
           * This guarantees that even duplicate names like "AISM" become unique:
           * "AISM (a1b2)" vs "AISM (c3d4)"
           */
          const uniqueIdSuffix = conversationId.substring(0, 4);
          acc[conversationId] = `${title} (${uniqueIdSuffix})`;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const FRIENDS = getFriends();
    const selfUserId = settings.getSetting('USER_ID');
    const excludedUsernames = ['myai', 'snapchatai', 'teamsnapchat'];
    const users = [];

    for (const friend of FRIENDS) {
      const userId = friend.str;
      if (userId === selfUserId) continue;

      const user = await getSnapchatPublicUser(userId);
      if (!user) continue;
      
      const username = (user.mutable_username || user.username || "").toLowerCase();
      if (excludedUsernames.includes(username)) continue;

      users.push(user);
    }

    const totalChats = Object.keys(FRIENDS).length + Object.keys(GROUP_CHATS).length;
    const newData = {
      groupChatTitles: groupChatTitles,
      users: users,
      totalChats: totalChats,
    };

    // Save the unique data to settings
    settings.setSetting('STORED_CONVERSATIONS_NAMES', JSON.stringify(newData));
  } catch (err) {
    logError('setTagsInputData Error:', err);
  }
}

class StoreConversation extends Module {
  constructor() {
    super('Conversation Storage');
    settings.on('NTFY_ENABLED.setting:update', () => this.load());
    setTimeout(() => this.load(), 5000);
    initializeUserInfo();
  }

  load() {
    setTagsInputData();
  }
}

export default new StoreConversation();
