
export const BotHelper = {
  getFullName(user) {
    return `${user.first_name} ${user.last_name || ''}`;
  }
};
