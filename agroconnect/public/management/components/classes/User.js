// User.js

class User {
    constructor(userId, username, password, role) {
      this.userId = userId;
      this.username = username;
      this.password = password;
      this.role = role;
    }
  
    static createUser(username, password, role) {
      // Create a new user instance
      return new User(Date.now(), username, password, role);
    }
  
    static removeUser(users, userId) {
      // Remove user by userId
      return users.filter(user => user.userId !== userId);
    }
  
    static updateUser(users, userId, updatedUser) {
      // Find and update user by userId
      return users.map(user => (user.userId === userId ? { ...user, ...updatedUser } : user));
    }
  }
  
  export default User;
  